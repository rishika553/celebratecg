# Venue photo uploads

Vendors can upload, order, and remove up to 10 photos for each venue. Accepted formats are JPEG, PNG, and WebP, with an 8 MB limit per image. The API checks the file signature as well as the declared media type.

Every gallery change sets the venue listing back to `pending`. An administrator sees the submitted gallery in the existing approvals dashboard and must approve the listing before it returns to the public catalogue.

## Storage

Local development stores private uploads in `backend/uploads` and serves them through `/api/media`. Production refuses to start with local storage. Configure a private S3-compatible bucket:

```dotenv
STORAGE_BACKEND=s3
STORAGE_BUCKET=venue-images
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_ENDPOINT_URL_S3=...
AWS_REGION=...
```

The database stores immutable object keys, not image bytes. S3 requests use Signature V4 and path-style addressing. Neon Object Storage can supply the standard variables above for projects in its supported `us-east-2` region. AWS S3 and compatible providers use the same application configuration.
