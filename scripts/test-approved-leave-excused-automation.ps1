param(
    [string]$Secret = $env:ATTENDANCE_AUTOMATION_SECRET,

    [string]$BaseUrl = "http://localhost:3000",

    [string]$DateFrom = "",

    [string]$DateTo = "",

    [ValidateRange(1, 500)]
    [int]$Limit = 100,

    [ValidateSet(
        "Authorization",
        "XAttendance",
        "XCron"
    )]
    [string]$HeaderMode = "Authorization"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Secret)) {
    throw @"
No secret was supplied.

Examples:

.\scripts\test-approved-leave-excused-automation.ps1 `
  -Secret "your-exact-secret"

or:

`$env:ATTENDANCE_AUTOMATION_SECRET = "your-exact-secret"
.\scripts\test-approved-leave-excused-automation.ps1
"@
}

$headers = @{}

switch ($HeaderMode) {
    "Authorization" {
        $headers["Authorization"] = "Bearer $Secret"
    }

    "XAttendance" {
        $headers["X-Attendance-Automation-Secret"] = $Secret
    }

    "XCron" {
        $headers["X-Cron-Secret"] = $Secret
    }
}

$queryParameters = New-Object "System.Collections.Generic.List[string]"

if (
    -not [string]::IsNullOrWhiteSpace($DateFrom)
) {
    $queryParameters.Add(
        "dateFrom=$([Uri]::EscapeDataString($DateFrom))"
    )
}

if (
    -not [string]::IsNullOrWhiteSpace($DateTo)
) {
    $queryParameters.Add(
        "dateTo=$([Uri]::EscapeDataString($DateTo))"
    )
}

$queryParameters.Add("limit=$Limit")

$uri = (
    $BaseUrl.TrimEnd("/") +
    "/api/automation/attendance/approved-leave-excused"
)

if ($queryParameters.Count -gt 0) {
    $uri += "?" + ($queryParameters -join "&")
}

Write-Host ""
Write-Host "Testing approved-leave EXCUSED automation" -ForegroundColor Cyan
Write-Host "URI: $uri"
Write-Host "Header mode: $HeaderMode"
Write-Host "Secret length: $($Secret.Trim().Length)"
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Method Post `
        -Uri $uri `
        -Headers $headers `
        -ContentType "application/json"

    $response |
        ConvertTo-Json -Depth 10

    exit 0
}
catch {
    $statusCode = $null
    $responseBody = $null
    $response = $_.Exception.Response

    if ($response) {
        try {
            $statusCode = [int]$response.StatusCode
        }
        catch {
            $statusCode = $null
        }

        if ($response.Content) {
            try {
                $responseBody = $response.Content
                    .ReadAsStringAsync()
                    .GetAwaiter()
                    .GetResult()
            }
            catch {
                $responseBody = $null
            }
        }

        if (
            -not $responseBody -and
            $response.GetResponseStream
        ) {
            try {
                $stream = $response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $responseBody = $reader.ReadToEnd()
                $reader.Dispose()
                $stream.Dispose()
            }
            catch {
                $responseBody = $null
            }
        }
    }

    Write-Host "Request failed." -ForegroundColor Red

    if ($statusCode) {
        Write-Host "HTTP status: $statusCode" -ForegroundColor Red
    }

    if ($responseBody) {
        Write-Host ""
        Write-Host $responseBody
    }
    else {
        Write-Host $_.Exception.Message
    }

    exit 1
}