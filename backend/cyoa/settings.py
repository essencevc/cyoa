from pydantic import model_validator
from pydantic_settings import BaseSettings
from typing import Optional
from libsql_client import create_client_sync
import os


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: str
    LIBSQL_URL: str
    LIBSQL_TOKEN: Optional[str] = None

    @model_validator(mode="after")
    def validate_libsql_url(self) -> "Settings":
        if self.LIBSQL_URL.startswith("file:"):
            # Check if it's a valid file URL
            if self.LIBSQL_URL.startswith("file://"):
                raise ValueError(
                    "Invalid file URL format. Use 'file:' or 'file:///' for absolute paths, or 'file:' for relative paths."
                )

            # File URL is valid (either absolute or relative path)
        elif self.LIBSQL_URL.startswith(("libsql:", "wss:")):
            assert (
                self.LIBSQL_TOKEN is not None
            ), "LIBSQL_TOKEN is required for HTTP connection"
        else:
            raise ValueError(
                "Unsupported LIBSQL_URL format. Use 'file:' for local SQLite database or 'libsql:' for Turso."
            )

        # Now we validate that we can connect to the db

        # Check that the file exists
        with create_client_sync(
            url=self.LIBSQL_URL, auth_token=self.LIBSQL_TOKEN
        ) as client:
            init_sql = os.path.join(os.path.dirname(__file__), "../db/init.sql")
            client.execute(open(init_sql).read())
        return self

    class Config:
        env_file = ".env"


env = Settings()
