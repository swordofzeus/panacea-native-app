from sqlalchemy.orm import Session
from panacea_api.models import Study

def get_studies_by_medication_name(db: Session, medication_name: str):
    return [db.query(Study).first()]#(Study.medication_name.ilike(f"%{medication_name}%")).all()