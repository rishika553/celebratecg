param([string]$Python = 'py')
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
    & backend/.venv/Scripts/python.exe -c "from pathlib import Path; import secrets; p=Path('backend/.env'); p.write_text('DATABASE_URL=sqlite:///./celebratecg.db\nAPP_ENV=development\nDEMO_MODE=true\nJWT_SECRET='+secrets.token_urlsafe(48)+'\nALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000\n', encoding='utf-8') if not p.exists() else None"
    if ($LASTEXITCODE -ne 0) { throw 'Local configuration creation failed.' }
    Push-Location backend
    try {
        & .venv/Scripts/python.exe -m app.bootstrap --demo
        if ($LASTEXITCODE -ne 0) { throw 'Demo initialization failed. Check backend/.env.' }
    } finally { Pop-Location }
    Push-Location frontend
    try {
        npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    } finally { Pop-Location }
    Write-Host 'Ready. Run scripts/start-backend.ps1 and scripts/start-frontend.ps1 in separate terminals.'
} finally { Pop-Location }
