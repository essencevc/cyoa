from pydantic_settings import BaseSettings
from pydantic import computed_field


class CoreSettings(BaseSettings):
    LIBSQL_URL: str
    LIBSQL_TOKEN: str

    @computed_field
    @property
    def db_url(self) -> str:
        return f"sqlite+{self.LIBSQL_URL}/?authToken={self.LIBSQL_TOKEN}&secure=true"

    class Config:
        env_file = ".env"


core_settings = CoreSettings()
