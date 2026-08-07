import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings(BaseSettings):
    ADMIN_SECRET_KEY: str = "default_dev_secret_key"
    ADMIN_EMAIL: str = "admin@nexus.com"
    ADMIN_PASSWORD: str
    
    # Can be a JSON string of the service account or a path
    FIREBASE_SERVICE_ACCOUNT_B64: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(os.path.join(BASE_DIR, ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

