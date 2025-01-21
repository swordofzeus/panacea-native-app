from ariadne import Extension
from jose import jwt
import requests
from starlette.requests import Request

# Cognito details
COGNITO_USER_POOL_ID = "us-east-1_yVGveQ547"  # e.g., us-east-1_ABC123
COGNITO_REGION = "us-east-1"  # e.g., us-east-1
COGNITO_APP_CLIENT_ID = "27t63emd01ggt9gckpdgtcmtgi"  # The App Client ID (audience)
from jose import jwt
import requests


# Build JWKS URL
JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

class AuthMiddleware:
    def __init__(self):
        self.jwks = self.fetch_jwks()

    def fetch_jwks(self):
        """Fetch JWKS keys from Cognito."""
        try:
            response = requests.get(JWKS_URL)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise RuntimeError(f"Failed to fetch JWKS: {e}")

    def verify_token(self, token):
        """Verify a JWT token."""
        try:
            claims = jwt.decode(
                token,
                self.jwks,
                algorithms=["RS256"],
                audience=COGNITO_APP_CLIENT_ID,
                issuer=f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}",
            )
            return claims
        except jwt.ExpiredSignatureError:
            raise ValueError("Token is expired")
        except jwt.JWTClaimsError as e:
            raise ValueError(f"Invalid claims: {e}")
        except Exception as e:
            raise ValueError(f"Error verifying token: {e}")

    def authenticate(self, request):
        """Extract and verify the token from the request."""
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise ValueError("Authorization header missing or malformed")
        token = auth_header.split(" ")[1]
        return self.verify_token(token)
