param(
    [string]$Python = 'py',
    [switch]$SeedDemoData
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    if (-not (Test-Path 'backend/.venv/Scripts/python.exe')) {
        & $Python -m venv backend/.venv
        if ($LASTEXITCODE -ne 0) { throw 'Python environment creation failed. Supply -Python with a working Python executable.' }
    }
    & backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.lock.txt
    if ($LASTEXITCODE -ne 0) { throw 'Backend dependency installation failed.' }
    if (-not (Test-Path 'backend/.env')) {
        Copy-Item 'backend/.env.example' 'backend/.env'
        & backend/.venv/Scripts/python.exe -c "from pathlib import Path; import secrets; p=Path('backend/.env'); s=p.read_text(encoding='utf-8'); p.write_text(s.replace('replace-with-a-random-secret-at-least-32-characters', secrets.token_urlsafe(48)), encoding='utf-8')"
        if ($LASTEXITCODE -ne 0) { throw 'Local configuration creation failed.' }
        throw 'Created backend/.env. Set DATABASE_URL to your Supabase PostgreSQL connection string, then run setup again.'
    }
    & backend/.venv/Scripts/python.exe scripts/check-supabase.py
    if ($LASTEXITCODE -ne 0) { throw 'Configure a working PostgreSQL DATABASE_URL in backend/.env, then run setup again.' }
    & backend/.venv/Scripts/python.exe scripts/initialize-supabase.py
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
    if ($SeedDemoData) {
        Push-Location backend
        try {
            & .venv/Scripts/python.exe -m app.bootstrap --demo
            if ($LASTEXITCODE -ne 0) { throw 'Demo initialization failed. Set DEMO_MODE=true only on a development database.' }
        } finally { Pop-Location }
    }
    Push-Location frontend
    try {
        npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    } finally { Pop-Location }
    Write-Host 'Ready. Run scripts/start-backend.ps1 and scripts/start-frontend.ps1 in separate terminals.'
} finally { Pop-Location }
