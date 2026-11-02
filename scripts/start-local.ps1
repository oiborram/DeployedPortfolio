param([ValidateRange(1024,65535)][int]$Port = 4179)
$ErrorActionPreference = 'Stop'
$portfolioRoot = Split-Path -Parent $PSScriptRoot
$portfolioNode = (Get-Command node -ErrorAction Stop).Source
$portfolioEvidence = Join-Path $portfolioRoot '.victoria\local'
New-Item -ItemType Directory -Force -Path $portfolioEvidence | Out-Null
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    throw "Port $Port is already in use. No existing process was stopped."
}
$env:PORT = "$Port"
$env:HOST = '127.0.0.1'
$env:BASE_PATH = '/'
$portfolioProcess = Start-Process -FilePath $portfolioNode -ArgumentList 'server.mjs' -WorkingDirectory $portfolioRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $portfolioEvidence 'server.log') -RedirectStandardError (Join-Path $portfolioEvidence 'server-error.log')
@{pid=$portfolioProcess.Id;port=$Port;origin="http://127.0.0.1:$Port";project=$portfolioRoot;startedAt=[DateTimeOffset]::Now.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $portfolioEvidence 'server.json') -Encoding utf8
Write-Output "DeployedPortfolio started at http://127.0.0.1:$Port/ (PID $($portfolioProcess.Id))."
