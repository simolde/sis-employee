param(
    [string]$BaseUrl = "http://localhost:3000",

    [string]$Secret = "",

    [ValidateSet(
        "AUTOMATION",
        "HEALTH"
    )]
    [string]$Task = "AUTOMATION",

    [ValidateSet(
        "SUCCESS",
        "ATTENTION",
        "SKIPPED",
        "FAILED"
    )]
    [string]$Outcome = "SUCCESS",

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

    $firstCharacter =
        $normalized.Substring(0, 1)

    $lastCharacter =
        $normalized.Substring(
            $normalized.Length - 1,
            1
        )

    $hasDoubleQuotes = (
        $firstCharacter -eq '"' -and
        $lastCharacter -eq '"'
    )

    $hasSingleQuotes = (
        $firstCharacter -eq "'" -and
        $lastCharacter -eq "'"
    )

    if (
        $hasDoubleQuotes -or
        $hasSingleQuotes
    ) {
        return $normalized.Substring(
            1,
            $normalized.Length - 2
        )
    }

    return $normalized
}

function Get-EnvironmentFileValue {
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

    foreach ($variableName in $variableNames) {
        $fileValue =
            Get-EnvironmentFileValue `
                -VariableName $variableName

        if (
            -not [string]::IsNullOrWhiteSpace(
                $fileValue
            )
        ) {
            return $fileValue.Trim()
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
        Get-AutomationSecret
}

if (
    [string]::IsNullOrWhiteSpace(
        $Secret
    )
) {
    throw @"
No attendance automation secret was found.

Add this to .env:

ATTENDANCE_AUTOMATION_SECRET="your-secret"

Or run:

.\scripts\test-attendance-automation-scheduler-heartbeat.ps1 -Secret "your-secret"
"@
}

$executionId = (
    "manual-test-" +
    [Guid]::NewGuid().ToString("N")
)

$startedAt =
    (Get-Date).
    ToUniversalTime().
    ToString("o")

Start-Sleep -Milliseconds 300

$finishedAt =
    (Get-Date).
    ToUniversalTime().
    ToString("o")

$uri = (
    $BaseUrl.TrimEnd("/") +
    "/api/automation/attendance/scheduler-heartbeat/test"
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

$httpStatus = switch ($Outcome) {
    "SUCCESS" {
        "200"
    }

    "ATTENTION" {
        "503"
    }

    "SKIPPED" {
        "409"
    }

    "FAILED" {
        "500"
    }
}

Write-Host ""
Write-Host `
    "Attendance scheduler heartbeat safe test" `
    -ForegroundColor Cyan

Write-Host "Endpoint: $uri"
Write-Host "Task: $Task"
Write-Host "Outcome: $Outcome"
Write-Host "Execution ID: $executionId"
Write-Host "Header mode: $HeaderMode"
Write-Host "Secret length: $($Secret.Length)"
Write-Host ""

$curlArguments = @(
    "--silent"
    "--show-error"
    "--request"
    "POST"
    "--header"
    $headerValue
    "--data-urlencode"
    "executionId=$executionId"
    "--data-urlencode"
    "task=$Task"
    "--data-urlencode"
    "outcome=$Outcome"
    "--data-urlencode"
    "httpStatus=$httpStatus"
    "--data-urlencode"
    "startedAt=$startedAt"
    "--data-urlencode"
    "finishedAt=$finishedAt"
    "--data-urlencode"
    "message=Safe Windows heartbeat validation test."
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

    401 {
        "Red"
    }

    default {
        "Yellow"
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
        $parsedResponse =
            $responseBody |
            ConvertFrom-Json

        $parsedResponse |
            ConvertTo-Json -Depth 20
    }
    catch {
        Write-Host $responseBody
    }
}

Write-Host ""

if ($statusCode -eq 200) {
    Write-Host (
        "Heartbeat authentication and payload validation passed."
    ) -ForegroundColor Green

    Write-Host (
        "No scheduler activity log was created."
    ) -ForegroundColor Green

    exit 0
}

if ($statusCode -eq 401) {
    Write-Host (
        "The automation secret was rejected."
    ) -ForegroundColor Red

    exit 1
}

Write-Host (
    "Heartbeat validation failed."
) -ForegroundColor Red

exit 1