import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.clinical_gov_models import (
    Study,
    Intervention,
    StudyCondition,
    StudyKeyword,
    StudyPhase,
    StudyArm,
    AdverseEvent,
    Outcome,
    Contact,
    ParticipantGroup,
    ParticipantDemographic,
    ParticipantStatistic,
    ParticipantDenom,
    AdverseEventGroup,
    OutcomeMeasure,
    OutcomeGroup
)
from datetime import datetime
import openai
import os

# Database configuration
DATABASE_URL = "postgresql://testuser:testpwd@localhost:5432/panacea"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine, autoflush=False)

# OpenAI API configuration
openai.api_key = os.getenv("OPENAI_API_KEY")


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


def get_model_schema(model):
    """
    Extracts the schema of an SQLAlchemy model as a dictionary.
    """
    return {column.name: str(column.type) for column in model.__table__.columns}


def generate_schema_prompt(model, json_fragment):
    """
    Generate a prompt for the LLM to map JSON to a SQLAlchemy object schema.
    """
    schema = get_model_schema(model)
    prompt = f"""
    You are a JSON-to-database mapper. Your task is to parse JSON fragments
    from healthcare study data and map them to a SQLAlchemy-compatible Python dictionary.

    Given the following SQLAlchemy model schema:
    Model: {model.__name__}
    Fields: {schema}

    Match the JSON fields to the SQLAlchemy fields where possible.
    - For missing fields, return them as None.
    - Ensure types strictly match between the JSON and the model schema:
      - Integers must map to Integer fields.
      - Strings must map to String fields.
      - Dates must be properly formatted and map to Date fields.
    - If the JSON contains extra fields not in the schema, ignore them.
    - Parse and format dates where applicable (e.g., 'YYYY-MM-DD').
    - Allow for some variation in names that may have different characters or words but
    have a similar same meaning between json and python dictionary
    Ex: DateAdded = AddedAt etc.
    IMPORTANT: IGNORE FIELDS THAT DO NOT EXIST IN THE SCHEMA. IF THE JSON HAS A FIELD
    WITH NO CORRESPONDING FIT IN THAT MODEL DO NOT ADD THAT FIELD! I'M USING THIS AS AN EXAMPLE BUT
    DO IT FOR OTHERS.
    JSON fragment:
    {json_fragment}
    """
    return prompt


