$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path `
    -Parent `
    $PSScriptRoot

Set-Location $ProjectRoot

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "============================================================"
    Write-Host $Label
    Write-Host "============================================================"

    & $Command

    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE."
    }
}

if (
    -not (Test-Path ".env") -and
    [string]::IsNullOrWhiteSpace($env:DATABASE_URL)
) {
    throw @"
The project environment could not be found.

Expected local file:
$ProjectRoot\.env

This project uses .env. The script does not assume that .env.local exists.
"@
}

Invoke-CheckedCommand `
    -Label "Checking Prisma migration status" `
    -Command {
        npx prisma migrate status
    }

Invoke-CheckedCommand `
    -Label "Validating Prisma schema" `
    -Command {
        npm run db:validate
    }

Invoke-CheckedCommand `
    -Label "Applying pending database migrations" `
    -Command {
        npm run db:migrate
    }

Invoke-CheckedCommand `
    -Label "Generating Prisma Client" `
    -Command {
        npm run db:generate
    }

Invoke-CheckedCommand `
    -Label "Running TypeScript validation" `
    -Command {
        npm run typecheck
    }

Invoke-CheckedCommand `
    -Label "Running ESLint validation" `
    -Command {
        npm run lint
    }

Invoke-CheckedCommand `
    -Label "Verifying Attendance Policy seed records" `
    -Command {
        npx tsx `
            scripts/verify-attendance-policy-settings.ts
    }

Write-Host ""
Write-Host "============================================================"
Write-Host "Attendance Policy migration workflow completed successfully."
Write-Host "============================================================"
Write-Host ""
Write-Host "Next:"
Write-Host "1. Run npm run dev"
Write-Host "2. Open /dashboard/settings/attendance-policies"
Write-Host "3. Save the Attendance Policies form"
Write-Host "4. Run npx tsx scripts/verify-attendance-policy-audit.ts"