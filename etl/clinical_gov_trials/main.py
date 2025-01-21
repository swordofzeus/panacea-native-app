from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models.clinical_gov_models import Study
from datetime import datetime
from constants import CLINICAL_TRIALS_BASE_API
import requests

# Database configuration
DATABASE_URL = "postgresql://testuser:testpwd@localhost:5432/panacea"
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


class ClinicalTrialsExtractor:
    def __init__(self, medication, condition):
        self.medication = medication
        self.condition = condition
        self.metadata_api = (
            f"{CLINICAL_TRIALS_BASE_API}/studies?query.cond={condition}"
            f"&query.term={medication}&filter.overallStatus=COMPLETED"
        )

    def extract(self):
        extracted_studies = []
        next_page_token = None

        while True:
            url = self.metadata_api
            if next_page_token:
                url += f"&pageToken={next_page_token}"

            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()

                studies = data.get("studies", [])
                for study in studies:
                    protocol_section = study.get("protocolSection", {})
                    identification_module = protocol_section.get("identificationModule", {})
                    status_module = protocol_section.get("statusModule", {})
                    sponsor_module = protocol_section.get("sponsorCollaboratorsModule", {})
                    description_module = protocol_section.get("descriptionModule", {})

                    study_metadata = {
                        "id": identification_module.get("nctId"),
                        "brief_title": identification_module.get("briefTitle"),
                        "organization": identification_module.get("organization", {}).get("fullName"),
                        "status": status_module.get("overallStatus"),
                        "sponsor": sponsor_module.get("leadSponsor", {}).get("name"),
                        "completion_date": status_module.get("completionDateStruct", {}).get("date"),
                        "description": description_module.get("briefSummary"),
                        "start_date": status_module.get("startDateStruct", {}).get("date"),
                    }

                    extracted_studies.append(study_metadata)

                next_page_token = data.get("nextPageToken")
                if not next_page_token:
                    break

            except requests.RequestException as e:
                print(f"An error occurred while fetching study data: {e}")
                break

        return extracted_studies

    def hydrate(self, studies):
        """
        Hydrates missing fields in the Study table with data from the API.
        """
        session = Session()
        try:
            for study in studies:
                # Retrieve existing study
                existing_study = session.query(Study).filter_by(study_id=study["id"]).first()

                # If study exists, hydrate missing fields
                if existing_study:
                    if not existing_study.brief_title and study["brief_title"]:
                        existing_study.brief_title = study["brief_title"]
                    if not existing_study.organization and study["organization"]:
                        existing_study.organization = study["organization"]
                    if not existing_study.overall_status and study["status"]:
                        existing_study.overall_status = study["status"]
                    if not existing_study.completion_date and study["completion_date"]:
                        existing_study.completion_date = format_date(study["completion_date"])
                    if not existing_study.description and study["description"]:
                        existing_study.description = study["description"]
                    if not existing_study.start_date and study["start_date"]:
                        existing_study.start_date = format_date(study["start_date"])
                else:
                    # Insert a new study if it doesn't exist
                    new_study = Study(
                        study_id=study["id"],
                        brief_title=study["brief_title"],
                        organization=study["organization"],
                        overall_status=study["status"],
                        completion_date=format_date(study["completion_date"]),
                        description=study["description"],
                        start_date=format_date(study["start_date"]),
                    )
                    session.add(new_study)

            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Error while hydrating study data: {e}")
        finally:
            session.close()


if __name__ == "__main__":
    extractor = ClinicalTrialsExtractor("Lunesta", "Insomnia")
    studies = extractor.extract()
    extractor.hydrate(studies)
