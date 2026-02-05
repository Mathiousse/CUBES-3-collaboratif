$outputFile = "C:\Users\mmous\Documents\School\CUBES-3-collaboratif\project_audit.txt"
$targetDir = "C:\Users\mmous\Documents\School\CUBES-3-collaboratif"

# Start recording output to file
Start-Transcript -Path $outputFile -Force

Set-Location $targetDir

Write-Output "== Project Structure Overview (first 100 files, filtered) =="
# keeping rg because it is extremely fast
rg --files -g "!**/node_modules/**" -g "!**/.git/**" -g "!**/__pycache__/**" -g "!**/.next/**" -g "!**/dist/**" -g "!**/build/**" | Select-Object -First 100

Write-Output ""
Write-Output "Scanning directory structure (This happens once)..."

# PERFORMANCE BOOST: Scan the disk only ONCE
$allParams = @{
    Recurse = $true
    Force   = $true
    ErrorAction = 'SilentlyContinue'
}
$allItems = Get-ChildItem @allParams

Write-Output ""
Write-Output "== Find All Code Folders =="
$allItems | Where-Object { $_.PSIsContainer -and $_.FullName -notmatch "\\node_modules\\" -and $_.Name -match "service|api|app|backend|frontend|mobile|web" } | ForEach-Object { $_.FullName }

Write-Output ""
Write-Output "== Docker & Kubernetes Files =="
$allItems | Where-Object { -not $_.PSIsContainer -and $_.Name -match "dockerfile|docker-compose|\.ya?ml|kubernetes|k8s|helm" } | ForEach-Object { $_.FullName }

Write-Output ""
Write-Output "== Microservices Structure (if exists) =="
$allItems | Where-Object { $_.Name -match "auth|order|payment|logistics|delivery|user|client|commande|service" } | ForEach-Object { $_.FullName }

Write-Output ""
Write-Output "== CI/CD Configuration =="
$allItems | Where-Object { $_.Name -match "\.gitlab-ci|\.github|jenkinsfile|argo|pipeline" } | ForEach-Object { $_.FullName }

Write-Output ""
Write-Output "== Package/Config Files =="
$allItems | Where-Object { -not $_.PSIsContainer -and $_.Name -match "package\.json|requirements\.txt|pom\.xml|go\.mod|Cargo\.toml|composer\.json" } | ForEach-Object { $_.FullName }

Write-Output ""
Write-Output "== Database Files =="
$allItems | Where-Object { -not $_.PSIsContainer -and $_.Name -match "\.sql|schema|migration|prisma|mongoose|entity" } | ForEach-Object { $_.FullName }

Write-Output ""
Write-Output "== README/Docs =="
$allItems | Where-Object { -not $_.PSIsContainer -and $_.Name -match "readme|\.md|documentation|docs" } | ForEach-Object { $_.FullName }

# Stop recording
Stop-Transcript