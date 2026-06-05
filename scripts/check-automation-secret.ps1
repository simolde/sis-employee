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
        ).Replace("-", "").Substring(0, 12).ToLowerInvariant()
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

    $trimmedValue = $Value.Trim()

    if ($trimmedValue.Length -ge 2) {
        $firstCharacter = $trimmedValue.Substring(0, 1)
        $lastCharacter = $trimmedValue.Substring(
            $trimmedValue.Length - 1,
            1
        )

        if (
            ($firstCharacter -eq '"' -and $lastCharacter -eq '"') -or
            ($firstCharacter -eq "'" -and $lastCharacter -eq "'")
        ) {
            return $trimmedValue.Substring(
                1,
                $trimmedValue.Length - 2
            )
        }
    }

    return $trimmedValue
}

function Add-SecretResult {
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.Generic.List[object]]$Results,

        [Parameter(Mandatory = $true)]
        [string]$Source,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Value,

        [Parameter(Mandatory = $true)]
        [int]$Priority
    )

    $Results.Add(
        [PSCustomObject]@{
            Priority    = $Priority
            Source      = $Source
            Name        = $Name
            Length      = $Value.Length
            Fingerprint = Get-SecretFingerprint -Value $Value
        }
    )
}

$results = New-Object "System.Collections.Generic.List[object]"

$secretNames = @(
    "ATTENDANCE_AUTOMATION_SECRET",
    "CRON_SECRET"
)

$priority = 1

foreach ($secretName in $secretNames) {
    $processValue = [Environment]::GetEnvironmentVariable(
        $secretName,
        "Process"
    )

    if (-not [string]::IsNullOrWhiteSpace($processValue)) {
        Add-SecretResult `
            -Results $results `
            -Source "process.env" `
            -Name $secretName `
            -Value $processValue.Trim() `
            -Priority $priority
    }
}

$priority++

$environmentFiles = @(
    ".env.development.local",
    ".env.local",
    ".env.development",
    ".env"
)

foreach ($environmentFile in $environmentFiles) {
    if (-not (Test-Path $environmentFile)) {
        $priority++
        continue
    }

    foreach ($line in Get-Content $environmentFile) {
        if (
            $line -match
            '^\s*(ATTENDANCE_AUTOMATION_SECRET|CRON_SECRET)\s*=\s*(.*)$'
        ) {
            $name = $Matches[1]
            $rawValue = $Matches[2]
            $value = Remove-SurroundingQuotes -Value $rawValue

            if (-not [string]::IsNullOrWhiteSpace($value)) {
                Add-SecretResult `
                    -Results $results `
                    -Source $environmentFile `
                    -Name $name `
                    -Value $value `
                    -Priority $priority
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

$sortedResults = $results |
    Sort-Object Priority, Name

$sortedResults |
    Format-Table Source, Name, Length, Fingerprint -AutoSize

Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host (
    "Next.js uses process.env first, then .env.development.local, " +
    ".env.local, .env.development, and .env."
)
Write-Host (
    "The API route prefers ATTENDANCE_AUTOMATION_SECRET over CRON_SECRET."
)
Write-Host ""

$attendanceSecrets = $sortedResults |
    Where-Object {
        $_.Name -eq "ATTENDANCE_AUTOMATION_SECRET"
    }

$cronSecrets = $sortedResults |
    Where-Object {
        $_.Name -eq "CRON_SECRET"
    }

if ($attendanceSecrets.Count -gt 1) {
    Write-Host (
        "Multiple ATTENDANCE_AUTOMATION_SECRET declarations were found."
    ) -ForegroundColor Yellow
}

if ($cronSecrets.Count -gt 1) {
    Write-Host (
        "Multiple CRON_SECRET declarations were found."
    ) -ForegroundColor Yellow
}

Write-Host (
    "Compare the API response expectedFingerprint with the table above."
) -ForegroundColor Green