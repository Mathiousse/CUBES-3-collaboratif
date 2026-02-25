#!/bin/bash
# Container Security Scan Script
# Run locally: ./container-scan.sh

# Use full path to trivy (chocolatey installation)
TRIVY_CMD="/mnt/c/ProgramData/chocolatey/bin/trivy.exe"

if [ ! -f "$TRIVY_CMD" ]; then
    echo "❌ Trivy not found at $TRIVY_CMD"
    echo "Install via: choco install trivy"
    exit 1
fi

echo "🔍 Starting Container Security Scan..."
echo ""

# Scan all Dockerfiles
echo "📦 Scanning Dockerfiles..."
$TRIVY_CMD config . --severity HIGH,CRITICAL

# Scan auth-api
echo ""
echo "🔐 Scanning Auth API..."
$TRIVY_CMD fs ./auth-api --severity HIGH,CRITICAL

# Scan commande-api
echo ""
echo "📝 Scanning Commande API..."
$TRIVY_CMD fs ./commande-api --severity HIGH,CRITICAL

# Scan api-gateway
echo ""
echo "🚪 Scanning API Gateway..."
$TRIVY_CMD fs ./api-gateway --severity HIGH,CRITICAL

# Scan frontend
echo ""
echo "🎨 Scanning Frontend..."
$TRIVY_CMD fs ./frontend --severity HIGH,CRITICAL

echo ""
echo "✅ Container Security Scan Complete!"
