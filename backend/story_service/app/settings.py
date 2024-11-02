from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MODAL_ENDPOINT: str
    OPENAI_API_KEY: str
    LIBSQL_URL: str
    LIBSQL_TOKEN: str


restate_settings = Settings()
