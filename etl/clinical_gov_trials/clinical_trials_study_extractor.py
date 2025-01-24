# ETL script
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.clinical_gov_models import (
    Base,
    Study,
    StudyCondition,
    StudyKeyword,
    StudyPhase,
    StudyArm,
    Intervention,
    Outcome,
    Participant,
    AdverseEvent,
    Contact,
    TimeSeriesData,
    Group,
)
from datetime import datetime

# Database configuration
DATABASE_URL = "postgresql://testuser:testpwd@localhost:5432/panacea"

# Create database engine and session
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)


def format_date(date_str):
    """
    Formats a date string to 'YYYY-MM-DD'. If the input is 'YYYY-MM', appends '-01'.
    If the input is 'YYYY', appends '-01-01'.
    """
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        pass
    try:
        return datetime.strptime(date_str, "%Y-%m").date()
    except ValueError:
        pass
    try:
        return datetime.strptime(date_str, "%Y").date()
    except ValueError:
        pass
    return None


class ClinicalTrialsETL:
    def __init__(self, base_url):
        self.base_url = base_url

    def extract(self, study_id):
        url = f"{self.base_url}/studies/{study_id}"
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"Failed to fetch study data for {study_id}. HTTP Status: {response.status_code}"
            )
        return response.json()

    def transform_study(self, data, session):
        study = Study(
            study_id=data["protocolSection"]["identificationModule"]["nctId"],
            brief_title=data["protocolSection"]["identificationModule"].get(
                "briefTitle"
            ),
            official_title=data["protocolSection"]["identificationModule"].get(
                "officialTitle"
            ),
            overall_status=data["protocolSection"]["statusModule"].get("overallStatus"),
            start_date=format_date(
                data["protocolSection"]["statusModule"]["startDateStruct"].get("date")
            ),
            completion_date=format_date(
                data["protocolSection"]["statusModule"]["completionDateStruct"].get(
                    "date"
                )
            ),
            primary_completion_date=format_date(
                data["protocolSection"]["statusModule"][
                    "primaryCompletionDateStruct"
                ].get("date")
            ),
            has_results=data.get("hasResults", False),
            organization=data["protocolSection"]["identificationModule"][
                "organization"
            ].get("fullName"),
            description=data["protocolSection"]["descriptionModule"].get(
                "detailedDescription"
            ),
        )
        session.merge(study)

    def transform_conditions(self, data, session, study_id):
        for condition in data["protocolSection"]["conditionsModule"].get(
            "conditions", []
        ):
            session.merge(StudyCondition(study_id=study_id, condition=condition))

    def transform_keywords(self, data, session, study_id):
        for keyword in data["protocolSection"]["conditionsModule"].get("keywords", []):
            session.merge(StudyKeyword(study_id=study_id, keyword=keyword))

    def transform_phases(self, data, session, study_id):
        for phase in data["protocolSection"]["designModule"].get("phases", []):
            session.merge(StudyPhase(study_id=study_id, phase=phase))

    def transform_study_arms(self, data, session, study_id):
        for arm in data["protocolSection"]["armsInterventionsModule"].get(
            "armGroups", []
        ):
            session.merge(
                StudyArm(
                    id=arm.get("id") if arm.get("id") else arm.get("label"),
                    study_id=study_id,
                    label=arm.get("label"),
                    type=arm.get("type"),
                    description=arm.get("description"),
                )
            )

    def transform_interventions(self, data, session, study_id):
        for intervention in data["protocolSection"]["armsInterventionsModule"].get(
            "interventions", []
        ):
            session.merge(
                Intervention(
                    id=intervention.get("id")
                    if intervention.get("id")
                    else intervention.get("name"),
                    study_id=study_id,
                    name=intervention.get("name"),
                    description=intervention.get("description"),
                    type=intervention.get("type"),
                )
            )

    def transform_outcomes(self, data, session, study_id):
        for outcome in (
            data["protocolSection"].get("outcomesModule", {}).get("primaryOutcomes", [])
        ):
            session.merge(
                Outcome(
                    id=outcome.get("id")
                    if outcome.get("id")
                    else outcome.get("measure"),
                    study_id=study_id,
                    type="PRIMARY",
                    measure=outcome.get("measure"),
                    time_frame=outcome.get("timeFrame"),
                )
            )

    def transform_adverse_events(self, data, session, study_id):
        for event in (
            data["resultsSection"].get("adverseEventsModule", {}).get("otherEvents", [])
        ):
            session.merge(
                AdverseEvent(
                    id=event.get("id") if event.get("id") else event.get("term"),
                    study_id=study_id,
                    term=event.get("term"),
                    severity=event.get("assessmentType"),
                    affected_count=event.get("stats", [{}])[0].get("numAffected"),
                )
            )

    def transform_contacts(self, data, session, study_id):
        for contact in data["protocolSection"]["contactsLocationsModule"].get(
            "overallOfficials", []
        ):
            session.merge(
                Contact(
                    id=contact.get("id") if contact.get("id") else contact.get("name"),
                    study_id=study_id,
                    name=contact.get("name"),
                    role=contact.get("role"),
                    organization=contact.get("affiliation"),
                )
            )

    def transform_groups(self, data, session, study_id):
        group_ids = set()
        for outcome in (
            data.get("resultsSection", {})
            .get("outcomeMeasuresModule", {})
            .get("outcomeMeasures", [])
        ):
            for group in outcome.get("groups", []):
                group_id = group.get("id")
                if group_id not in group_ids:
                    group_ids.add(group_id)
                    session.merge(
                        Group(
                            id=group_id,
                            study_id=study_id,
                            title=group.get("title"),
                            description=group.get("description"),
                        )
                    )



    def get_study_ids(self):
        """
        Fetches study IDs from the database that need results to be fetched.
        """
        session = Session()
        try:
            studies = session.query(Study.study_id).filter(Study.has_results.is_(False)).all()
            return [study_id for (study_id,) in studies]
        finally:
            session.close()

    def transform_time_series(self, data, session, study_id):
        for outcome in (
            data.get("resultsSection", {})
            .get("outcomeMeasuresModule", {})
            .get("outcomeMeasures", [])
        ):
            outcome_id = outcome.get("id") or outcome.get("title")
            time_frame = outcome.get("timeFrame")

            for group in outcome.get("groups", []):
                group_id = group.get("id")
                group_title = group.get("title")
                group_description = group.get("description")

                # Merge group data
                session.merge(
                    Group(
                        id=group_id,
                        study_id=study_id,
                        title=group_title,
                        description=group_description,
                    )
                )

                # Handle two cases:
                # 1. Time series data is in "classes" > "categories" > "measurements" (NCT00645944-like structure)
                # 2. Time series data is in "denoms" > "counts" (NCT00724282-like structure)
                if "classes" in outcome:
                    # Case 1: Process `classes` structure
                    for cls in outcome["classes"]:
                        for category in cls.get("categories", []):
                            for measurement in category.get("measurements", []):
                                session.merge(
                                    TimeSeriesData(
                                        study_id=study_id,
                                        outcome_id=outcome_id,
                                        group_id=group_id,
                                        time_frame=time_frame,
                                        value=float(measurement.get("value"))
                                        if measurement.get("value")
                                        else None,
                                        lower_limit=float(measurement.get("lowerLimit"))
                                        if measurement.get("lowerLimit")
                                        else None,
                                        upper_limit=float(measurement.get("upperLimit"))
                                        if measurement.get("upperLimit")
                                        else None,
                                    )
                                )
                elif "denoms" in outcome:
                    # Case 2: Process `denoms` structure
                    for denom in outcome["denoms"]:
                        for count in denom.get("counts", []):
                            session.merge(
                                TimeSeriesData(
                                    study_id=study_id,
                                    outcome_id=outcome_id,
                                    group_id=count.get("groupId"),
                                    time_frame=time_frame,
                                    value=float(count.get("value"))
                                    if count.get("value")
                                    else None,
                                    lower_limit=None,
                                    upper_limit=None,
                                )
                            )

    def insert_time_series(
        self, session, study_id, outcome_id, group_id, time_frame, measurement
    ):
        session.merge(
            TimeSeriesData(
                study_id=study_id,
                outcome_id=outcome_id,
                group_id=group_id,
                time_frame=time_frame,
                value=float(measurement.get("value"))
                if measurement.get("value")
                else None,
                lower_limit=float(measurement.get("lowerLimit"))
                if measurement.get("lowerLimit")
                else None,
                upper_limit=float(measurement.get("upperLimit"))
                if measurement.get("upperLimit")
                else None,
            )
        )

    def transform_and_load(self, data):
        session = Session()
        try:
            study_id = data["protocolSection"]["identificationModule"]["nctId"]
            self.transform_study(data, session)
            self.transform_conditions(data, session, study_id)
            self.transform_keywords(data, session, study_id)
            self.transform_phases(data, session, study_id)
            self.transform_study_arms(data, session, study_id)
            self.transform_interventions(data, session, study_id)
            self.transform_outcomes(data, session, study_id)
            self.transform_adverse_events(data, session, study_id)
            self.transform_contacts(data, session, study_id)
            self.transform_groups(data, session, study_id)
            self.transform_time_series(data, session, study_id)
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()


    def run(self):
        """
        Fetches study IDs from the database and processes them.
        """
        study_ids = self.get_study_ids()
        for study_id in study_ids:
            print(f"Processing study ID: {study_id}")
            try:
                data = self.extract(study_id)
                self.transform_and_load(data)
            except Exception as e:
                print(f"Error processing study ID {study_id}: {e}")


if __name__ == "__main__":
    etl = ClinicalTrialsETL(base_url="https://clinicaltrials.gov/api/v2")
    etl.run()