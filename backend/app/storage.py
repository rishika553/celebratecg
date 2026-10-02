from pathlib import Path
from .config import settings


class ObjectStorage:
    def __init__(self):
        self.cfg = settings()

    def put(self, key: str, data: bytes, content_type: str):
        if self.cfg.storage_backend == 's3':
            self._s3_client().put_object(
                Bucket=self.cfg.storage_bucket, Key=key, Body=data, ContentType=content_type,
                CacheControl='public, max-age=31536000, immutable')
            return
        path = self._local_path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def get(self, key: str):
        if self.cfg.storage_backend == 's3':
            from botocore.exceptions import ClientError
            try:
                result = self._s3_client().get_object(
                    Bucket=self.cfg.storage_bucket, Key=key)
            except ClientError as exc:
                if exc.response.get('Error', {}).get('Code') in ('NoSuchKey', 'NotFound', '404'):
                    raise FileNotFoundError(key) from exc
                raise
            try:
                return result['Body'].read(), result.get('ContentType', 'application/octet-stream')
            finally:
                result['Body'].close()
        path = self._local_path(key)
        if not path.is_file():
            raise FileNotFoundError(key)
        content_types = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}
        return path.read_bytes(), content_types.get(path.suffix.lower(), 'application/octet-stream')

    def delete(self, key: str):
        if self.cfg.storage_backend == 's3':
            self._s3_client().delete_object(
                Bucket=self.cfg.storage_bucket, Key=key)
            return
        path = self._local_path(key)
        if path.is_file():
            path.unlink()

    def _local_path(self, key: str):
        root = Path(self.cfg.storage_local_dir).resolve()
        path = (root / key).resolve()
        if root not in path.parents:
            raise ValueError('Invalid object key.')
        return path

    def _s3_client(self):
        import boto3
        return boto3.client('s3', endpoint_url=self.cfg.aws_endpoint_url_s3,
                            region_name=self.cfg.aws_region,
                            aws_access_key_id=self.cfg.aws_access_key_id.get_secret_value(),
                            aws_secret_access_key=self.cfg.aws_secret_access_key.get_secret_value(),
                            config=self._s3_config())

    @staticmethod
    def _s3_config():
        from botocore.config import Config
        return Config(signature_version='s3v4', s3={'addressing_style': 'path'},
                      connect_timeout=10, read_timeout=30, retries={'max_attempts': 2})


objects = ObjectStorage()