def call_llm(prompt):
    """
    Calls the OpenAI API to process the prompt and return a structured response.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON-to-database mapping assistant.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        content = eval(response.choices[0].message.content)
        if "study_id" in content:
            content.pop("study_id")
        return content  # Ensure the response is a dictionary
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return None


class LLMStudyParser:
    def __init__(self, base_url):
        self.base_url = base_url

    def extract(self, study_id):
        """
        Extracts detailed study information from the API.
        """
        url = f"{self.base_url}/studies/{study_id}"
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"Failed to fetch study data for {study_id}. HTTP Status: {response.status_code}"
            )
        return response.json()

    def transform_interventions(self, data, session, study_id):
        """
        Transforms and loads data for the Intervention table using the LLM.
        """
        intervention_data = (
            data.get("protocolSection", {})
            .get("armsInterventionsModule", {})
            .get("interventions", [])
        )

        for fragment in intervention_data:
            prompt = generate_schema_prompt(Intervention, fragment)
            response = call_llm(prompt)
            if response:
                response["study_id"] = study_id
                response["id"] = (
                    response.get("id") if response.get("id") else response.get("name")
                )
                try:
                    intervention_obj = Intervention(**response)
                    session.merge(intervention_obj)
                except Exception as e:
                    print(f"Error processing intervention: {e}")
                    raise e

    def transform_conditions(self, data, session, study_id):
        """
        Transforms and loads data for the StudyCondition table using the LLM.
        """
        conditions_data = (
            data.get("protocolSection", {})
            .get("conditionsModule", {})
            .get("conditions", [])
        )

        for condition in conditions_data:
            condition_obj = StudyCondition(study_id=study_id, condition=condition)
            session.merge(condition_obj)

    def transform_keywords(self, data, session, study_id):
        """
        Transforms and loads data for the StudyKeyword table using the LLM.
        """
        keywords_data = (
            data.get("protocolSection", {})
            .get("conditionsModule", {})
            .get("keywords", [])
        )

        for keyword in keywords_data:
            keyword_obj = StudyKeyword(study_id=study_id, keyword=keyword)
            session.merge(keyword_obj)

    def transform_phases(self, data, session, study_id):
        """
        Transforms and loads data for the StudyPhase table using the LLM.
        """
        phases_data = (
            data.get("protocolSection", {}).get("designModule", {}).get("phases", [])
        )

        for phase in phases_data:
            phase_obj = StudyPhase(study_id=study_id, phase=phase)
            session.merge(phase_obj)

    def transform_participant_denoms(self, data, session, study_id):
        """
        Transforms and loads data for the ParticipantDenom table.
        """
        denom_data = (
            data.get("resultsSection")
            .get("baselineCharacteristicsModule", {})
            .get("denoms", [])
        )

        for denom in denom_data:
            units = denom.get("units")
            counts = denom.get("counts", [])
            for count in counts:
                fragment = {
                    "group_id": count.get("groupId"),
                    "units": units,
                    "count": count.get("value"),
                }
                prompt = generate_schema_prompt(ParticipantDenom, fragment)
                response = call_llm(prompt)
                if response:
                    try:
                        denom_obj = ParticipantDenom(**response, study_id=study_id)
                        session.merge(denom_obj)
                    except Exception as e:
                        print(f"Error processing participant denom: {e}")
                        raise e

    def transform_arms(self, data, session, study_id):
        """
        Transforms and loads data for the StudyArm table using the LLM.
        """
        arms_data = (
            data.get("protocolSection", {})
            .get("armsInterventionsModule", {})
            .get("armGroups", [])
        )

        for arm in arms_data:
            arm_obj = StudyArm(
                id=arm.get("label") if not arm.get("id") else arm.get("id"),
                study_id=study_id,
                label=arm.get("label"),
                type=arm.get("type"),
                description=arm.get("description"),
            )
            session.merge(arm_obj)

    def transform_adverse_event_groups(self, data, session, study_id):
        """
        Extracts and loads AdverseEventGroups into the database.
        """
        event_groups = (
            data.get("resultsSection", {})
            .get("adverseEventsModule", {})
            .get("eventGroups", [])
        )
        for group in event_groups:
            prompt = generate_schema_prompt(AdverseEventGroup, group)
            response = call_llm(prompt)
            if response:
                response["study_id"] = study_id
                try:
                    group_obj = AdverseEventGroup(**response)
                    session.merge(group_obj)
                except Exception as e:
                    print(f"Error processing adverse event group: {e}")
                    raise e

    def transform_adverse_events(self, data, session, study_id):
        """
        Extracts and loads AdverseEvents into the database.
        """
        adverse_event_types = ["seriousEvents", "otherEvents"]
        for event_type in adverse_event_types:
            events = (
                data.get("resultsSection", {})
                .get("adverseEventsModule", {})
                .get(event_type, [])
            )
            severity = "SERIOUS" if event_type == "seriousEvents" else "OTHER"

            for event in events:
                for stat in event.get("stats", []):
                    group_id = stat.get("groupId")
                    json_fragment = {
                        "term": event.get("term"),
                        "organ_system": event.get("organSystem"),
                        "assessment_type": event.get("assessmentType"),
                        "num_events": stat.get("numEvents"),
                        "num_affected": stat.get("numAffected"),
                        "num_at_risk": stat.get("numAtRisk"),
                        "notes": event.get("notes"),
                        "severity": severity,
                        "group_id": group_id,
                    }
                    prompt = generate_schema_prompt(AdverseEvent, json_fragment)
                    response = call_llm(prompt)

                    if response:
                        response["study_id"] = study_id
                        response["group_id"] = group_id
                        try:
                            adverse_event_obj = AdverseEvent(**response)
                            session.merge(adverse_event_obj)
                        except Exception as e:
                            print(f"Error processing adverse event: {e}")
                            raise e

    def transform_participant_statistics(self, data, session, study_id):
        """
        Transforms and loads data for the ParticipantStatistics table.
        """
        measure_data = (
            data.get("resultsSection", {})
            .get("baselineCharacteristicsModule", {})
            .get("measures", [])
        )

        for measure in measure_data:
            for class_data in measure.get("classes", []):
                for category in class_data.get("categories", []):
                    for measurement in category.get("measurements", []):
                        fragment = {
                            "measure_title": measure.get("title"),
                            "param_type": measure.get("paramType"),
                            "dispersion_type": measure.get("dispersionType"),
                            "unit_of_measure": measure.get("unitOfMeasure"),
                            "group_id": measurement.get("groupId"),
                            "value": measurement.get("value"),
                            "spread": measurement.get("spread"),
                        }
                        prompt = generate_schema_prompt(ParticipantStatistic, fragment)
                        response = call_llm(prompt)
                        if response:
                            response["study_id"] = study_id
                            response["group_id"] = response.get("group_id")
                            try:
                                statistic_obj = ParticipantStatistic(**response)
                                session.merge(statistic_obj)
                            except Exception as e:
                                print(f"Error processing participant statistic: {e}")
                                raise e

    def transform_outcomes(self, data, session, study_id):
        """
        Transforms and loads data for the Outcome table using the LLM.
        """
        outcomes_data = (
            data.get("protocolSection", {})
            .get("outcomesModule", {})
            .get("primaryOutcomes", [])
        )

        for fragment in outcomes_data:
            prompt = generate_schema_prompt(Outcome, fragment)
            response = call_llm(prompt)
            if response:
                response["study_id"] = study_id
                response["id"] = (
                    response.get("id")
                    if response.get("id")
                    else response.get("measure")
                )
                response["type"] = "PRIMARY"
                try:
                    outcome_obj = Outcome(**response)
                    session.merge(outcome_obj)
                except Exception as e:
                    print(f"Error processing outcome: {e}")
                    print(response)
                    input()
                    raise e

    def transform_contacts(self, data, session, study_id):
        """
        Transforms and loads data for the Contact table using the LLM.
        """
        contacts_data = (
            data.get("protocolSection", {})
            .get("contactsLocationsModule", {})
            .get("overallOfficials", [])
        )

        for fragment in contacts_data:
            prompt = generate_schema_prompt(Contact, fragment)
            response = call_llm(prompt)
            if response:
                response["study_id"] = study_id
                print(response)
                try:
                    contact_obj = Contact(**response)
                    session.merge(contact_obj)
                except Exception as e:
                    print(f"Error processing contact: {e}")
                    raise e

    def transform_arms(self, data, session, study_id):
        """
        Transforms and loads data for the StudyArm table using the LLM.
        """
        arms_data = (
            data.get("protocolSection", {})
            .get("armsInterventionsModule", {})
            .get("armGroups", [])
        )

        for fragment in arms_data:
            prompt = generate_schema_prompt(StudyArm, fragment)
            response = call_llm(prompt)
            if response:
                response["study_id"] = study_id
                response["id"] = (
                    response.get("id") if response.get("id") else response.get("label")
                )
                try:
                    study_arm_obj = StudyArm(**response)
                    session.merge(study_arm_obj)
                except Exception as e:
                    print(f"Error processing study arm: {e}")
                    raise e

    def transform_participant_groups(self, data, session, study_id):
        """
        Transforms and loads data for the ParticipantGroup table.
        """
        group_data = (
            data.get("resultsSection")
            .get("baselineCharacteristicsModule", {})
            .get("groups", [])
        )
        for fragment in group_data:
            try:
                prompt = generate_schema_prompt(ParticipantGroup, fragment)
                response = call_llm(prompt)
                if response:
                    response["study_id"] = study_id
                    group_obj = ParticipantGroup(**response)
                    session.merge(group_obj)
            except Exception as e:
                print(f"Error processing participant group: {e}")
                raise e

    def transform_participant_demographics(self, data, session, study_id):
        """
        Transforms and loads data for the ParticipantDemographic table.
        """
        measure_data = (
            data.get("resultsSection")
            .get("baselineCharacteristicsModule", {})
            .get("measures", [])
        )

        for measure in measure_data:
            for class_data in measure.get("classes", []):
                for category in class_data.get("categories", []):
                    for measurement in category.get("measurements", []):
                        fragment = {
                            "measure_title": measure.get("title"),
                            "param_type": measure.get("paramType"),
                            "dispersion_type": measure.get("dispersionType"),
                            "unit_of_measure": measure.get("unitOfMeasure"),
                            "group_id": measurement.get("groupId"),
                            "value": measurement.get("value"),
                            "spread": measurement.get("spread"),
                            "category": category.get("title"),
                        }
                        prompt = generate_schema_prompt(
                            ParticipantDemographic, fragment
                        )
                        response = call_llm(prompt)
                        if response:
                            response["study_id"] = study_id
                            response["group_id"] = response.get("group_id")
                            try:
                                demographic_obj = ParticipantDemographic(**response)
                                session.merge(demographic_obj)
                            except Exception as e:
                                print(f"Error processing participant demographic: {e}")
                                raise e




    def transform_outcome_groups(self, data, session, study_id):
        """
        Transforms and loads data for the OutcomeGroups table.
        """
        outcome_measures_data = data.get("resultsSection", {}).get("outcomeMeasuresModule", {}).get("outcomeMeasures", [])
        for outcome in outcome_measures_data:
            try:
                outcome_groups = outcome.get("groups", [])
                for group in outcome_groups:
                    group_id = group.get("id")
                    group_title = group.get("title")
                    group_description = group.get("description")

                    # Extract size from denoms
                    size = None
                    for denom in outcome.get("denoms", []):
                        for count in denom.get("counts", []):
                            if count.get("groupId") == group_id:
                                size = int(count.get("value"))

                    # Create or update OutcomeGroup
                    outcome_group_obj = OutcomeGroup(
                        id=group_id,
                        study_id=study_id,
                        title=group_title,
                        description=group_description,
                        size=size,
                    )
                    print(f"Processing OutcomeGroup: study_id={study_id}, id={group_id}")
                    session.merge(outcome_group_obj)
                    session.commit()
            except Exception as e:
                print(f"Error processing outcome group: {e}")
                input()
                session.rollback()
    def transform_outcome_measures(self, data, session, study_id):
        """
        Transforms and loads data for the OutcomeMeasures table.
        """
        outcome_measures_data = data.get("resultsSection", {}).get("outcomeMeasuresModule", {}).get("outcomeMeasures", [])

        for outcome in outcome_measures_data:
            try:
                # Extract common outcome measure fields
                measure_title = outcome.get("title")
                description = outcome.get("description")
                time_frame = outcome.get("timeFrame")
                type_ = outcome.get("type")
                population_description = outcome.get("populationDescription")
                reporting_status = outcome.get("reportingStatus")
                param_type = outcome.get("paramType")
                dispersion_type = outcome.get("dispersionType")
                unit_of_measure = outcome.get("unitOfMeasure")

                # Parse and save measurements
                for class_data in outcome.get("classes", []):
                    for category in class_data.get("categories", []):
                        for measurement in category.get("measurements", []):
                            group_id = measurement.get("groupId")
                            value = measurement.get("value")
                            lower_limit = measurement.get("lowerLimit")
                            upper_limit = measurement.get("upperLimit")

                            # Create OutcomeMeasure object with the new field
                            outcome_measure_obj = OutcomeMeasure(
                                study_id=study_id,
                                group_study_id=study_id,  # Set group_study_id to the same value as study_id
                                group_id=group_id,
                                measure_title=measure_title,
                                description=description,
                                time_frame=time_frame,
                                type=type_,
                                population_description=population_description,
                                reporting_status=reporting_status,
                                param_type=param_type,
                                dispersion_type=dispersion_type,
                                unit_of_measure=unit_of_measure,
                                value=value,
                                lower_limit=lower_limit,
                                upper_limit=upper_limit,
                            )
                            session.merge(outcome_measure_obj)

            except Exception as e:
                print(f"Error processing outcome measure: {e}")
                session.rollback()

    def transform_and_load(self, data, study_id, session):
        """
        Transforms JSON data and loads it into the database.
        """
        try:
            # self.transform_interventions(data, session, study_id)
            # self.transform_conditions(data, session, study_id)
            # self.transform_keywords(data, session, study_id)
            # self.transform_phases(data, session, study_id)
            # self.transform_arms(data, session, study_id)
            # self.transform_outcomes(data, session, study_id)
            # self.transform_contacts(data, session, study_id)
            # self.transform_participant_groups(data, session, study_id)  # Groups must come first
            # self.transform_participant_demographics(data, session, study_id)
            # self.transform_participant_statistics(data, session, study_id)
            # self.transform_participant_denoms(data, session, study_id)
            # self.transform_adverse_event_groups(data, session,study_id)
            # self.transform_adverse_events(data, session, study_id)  # Adverse Events come last
            # self.transform_outcome_groups(data,session,study_id)
            self.transform_outcome_measures(data, session, study_id)
            session.commit()
            print("finished commit")
        except Exception as e:
            print(e)
            raise e

    def run(self):
        """
        Main method to process all studies in the studies table.
        Each study is processed in an isolated session to prevent cascading errors.
        """
        base_session = Session()
        try:
            # Fetch all studies once
            studies = base_session.query(
                Study
            ).all()  # .filter(Study.processed_at == None).all()
        except Exception as e:
            print(f"Error fetching studies: {e}")
            return
        finally:
            base_session.close()

        # Process each study in a separate session
        for study in studies:
            print(f"Processing study ID: {study.study_id}")
            with Session() as session:
                try:
                    # Extract data
                    data = self.extract(study.study_id)
                    if not data or not data.get("hasResults"):
                        print(f"Skipping study {study.study_id}: No results found.")
                        continue

                    # Transform and load
                    self.transform_and_load(data, study.study_id, session)

                    # Mark as processed
                    study.processed_at = datetime.utcnow()
                    session.merge(study)

                    # Commit changes
                    session.commit()
                    print(f"Successfully processed study ID: {study.study_id}")
                except Exception as e:
                    # Rollback on failure and log error
                    session.rollback()
                    print(f"Failed to process study ID: {study.study_id}. Error: {e}")


if __name__ == "__main__":
    parser = LLMStudyParser(base_url="https://clinicaltrials.gov/api/v2")
    parser.run()
