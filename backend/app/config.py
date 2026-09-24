from functools import lru_cache
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    database_url: str = 'sqlite:///./celebratecg.db'
    app_env: str = 'development'
    demo_mode: bool = False
    jwt_secret: str = ''
    allowed_origins: str = 'http://127.0.0.1:3000,http://localhost:3000'
    razorpay_key_id: str = ''
    razorpay_key_secret: str = ''
    razorpay_webhook_secret: str = ''
    storage_backend: str = 'local'
    storage_bucket: str = 'venue-images'
    storage_local_dir: str = './uploads'

    @property
    def origins(self):
        return [value.strip() for value in self.allowed_origins.split(',') if value.strip()]

    def validate_runtime(self):
        if len(self.jwt_secret) < 32 or self.jwt_secret.startswith('replace-with'):
            raise RuntimeError('Set JWT_SECRET to a random secret of at least 32 characters in backend/.env.')
        if self.app_env == 'production' and (self.demo_mode or self.database_url.startswith('sqlite')):
            raise RuntimeError('Production requires PostgreSQL and DEMO_MODE=false.')
        if self.app_env == 'production' and self.storage_backend != 's3':
            raise RuntimeError('Production requires STORAGE_BACKEND=s3.')
        if self.storage_backend == 's3':
            required = ('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION')
            if any(not os.getenv(name) for name in required):
                raise RuntimeError('S3 storage requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, and AWS_REGION.')


@lru_cache
def settings():
    return Settings()
