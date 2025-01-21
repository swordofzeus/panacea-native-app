from ariadne import QueryType

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