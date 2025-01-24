from ariadne import QueryType, make_executable_schema, load_schema_from_path
from panacea_api.resolvers.studies_resolver import resolve_studies
from panacea_api.resolvers.medications_resolver import medications_query, mutation

from ariadne import ScalarType
import json

json_scalar = ScalarType("JSON")

@json_scalar.serializer
def serialize_json(value):
    print(value)
    return value  # Return the value directly since it's already JSON-serializable

@json_scalar.value_parser
def parse_json(value):
    print(value)
    return json.loads(value)  # Parse incoming JSON strings into Python objects


# Load schema from .gql file
type_defs = load_schema_from_path(
    "/home/ashish/Projects/pulse/pulse-native-app/app/panacea/api/schema.gql"
)

query = QueryType()

# Attach resolver for studies
query.set_field("studies", resolve_studies)

schema = make_executable_schema(type_defs, query, json_scalar, medications_query, mutation)
print(schema)
