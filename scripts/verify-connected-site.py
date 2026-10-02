"""Verify the frontend-to-backend database path without sending user data."""
import sys
import httpx

try:
    with httpx.Client(timeout=30) as client:
        for origin in ('http://127.0.0.1:8000', 'http://127.0.0.1:3000'):
            for path in ('/api/ready', '/api/categories', '/api/categories?kind=all', '/api/venues', '/api/cities'):
                response = client.get(origin + path)
                if response.status_code != 200:
                    raise RuntimeError(f'Endpoint verification failed: {path} HTTP {response.status_code}')
                data = response.json()
                print(origin, path, 'HTTP 200', f'({len(data)} records)' if isinstance(data, list) else '')
                if path == '/api/categories' and len(data) != 8:
                    raise RuntimeError('Expected eight venue categories.')
                if path == '/api/categories?kind=all' and len(data) != 16:
                    raise RuntimeError('Expected the initialized category catalogue.')
            health = client.get(origin + '/api/health').json()
            if health.get('demo_mode'):
                raise RuntimeError('Demo mode is still enabled in the running API.')
            if client.get(origin + '/api/auth/me').status_code != 401:
                raise RuntimeError('Anonymous account access was not rejected.')
        for path in ('/', '/signup', '/login', '/find-venue', '/categories', '/cities', '/dashboard'):
            response = client.get('http://127.0.0.1:3000' + path)
            if response.status_code != 200:
                raise RuntimeError('Website page verification failed: ' + path)
            print('Website page:', path, 'HTTP 200')
    print('Frontend -> FastAPI -> Supabase verification passed.')
except Exception as exc:
    print(str(exc) if isinstance(exc, RuntimeError) else f'Connection check failed: {type(exc).__name__}; response details omitted.')
    sys.exit(1)
