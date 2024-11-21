from common.settings import CoreSettings


class Settings(CoreSettings):
    OPENAI_API_KEY: str
    MODAL_ENDPOINT: str
    RESTATE_RUNTIME_ENDPOINT: str
    BUCKET_URL_PREFIX: str

    class Config:
        env_file = "./story_service/.env"


restate_settings = Settings()
