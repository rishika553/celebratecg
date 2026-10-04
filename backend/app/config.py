from functools import lru_cache
from urllib.parse import parse_qs, urlsplit
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    database_url: str = ''
    database_pool_size: int = Field(default=2, ge=1, le=20)
    database_max_overflow: int = Field(default=1, ge=0, le=20)
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
    aws_access_key_id: SecretStr = Field(default=SecretStr(''), repr=False)
    aws_secret_access_key: SecretStr = Field(default=SecretStr(''), repr=False)
    aws_endpoint_url_s3: str = ''
    aws_region: str = ''
    supabase_url: str = ''
    supabase_publishable_key: str = ''

    @property
    def origins(self):
        return [value.strip() for value in self.allowed_origins.split(',') if value.strip()]

    def validate_runtime(self):
        if len(self.jwt_secret) < 32 or self.jwt_secret.startswith('replace-with'):
            raise RuntimeError('Set JWT_SECRET to a random secret of at least 32 characters in backend/.env.')
        test_sqlite = self.app_env == 'test' and self.database_url.startswith('sqlite')
        if not test_sqlite:
            parsed_database = urlsplit(self.database_url)
            if parsed_database.scheme != 'postgresql+psycopg':
                raise RuntimeError('Local and production environments require DATABASE_URL=postgresql+psycopg://...')
            if parsed_database.hostname not in ('localhost', '127.0.0.1'):
                ssl_mode = parse_qs(parsed_database.query).get('sslmode', [''])[0].lower()
                if ssl_mode not in ('require', 'verify-ca', 'verify-full'):
                    raise RuntimeError('Remote PostgreSQL connections require sslmode=require (or stricter) in DATABASE_URL.')
        if self.app_env == 'production' and self.demo_mode:
            raise RuntimeError('Production requires DEMO_MODE=false.')
        if self.app_env == 'production':
            if not self.origins:
                raise RuntimeError('Production requires at least one ALLOWED_ORIGINS frontend origin.')
            for origin in self.origins:
                parsed = urlsplit(origin)
                if (parsed.scheme != 'https' or not parsed.netloc or '*' in origin or
                        parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password):
                    raise RuntimeError('Production ALLOWED_ORIGINS must contain exact HTTPS origins without trailing slashes.')
        if self.app_env == 'production' and self.storage_backend != 's3':
            raise RuntimeError('Production requires STORAGE_BACKEND=s3.')
        if self.storage_backend == 's3':
            if not all((self.aws_access_key_id.get_secret_value(), self.aws_secret_access_key.get_secret_value(),
                        self.aws_endpoint_url_s3, self.aws_region)):
                raise RuntimeError('S3 storage requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, and AWS_REGION.')


@lru_cache
def settings():
    return Settings()
