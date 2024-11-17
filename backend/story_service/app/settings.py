from common.settings import CoreSettings


class Settings(CoreSettings):
    OPENAI_API_KEY: str
    MODAL_ENDPOINT: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    AWS_BUCKET_NAME: str
    BUCKET_URL_PREFIX: str

    class Config:
        env_file = "./story_service/.env"


restate_settings = Settings()
