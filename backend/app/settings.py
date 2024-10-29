from pydantic import model_validator
from pydantic_settings import BaseSettings
from typing import Optional
from libsql_client import create_client_sync


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: str
    LIBSQL_URL: str
    FAL_KEY: str
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

        # Validate that we can connect to the database
        with create_client_sync(
            url=self.LIBSQL_URL, auth_token=self.LIBSQL_TOKEN
        ) as client:  # noqa: F841
            pass

    class Config:
        env_file = ".env"


env = Settings()
