from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    ADMIN_SECRET_KEY: str = "default_dev_secret_key"
    
    # Can be a JSON string of the service account or a path
    FIREBASE_SERVICE_ACCOUNT_B64: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
