from clerk_backend_api.jwks_helpers import (
    VerifyTokenOptions,
    verify_token,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from fastapi import Security
from app.settings import env
from libsql_client import create_client_sync

clerk = Clerk(bearer_auth=env.CLERK_SECRET_KEY)

security = HTTPBearer()


def get_user_id_from_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token_options = VerifyTokenOptions(secret_key=env.CLERK_SECRET_KEY)
    jwt_obj = verify_token(credentials.credentials, token_options)
    return jwt_obj.get("sub")


def get_db():
    return create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN)
