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

                    study_metadata = {
                        "id": identification_module.get("nctId"),
                        "brief_title": identification_module.get("briefTitle"),
                        "organization": identification_module.get("organization", {}).get("fullName", "Unknown"),
                        "status": status_module.get("overallStatus"),
                        "sponsor": sponsor_module.get("leadSponsor", {}).get("name", "Unknown"),
                        "completion_date": status_module.get("completionDateStruct", {}).get("date", "Unknown"),
                    }

                    extracted_studies.append(study_metadata)

                next_page_token = data.get("nextPageToken")
                if not next_page_token:
                    break

            except requests.RequestException as e:
                print(f"An error occurred while fetching study data: {e}")
                break

        return extracted_studies

    def load(self, studies):
        """
        Loads extracted metadata into the StudyMetadata table.
        """
        session = Session()
        try:
            for study in studies:
                study_metadata = Study(
                    study_id=study["id"],
                    brief_title=study["brief_title"],
                    organization=study["organization"],
                    overall_status=study["status"],
                    # sponsor=study["sponsor"],
                    completion_date=format_date(study["completion_date"]),
                )
                session.merge(study_metadata)  # Use merge to avoid duplicates
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Error while loading study metadata: {e}")
        finally:
            session.close()


if __name__ == "__main__":
    extractor = ClinicalTrialsExtractor("Lunesta", "Insomnia")
    studies = extractor.extract()
    extractor.load(studies)
