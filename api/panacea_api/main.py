from fastapi import FastAPI
from ariadne.asgi import GraphQL
from panacea_api.schema.schema import schema
from panacea_api.models import SessionLocal
from sqlalchemy.orm import Session
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from panacea_api.middlewear.auth_middlewear import AuthMiddleware
app = FastAPI()



origins = [
    "http://localhost:8081",  # React app running locally
    "http://127.0.0.1:3000", # Alternative localhost
    "https://your-frontend-domain.com",  # Replace with your deployed frontend's domain,
    "127.0.0.1:*",
    "192.168.1.189:8081",
    "*"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def context_function(request: Request):
    # Create a new SQLAlchemy session for each request
    db_session = SessionLocal()
    user = AuthMiddleware().authenticate(request)
    print(user['email'])
    input()
    return {"request": request, "session": db_session, "user": user['email']}

graphql_app = GraphQL(schema,context_value=context_function)

@app.get("/")
async def root():
    return {"message": "Welcome to the GraphQL Studies API"}

app.mount("/graphql", graphql_app)