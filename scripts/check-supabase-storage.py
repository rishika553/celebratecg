"""Check the configured private bucket using one temporary image; never print secrets."""
import base64
import os
from pathlib import Path
import sys
import uuid

BACKEND = Path(__file__).resolve().parents[1] / 'backend'
sys.path.insert(0, str(BACKEND))
os.chdir(BACKEND)


def main():
    from app.storage import objects
    objects.cfg.validate_runtime()
    if objects.cfg.storage_backend != 's3':
        raise RuntimeError('Configure STORAGE_BACKEND=s3 before running this check.')
    client = objects._s3_client()
    bucket = objects.cfg.storage_bucket
    client.head_bucket(Bucket=bucket)
    print('PASS: configured bucket is accessible.', flush=True)
    key = f'venues/_connection-check/{uuid.uuid4().hex}.png'
    data = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=')
    uploaded = False
    try:
        objects.put(key, data, 'image/png')
        uploaded = True
        actual, content_type = objects.get(key)
        assert actual == data and content_type == 'image/png', 'Image round trip mismatch.'
        print('PASS: temporary image upload and download.', flush=True)
        from fastapi.testclient import TestClient
        from app.main import app
        with TestClient(app) as api:
            response = api.get(f'/api/media/{key}')
            assert response.status_code == 200 and response.content == data, 'Media API failed.'
        print('PASS: backend media API serves the private-bucket image.', flush=True)
    finally:
        if uploaded:
            objects.delete(key)
            from botocore.exceptions import ClientError
            try:
                client.head_object(Bucket=bucket, Key=key)
            except ClientError as exc:
                if exc.response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 404:
                    raise
            else:
                raise RuntimeError('Temporary image cleanup could not be verified.')
            print('PASS: temporary image removed.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        # Report only a safe class/code, never request URLs, credentials or connection details.
        response = getattr(exc, 'response', {})
        code = response.get('Error', {}).get('Code', '') if isinstance(response, dict) else ''
        print(f'FAIL: {type(exc).__name__}' + (f' ({code})' if code else ''), flush=True)
        sys.exit(1)
