# jmrsquared-standards statusline — reads .jmr-active and renders a badge.

$ErrorActionPreference = 'SilentlyContinue'

$ConfigDir = $Env:CLAUDE_CONFIG_DIR
if ([string]::IsNullOrEmpty($ConfigDir)) {
    $ConfigDir = Join-Path $Env:USERPROFILE '.claude'
}
$Flag = Join-Path $ConfigDir '.jmr-active'

$Orange = "`e[38;5;208m"
$Reset = "`e[0m"

if (-not (Test-Path $Flag)) {
    Write-Output "${Orange}[JMR]${Reset}"
    exit 0
}

$Content = (Get-Content -Raw -Path $Flag -ErrorAction SilentlyContinue).Trim()
if ([string]::IsNullOrEmpty($Content) -or $Content -eq '@') {
    Write-Output "${Orange}[JMR]${Reset}"
    exit 0
}

Write-Output "${Orange}[JMR: $Content]${Reset}"
