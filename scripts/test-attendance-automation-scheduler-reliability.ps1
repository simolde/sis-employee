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

    $first =
        $normalized.Substring(0, 1)

    $last =
        $normalized.Substring(
            $normalized.Length - 1,
            1
        )

    if (
        (
            $first -eq '"' -and
            $last -eq '"'
        ) -or
        (
            $first -eq "'" -and
            $last -eq "'"
        )
    ) {
        return $normalized.Substring(
            1,
            $normalized.Length - 2
        )
    }

    return $normalized
}

function Get-EnvironmentValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$VariableName
    )

    $processValue =
        [Environment]::GetEnvironmentVariable(
            $VariableName,
            "Process"
        )

    if (
        -not [string]::IsNullOrWhiteSpace(
            $processValue
        )
    ) {
        return $processValue.Trim()
    }

    $environmentFiles = @(
        ".env.development.local",
        ".env.local",
        ".env.development",
        ".env"
    )

    $escapedVariableName =
        [Regex]::Escape(
            $VariableName
        )

    foreach ($environmentFile in $environmentFiles) {
        if (
            -not (
                Test-Path `
                    -LiteralPath $environmentFile
            )
        ) {
            continue
        }

        $matchingLine =
            Get-Content `
                -LiteralPath $environmentFile |
            Where-Object {
                $_ -match "^\s*$escapedVariableName\s*="
            } |
            Select-Object -First 1

        if (
            [string]::IsNullOrWhiteSpace(
                $matchingLine
            )
        ) {
            continue
        }

        $parts =
            $matchingLine -split "=", 2

        if ($parts.Count -lt 2) {
            continue
        }

        $value =
            Remove-SurroundingQuotes `
                -Value $parts[1]

        if (
            -not [string]::IsNullOrWhiteSpace(
                $value
            )
        ) {
            return $value.Trim()
        }
    }

    return $null
}

if (
    [string]::IsNullOrWhiteSpace(
        $Secret
    )
) {
    $Secret =
        Get-EnvironmentValue `
            -VariableName "ATTENDANCE_AUTOMATION_SECRET"
}

if (
    [string]::IsNullOrWhiteSpace(
        $Secret
    )
) {
    $Secret =
        Get-EnvironmentValue `
            -VariableName "CRON_SECRET"
}

if (
    [string]::IsNullOrWhiteSpace(
        $Secret
    )
) {
    throw @"
No attendance automation secret was found.

Configure ATTENDANCE_AUTOMATION_SECRET or run:

.\scripts\test-attendance-automation-scheduler-reliability.ps1 -Secret "your-secret"
"@
}

$uri = (
    $BaseUrl.TrimEnd("/") +
    "/api/automation/attendance/scheduler-reliability"
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
    "Attendance automation scheduler reliability" `
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

$curlOutput =
    & curl.exe @curlArguments

$curlExitCode =
    $LASTEXITCODE

if ($curlExitCode -ne 0) {
    throw (
        "curl.exe failed with exit code " +
        "$curlExitCode."
    )
}

$outputText =
    $curlOutput -join "`n"

$statusMatch =
    [Regex]::Match(
        $outputText,
        "__HTTP_STATUS__:(\d{3})\s*$"
    )

if (-not $statusMatch.Success) {
    throw (
        "The HTTP status could not be read " +
        "from the endpoint response."
    )
}

$statusCode =
    [int]$statusMatch.Groups[1].Value

$responseBody =
    $outputText.Substring(
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
            ConvertTo-Json -Depth 30
    }
    catch {
        Write-Host $responseBody
    }
}

Write-Host ""

switch ($statusCode) {
    200 {
        Write-Host (
            "Scheduler reliability is not breached."
        ) -ForegroundColor Green

        exit 0
    }

    503 {
        Write-Host (
            "Scheduler reliability target is currently breached."
        ) -ForegroundColor Yellow

        exit 0
    }

    401 {
        Write-Host (
            "The automation secret was rejected."
        ) -ForegroundColor Red

        exit 1
    }

    default {
        Write-Host (
            "Scheduler reliability request failed."
        ) -ForegroundColor Red

        exit 1
    }
}