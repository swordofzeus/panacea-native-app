from ariadne import QueryType
from ariadne import MutationType
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from panacea_api.models import Response, User, PatientMedication, Question  # Adjust imports as needed
from panacea_api.database import engine

# Initialize session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

medications_query = QueryType()

# Static list of medications
medications_data = [
    {"name": "Lunesta", "conditions": ["Insomnia"]},
    {"name": "Amlodipine", "conditions": ["High Blood Pressure"]},
    {"name": "Ventolin Inhaler", "conditions": ["Asthma"]},
    {"name": "Methotrexate", "conditions": ["Rheumatoid Arthritis"]},
]

@medications_query.field("medications")
def resolve_medications(*_):
    return medications_data



mutation = MutationType()

@mutation.field("addResponses")
def resolve_add_responses(_, info, input):
    session = SessionLocal()
    try:
        # Extract data from input
        medication_id = input.get("medicationId")
        metric_id = input.get("metricId")
        responses = input.get("responses")

        if not medication_id or not responses:
            return {
                "success": False,
                "message": "Medication ID and responses are required.",
            }

        # Loop through responses and save them in the database
        for response_data in responses:
            question_id = response_data.get("questionId")
            answer = response_data.get("answer")
            asked_at = response_data.get("askedAt")
            responded_at = response_data.get("respondedAt")

            if not question_id or not answer or not asked_at or not responded_at:
                return {
                    "success": False,
                    "message": "All fields (questionId, answer, askedAt, respondedAt) are required in responses.",
                }

            # Create the Response object
            response = Response(
                user_id=info.context.get("user"),  # Assuming user is stored in context
                medication_id=medication_id,
                metric_id=metric_id,
                question_id=question_id,
                answer=answer,
                created_at=datetime.utcnow(),  # Use the current time
            )

            # Add response to the session
            session.add(response)

        # Commit the transaction
        session.commit()
        return {
            "success": True,
            "message": "Responses added successfully.",
        }

    except SQLAlchemyError as e:
        session.rollback()
        print(f"Error adding responses: {e}")
        return {
            "success": False,
            "message": "An error occurred while adding responses.",
        }
    finally:
        session.close()