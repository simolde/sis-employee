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

    $first = $normalized.Substring(0, 1)

    $last = $normalized.Substring(
        $normalized.Length - 1,
        1
    )

    if (
        ($first -eq '"' -and $last -eq '"') -or
        ($first -eq "'" -and $last -eq "'")
    ) {
        return $normalized.Substring(
            1,
            $normalized.Length - 2
        )
    }

    return $normalized
}

function Get-EnvironmentValueFromFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string]$VariableName
    )

    if (-not (Test-Path -LiteralPath $FilePath)) {
        return $null
    }

    $escapedVariableName =
        [Regex]::Escape($VariableName)

    $line = Get-Content -LiteralPath $FilePath |
        Where-Object {
            $_ -match "^\s*$escapedVariableName\s*="
        } |
        Select-Object -First 1

    if ([string]::IsNullOrWhiteSpace($line)) {
        return $null
    }

    $parts = $line -split "=", 2

    if ($parts.Count -lt 2) {
        return $null
    }

    return Remove-SurroundingQuotes `
        -Value $parts[1]
}

function Get-AutomationSecret {
    $variableNames = @(
        "ATTENDANCE_AUTOMATION_SECRET",
        "CRON_SECRET"
    )

    foreach ($variableName in $variableNames) {
        $processValue =
            [Environment]::GetEnvironmentVariable(
                $variableName,
                "Process"
            )

        if (
            -not [string]::IsNullOrWhiteSpace(
                $processValue
            )
        ) {
            return $processValue.Trim()
        }
    }

    $environmentFiles = @(
        ".env.development.local",
        ".env.local",
        ".env.development",
        ".env"
    )

    foreach ($environmentFile in $environmentFiles) {
        foreach ($variableName in $variableNames) {
            $fileValue =
                Get-EnvironmentValueFromFile `
                    -FilePath $environmentFile `
                    -VariableName $variableName

            if (
                -not [string]::IsNullOrWhiteSpace(
                    $fileValue
                )
            ) {
                return $fileValue.Trim()
            }
        }
    }

    return $null
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
    $Secret = Get-AutomationSecret
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
    throw @"
No attendance automation secret was found.

Configure ATTENDANCE_AUTOMATION_SECRET in an environment file or run:

.\scripts\test-attendance-automation-scheduler-readiness.ps1 -Secret "your-secret"
"@
}

$uri = (
    $BaseUrl.TrimEnd("/") +
    "/api/automation/attendance/scheduler-readiness"
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
Write-Host `
    "Attendance automation scheduler readiness" `
    -ForegroundColor Cyan

Write-Host "Endpoint: $uri"
Write-Host "Header mode: $HeaderMode"
Write-Host "Secret length: $($Secret.Length)"
Write-Host ""

$curlArguments = @(
    "--silent"
    "--show-error"
    "--request"
    "GET"
    "--header"
    $headerValue
    "--write-out"
    "`n__HTTP_STATUS__:%{http_code}"
    $uri
)

$curlOutput = & curl.exe @curlArguments

if ($LASTEXITCODE -ne 0) {
    throw "curl.exe failed with exit code $LASTEXITCODE."
}

$outputText = $curlOutput -join "`n"

$statusMatch = [Regex]::Match(
    $outputText,
    "__HTTP_STATUS__:(\d{3})\s*$"
)

if (-not $statusMatch.Success) {
    throw "The HTTP status could not be read."
}

$statusCode =
    [int]$statusMatch.Groups[1].Value

$responseBody = $outputText.Substring(
    0,
    $statusMatch.Index
).Trim()

$statusColor = switch ($statusCode) {
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

Write-Host `
    "HTTP status: $statusCode" `
    -ForegroundColor $statusColor

Write-Host ""

if (
    -not [string]::IsNullOrWhiteSpace(
        $responseBody
    )
) {
    try {
        $response =
            $responseBody |
            ConvertFrom-Json

        $response |
            ConvertTo-Json -Depth 20
    }
    catch {
        Write-Host $responseBody
    }
}

Write-Host ""

switch ($statusCode) {
    200 {
        Write-Host `
            "Scheduler readiness is not blocked." `
            -ForegroundColor Green

        exit 0
    }

    503 {
        Write-Host `
            "Scheduler readiness is blocked by one or more failed checks." `
            -ForegroundColor Yellow

        exit 0
    }

    401 {
        Write-Host `
            "The request secret was missing or incorrect." `
            -ForegroundColor Red

        exit 1
    }

    default {
        Write-Host `
            "The scheduler readiness request failed." `
            -ForegroundColor Red

        exit 1
    }
}