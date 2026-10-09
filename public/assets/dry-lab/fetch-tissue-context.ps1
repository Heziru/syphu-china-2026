# Reproduce the source snapshot used by tissue-context.json.
# Requires PowerShell 5.1 or later; no extra packages.
# Usage: powershell -File fetch-tissue-context.ps1 -OutputPath ./gtex-PI3-fresh.json
# Existing files are never overwritten. This script does not update website assets.
param([Parameter(Mandatory = $true)][string]$OutputPath)
$ErrorActionPreference = 'Stop'
if (Test-Path -LiteralPath $OutputPath) { throw "Output already exists: $OutputPath" }
$uri = 'https://gtexportal.org/api/v2/expression/medianGeneExpression?gencodeId=ENSG00000124102.4&datasetId=gtex_v8'
$response = Invoke-RestMethod -Uri $uri -Method Get
if (@($response.data).Count -ne 54) { throw 'Unexpected tissue count; inspect the API before using this response.' }
foreach ($row in $response.data) {
    if ($row.gencodeId -ne 'ENSG00000124102.4' -or $row.datasetId -ne 'gtex_v8' -or $row.unit -ne 'TPM' -or $null -eq $row.median) {
        throw 'Unexpected gene, dataset, unit, or missing median.'
    }
}
$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath), ($response | ConvertTo-Json -Depth 20), $utf8)
Write-Output "Saved 54 GTEx v8 tissue medians to $OutputPath. Retrieved UTC: $([DateTime]::UtcNow.ToString('o'))"
# Values are API medians, not case-control effects. Do not interpret them as IBD expression changes.
