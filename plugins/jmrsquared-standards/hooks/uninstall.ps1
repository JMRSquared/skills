$ErrorActionPreference = 'Stop'

$ConfigDir = $Env:CLAUDE_CONFIG_DIR
if ([string]::IsNullOrEmpty($ConfigDir)) {
    $ConfigDir = Join-Path $Env:USERPROFILE '.claude'
}
$Target = Join-Path $ConfigDir 'hooks\jmrsquared-standards'

if (Test-Path $Target) {
    Remove-Item -Recurse -Force $Target
    Write-Output "Removed $Target"
} else {
    Write-Output "Nothing to remove at $Target"
}

Write-Output "Now manually remove the SessionStart and statusLine entries from $ConfigDir\settings.json."
