$ErrorActionPreference = "Stop"

function Get-SecretFingerprint {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $sha256 = [System.Security.Cryptography.SHA256]::Create()

    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
        $hash = $sha256.ComputeHash($bytes)

        return (
            [System.BitConverter]::ToString($hash)
        ).Replace("-", "").ToLowerInvariant().Substring(0, 12)
    }
    finally {
        $sha256.Dispose()
    }
}

function Remove-SurroundingQuotes {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $trimmed = $Value.Trim()

    if ($trimmed.Length -lt 2) {
        return $trimmed
    }

    $first = $trimmed.Substring(0, 1)
    $last = $trimmed.Substring($trimmed.Length - 1, 1)

    $hasDoubleQuotes =
        $first -eq '"' -and $last -eq '"'

    $hasSingleQuotes =
        $first -eq "'" -and $last -eq "'"

    if ($hasDoubleQuotes -or $hasSingleQuotes) {
        return $trimmed.Substring(
            1,
            $trimmed.Length - 2
        )
    }

    return $trimmed
}

$results = @()

$secretNames = @(
    "ATTENDANCE_AUTOMATION_SECRET",
    "CRON_SECRET"
)

foreach ($secretName in $secretNames) {
    $processValue = [Environment]::GetEnvironmentVariable(
        $secretName,
        "Process"
    )

    if (-not [string]::IsNullOrWhiteSpace($processValue)) {
        $normalizedValue = $processValue.Trim()

        $results += [PSCustomObject]@{
            Priority    = 0
            Source      = "process.env"
            Name        = $secretName
            Length      = $normalizedValue.Length
            Fingerprint = Get-SecretFingerprint -Value $normalizedValue
        }
    }
}

$environmentFiles = @(
    ".env.development.local",
    ".env.local",
    ".env.development",
    ".env"
)

$priority = 1

foreach ($environmentFile in $environmentFiles) {
    if (-not (Test-Path $environmentFile)) {
        $priority++
        continue
    }

    foreach ($line in Get-Content $environmentFile) {
        if (
            $line -match
            "^\s*(ATTENDANCE_AUTOMATION_SECRET|CRON_SECRET)\s*=\s*(.*)$"
        ) {
            $name = $Matches[1]

            $value = Remove-SurroundingQuotes `
                -Value $Matches[2]

            if (-not [string]::IsNullOrWhiteSpace($value)) {
                $results += [PSCustomObject]@{
                    Priority    = $priority
                    Source      = $environmentFile
                    Name        = $name
                    Length      = $value.Length
                    Fingerprint = Get-SecretFingerprint -Value $value
                }
            }
        }
    }

    $priority++
}

Write-Host ""
Write-Host "Automation secret configuration" -ForegroundColor Cyan
Write-Host "Actual secret values are not displayed." -ForegroundColor DarkGray
Write-Host ""

if ($results.Count -eq 0) {
    Write-Host "No automation secret was found." -ForegroundColor Red
    exit 1
}

$results |
    Sort-Object Priority, Name |
    Format-Table Source, Name, Length, Fingerprint -AutoSize

Write-Host ""
Write-Host "Resolution order:" -ForegroundColor Yellow
Write-Host "1. Process environment"
Write-Host "2. .env.development.local"
Write-Host "3. .env.local"
Write-Host "4. .env.development"
Write-Host "5. .env"
Write-Host ""
Write-Host (
    "ATTENDANCE_AUTOMATION_SECRET takes priority over CRON_SECRET."
) -ForegroundColor Green