from io import BytesIO
from unittest.mock import Mock

import pytest
from app.config import Settings
from app.storage import ObjectStorage


def test_s3_credentials_load_from_dotenv_and_process_overrides(tmp_path, monkeypatch):
    keys = ('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION')
    for key in keys:
        monkeypatch.delenv(key, raising=False)
    dotenv = tmp_path / '.env'
    dotenv.write_text('AWS_ACCESS_KEY_ID=dotenv-access\nAWS_SECRET_ACCESS_KEY=dotenv-secret\n'
                      'AWS_ENDPOINT_URL_S3=https://example.com/storage/v1/s3\nAWS_REGION=test-region\n')
    cfg = Settings(_env_file=dotenv, storage_backend='s3', jwt_secret='x' * 48)
    cfg.validate_runtime()
    assert cfg.aws_access_key_id.get_secret_value() == 'dotenv-access'
    assert 'dotenv-secret' not in repr(cfg)
    assert 'dotenv-access' not in repr(cfg)
    monkeypatch.setenv('AWS_SECRET_ACCESS_KEY', 'process-secret')
    assert Settings(_env_file=dotenv).aws_secret_access_key.get_secret_value() == 'process-secret'

    client = Mock()
    factory = Mock(return_value=client)
    monkeypatch.setattr('boto3.client', factory)
    storage = ObjectStorage()
    storage.cfg = cfg
    storage.put('venues/test.png', b'image', 'image/png')
    kwargs = factory.call_args.kwargs
    assert kwargs['aws_access_key_id'] == 'dotenv-access'
    assert kwargs['aws_secret_access_key'] == 'dotenv-secret'
    assert kwargs['endpoint_url'] == cfg.aws_endpoint_url_s3
    assert kwargs['region_name'] == 'test-region'
    assert kwargs['config'].s3['addressing_style'] == 'path'
    client.put_object.assert_called_once()
    body = BytesIO(b'image')
    client.get_object.return_value = {'Body': body, 'ContentType': 'image/png'}
    assert storage.get('venues/test.png') == (b'image', 'image/png')
    assert body.closed
    storage.delete('venues/test.png')
    client.delete_object.assert_called_once_with(Bucket=cfg.storage_bucket, Key='venues/test.png')
    from botocore.exceptions import ClientError
    client.get_object.side_effect = ClientError({'Error': {'Code': 'NoSuchKey'}}, 'GetObject')
    with pytest.raises(FileNotFoundError):
        storage.get('venues/missing.png')
    client.get_object.side_effect = ClientError({'Error': {'Code': 'AccessDenied'}}, 'GetObject')
    with pytest.raises(ClientError):
        storage.get('venues/test.png')


def test_s3_rejects_missing_credentials(monkeypatch):
    for key in ('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'):
        monkeypatch.delenv(key, raising=False)
    cfg = Settings(_env_file=None, storage_backend='s3', jwt_secret='x' * 48)
    with pytest.raises(RuntimeError, match='S3 storage requires'):
        cfg.validate_runtime()
