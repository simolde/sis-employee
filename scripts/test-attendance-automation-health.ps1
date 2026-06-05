param(
    [string]$BaseUrl = "http://localhost:3000",

    [string]$Secret = "",

    [ValidateSet(
        "Authorization",
        "XAttendance",
        "XCron"
    )]
    [string]$HeaderMode = "XAttendance"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Remove-SurroundingQuotes {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $normalized = $Value.Trim()

    if ($normalized.Length -lt 2) {
        return $normalized
    }

    $firstCharacter = $normalized.Substring(0, 1)

    $lastCharacter = $normalized.Substring(
        $normalized.Length - 1,
        1
    )

    $hasDoubleQuotes =
        $firstCharacter -eq '"' -and
        $lastCharacter -eq '"'

    $hasSingleQuotes =
        $firstCharacter -eq "'" -and
        $lastCharacter -eq "'"

    if ($hasDoubleQuotes -or $hasSingleQuotes) {
        return $normalized.Substring(
            1,
            $normalized.Length - 2
        )
    }

    return $normalized
}

function Find-EnvironmentVariableInFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$VariableName
    )

    $environmentFiles = @(
        ".env.development.local",
        ".env.local",
        ".env.development",
        ".env"
    )

    foreach ($environmentFile in $environmentFiles) {
        if (-not (Test-Path -LiteralPath $environmentFile)) {
            continue
        }

        $escapedName = [Regex]::Escape($VariableName)

        $matchingLine = Get-Content -LiteralPath $environmentFile |
            Where-Object {
                $_ -match "^\s*$escapedName\s*="
            } |
            Select-Object -First 1

        if (-not $matchingLine) {
            continue
        }

        $parts = $matchingLine -split "=", 2

        if ($parts.Count -lt 2) {
            continue
        }

        $value = Remove-SurroundingQuotes `
            -Value $parts[1]

        if (-not [string]::IsNullOrWhiteSpace($value)) {
            return $value.Trim()
        }
    }

    return $null
}

function Find-AutomationSecret {
    $processAttendanceSecret =
        [Environment]::GetEnvironmentVariable(
            "ATTENDANCE_AUTOMATION_SECRET",
            "Process"
        )

    if (
        -not [string]::IsNullOrWhiteSpace(
            $processAttendanceSecret
        )
    ) {
        return $processAttendanceSecret.Trim()
    }

    $fileAttendanceSecret =
        Find-EnvironmentVariableInFiles `
            -VariableName "ATTENDANCE_AUTOMATION_SECRET"

    if (
        -not [string]::IsNullOrWhiteSpace(
            $fileAttendanceSecret
        )
    ) {
        return $fileAttendanceSecret
    }

    $processCronSecret =
        [Environment]::GetEnvironmentVariable(
            "CRON_SECRET",
            "Process"
        )

    if (
        -not [string]::IsNullOrWhiteSpace(
            $processCronSecret
        )
    ) {
        return $processCronSecret.Trim()
    }

    return Find-EnvironmentVariableInFiles `
        -VariableName "CRON_SECRET"
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
    $Secret = Find-AutomationSecret
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
    throw @"
No attendance automation secret was found.

Add one of these variables to .env.local:

ATTENDANCE_AUTOMATION_SECRET=your-secret

or:

CRON_SECRET=your-secret
"@
}

$uri = (
    $BaseUrl.TrimEnd("/") +
    "/api/automation/attendance/health"
)

$headerValue = switch ($HeaderMode) {
    "Authorization" {
        "Authorization: Bearer $Secret"
    }

    "XAttendance" {
        "X-Attendance-Automation-Secret: $Secret"
    }

    "XCron" {
        "X-Cron-Secret: $Secret"
    }
}

Write-Host ""
Write-Host "Attendance automation health check" `
    -ForegroundColor Cyan

Write-Host "Endpoint: $uri"
Write-Host "Header mode: $HeaderMode"
Write-Host "Secret length: $($Secret.Length)"
Write-Host ""

$curlOutput = & curl.exe `
    --silent `
    --show-error `
    --request GET `
    --header $headerValue `
    --write-out "`n__HTTP_STATUS__:%{http_code}" `
    $uri

$curlExitCode = $LASTEXITCODE

if ($curlExitCode -ne 0) {
    throw "curl.exe failed with exit code $curlExitCode."
}

$outputText = $curlOutput -join "`n"

$statusMatch = [Regex]::Match(
    $outputText,
    "__HTTP_STATUS__:(\d{3})\s*$"
)

if (-not $statusMatch.Success) {
    throw "The HTTP status could not be read from the response."
}

$statusCode = [int]$statusMatch.Groups[1].Value

$responseBody = $outputText.Substring(
    0,
    $statusMatch.Index
).Trim()

$httpColor = switch ($statusCode) {
    200 {
        "Green"
    }

    503 {
        "Yellow"
    }

    default {
        "Red"
    }
}

Write-Host "HTTP status: $statusCode" `
    -ForegroundColor $httpColor

Write-Host ""

if (-not [string]::IsNullOrWhiteSpace($responseBody)) {
    try {
        $parsedResponse = $responseBody |
            ConvertFrom-Json

        $parsedResponse |
            ConvertTo-Json -Depth 20
    }
    catch {
        Write-Host $responseBody
    }
}

Write-Host ""

switch ($statusCode) {
    200 {
        Write-Host (
            "The attendance automation health check passed."
        ) -ForegroundColor Green

        exit 0
    }

    503 {
        Write-Host (
            "Authentication succeeded, but automation health requires attention."
        ) -ForegroundColor Yellow

        exit 0
    }

    401 {
        Write-Host (
            "The request secret was missing or incorrect."
        ) -ForegroundColor Red

        exit 1
    }

    default {
        Write-Host (
            "The automation health request failed."
        ) -ForegroundColor Red

        exit 1
    }
}