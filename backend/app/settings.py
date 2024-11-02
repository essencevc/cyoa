from pydantic import model_validator
from pydantic_settings import BaseSettings
from typing import Optional
from sqlmodel import create_engine, Session


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: str
    LIBSQL_URL: str
    MODAL_ENDPOINT: str
    LIBSQL_TOKEN: Optional[str] = None
    BACKEND_URL: str

    @model_validator(mode="after")
    def validate_libsql_url(self) -> "Settings":
        url = f"sqlite+{self.LIBSQL_URL}/?authToken={self.LIBSQL_TOKEN}&secure=true"
        engine = create_engine(url)
        with Session(bind=engine) as session:
            pass
        return self

    class Config:
        env_file = ".env"


env = Settings()
