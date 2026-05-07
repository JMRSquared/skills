$ErrorActionPreference = 'Stop'

$ConfigDir = $Env:CLAUDE_CONFIG_DIR
if ([string]::IsNullOrEmpty($ConfigDir)) {
    $ConfigDir = Join-Path $Env:USERPROFILE '.claude'
}
$Target = Join-Path $ConfigDir 'hooks\jmrsquared-standards'
$Src = Split-Path -Parent $MyInvocation.MyCommand.Path

New-Item -ItemType Directory -Force -Path $Target | Out-Null
Copy-Item -Force (Join-Path $Src 'jmr-config.js')        $Target
Copy-Item -Force (Join-Path $Src 'jmr-session-start.js') $Target
Copy-Item -Force (Join-Path $Src 'jmr-statusline.sh')    $Target
Copy-Item -Force (Join-Path $Src 'jmr-statusline.ps1')   $Target
Copy-Item -Force (Join-Path $Src 'package.json')         $Target

Write-Output "Installed jmrsquared-standards hooks to $Target"
Write-Output ''
Write-Output "Add to $ConfigDir\settings.json:"
Write-Output '  "hooks": {'
Write-Output '    "SessionStart": ['
Write-Output "      { `"command`": `"node $($Target -replace '\\','\\\\')\\jmr-session-start.js`" }"
Write-Output '    ]'
Write-Output '  },'
Write-Output '  "statusLine": {'
Write-Output '    "type": "command",'
Write-Output "    `"command`": `"$($Target -replace '\\','\\\\')\\jmr-statusline.ps1`""
Write-Output '  }'
