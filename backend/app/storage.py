from pathlib import Path
import os
from .config import settings


class ObjectStorage:
    def __init__(self):
        self.cfg = settings()

    def put(self, key: str, data: bytes, content_type: str):
        if self.cfg.storage_backend == 's3':
            import boto3
            boto3.client('s3', endpoint_url=os.getenv('AWS_ENDPOINT_URL_S3'),
                         region_name=os.getenv('AWS_REGION'), config=self._s3_config()).put_object(
                Bucket=self.cfg.storage_bucket, Key=key, Body=data, ContentType=content_type,
                CacheControl='public, max-age=31536000, immutable')
            return
        path = self._local_path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def get(self, key: str):
        if self.cfg.storage_backend == 's3':
            import boto3
            result = boto3.client('s3', endpoint_url=os.getenv('AWS_ENDPOINT_URL_S3'),
                                  region_name=os.getenv('AWS_REGION'), config=self._s3_config()).get_object(
                Bucket=self.cfg.storage_bucket, Key=key)
            return result['Body'].read(), result.get('ContentType', 'application/octet-stream')
        path = self._local_path(key)
        if not path.is_file():
            raise FileNotFoundError(key)
        content_types = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}
        return path.read_bytes(), content_types.get(path.suffix.lower(), 'application/octet-stream')

    def delete(self, key: str):
        if self.cfg.storage_backend == 's3':
            import boto3
            boto3.client('s3', endpoint_url=os.getenv('AWS_ENDPOINT_URL_S3'),
                         region_name=os.getenv('AWS_REGION'), config=self._s3_config()).delete_object(
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

    @staticmethod
    def _s3_config():
        from botocore.config import Config
        return Config(signature_version='s3v4', s3={'addressing_style': 'path'})


objects = ObjectStorage()
