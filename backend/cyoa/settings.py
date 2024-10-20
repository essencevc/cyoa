from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: str
    LIBSQL_URL: Optional[str] = None
    LIBSQL_TOKEN: Optional[str] = None

    class Config:
        env_file = ".env"

env = Settings()
