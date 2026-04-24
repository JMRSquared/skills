$ErrorActionPreference = 'Stop'

$ConfigDir = $Env:CLAUDE_CONFIG_DIR
if ([string]::IsNullOrEmpty($ConfigDir)) {
    $ConfigDir = Join-Path $Env:USERPROFILE '.claude'
}
$Target = Join-Path $ConfigDir 'hooks\wonderhire-standards'
$Src = Split-Path -Parent $MyInvocation.MyCommand.Path

New-Item -ItemType Directory -Force -Path $Target | Out-Null
Copy-Item -Force (Join-Path $Src 'wh-config.js')        $Target
Copy-Item -Force (Join-Path $Src 'wh-session-start.js') $Target
Copy-Item -Force (Join-Path $Src 'wh-statusline.sh')    $Target
Copy-Item -Force (Join-Path $Src 'wh-statusline.ps1')   $Target
Copy-Item -Force (Join-Path $Src 'package.json')        $Target

Write-Output "Installed wonderhire-standards hooks to $Target"
Write-Output ''
Write-Output "Add to $ConfigDir\settings.json:"
Write-Output '  "hooks": {'
Write-Output '    "SessionStart": ['
Write-Output "      { `"command`": `"node $($Target -replace '\\','\\\\')\\wh-session-start.js`" }"
Write-Output '    ]'
Write-Output '  },'
Write-Output '  "statusLine": {'
Write-Output '    "type": "command",'
Write-Output "    `"command`": `"$($Target -replace '\\','\\\\')\\wh-statusline.ps1`""
Write-Output '  }'
