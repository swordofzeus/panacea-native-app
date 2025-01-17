from fastapi import Depends
from sqlalchemy.orm import Session
from panacea_api.database import SessionLocal
from panacea_api.queries.study_queries import get_studies_by_medication_name

from sqlalchemy.orm import Session
from panacea_api.models import Study, VisualizationData,StudyKeyword

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def resolve_studies(obj, info, searchTerm: str):
    session: Session = info.context["session"]

    # Query for studies filtered by search term in keywords
    studies_query = (
        session.query(Study)
        .join(Study.keywords)
        .filter(StudyKeyword.keyword.ilike(f"%{searchTerm}%"))
    ).all()

    # Map the studies into the desired structure
    studies = []
    for study in studies_query:
        # Get visualization data
        visualization_data = (
            session.query(VisualizationData)
            .filter(VisualizationData.study_id == study.study_id)
            .first()
        )
        print(visualization_data.__dict__)
        studies.append(
            {
                "studyInfo": {
                    "title": study.brief_title,
                    "institution": study.organization,
                    "dates": {
                        "start": study.start_date.strftime("%Y-%m") if study.start_date else None,
                        "completion": study.completion_date.strftime("%Y-%m")
                        if study.completion_date
                        else None,
                    },
                    "summary": study.description,
                },
                "participants": [
                    {
                        "groupName": group.title,
                        "dosage": group.description,
                        "medicationName": group.title,  # Adjust as per actual logic
                        "description": group.description,
                    }
                    for group in study.participant_groups
                ],
                "outcomes": visualization_data.data['outcomes'] if visualization_data else [],
            }
        )

    return studies
