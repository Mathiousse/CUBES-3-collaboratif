#!/bin/bash
# Comprehensive Test Suite Runner
# Runs all tests locally for demo

echo "🚀 Starting Comprehensive Test Suite for CUBES3"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0

# Function to run test and track result
run_test() {
    local name=$1
    local command=$2
    
    echo -e "${BLUE}▶ Running: $name${NC}"
    if eval $command; then
        echo -e "${GREEN}✓ PASSED: $name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED: $name${NC}"
        ((FAILED++))
    fi
    echo ""
}

# 1. Unit Tests
echo "════════════════════════════════════════"
echo "1️⃣  UNIT TESTS"
echo "════════════════════════════════════════"

run_test "Auth API Unit Tests" "cd auth-api && npm test"
run_test "Commande API Unit Tests" "cd commande-api && npm test"
run_test "Frontend Tests" "cd frontend && npm test"

# 2. Integration Tests
echo "════════════════════════════════════════"
echo "2️⃣  INTEGRATION TESTS"
echo "════════════════════════════════════════"

run_test "Integration Tests" "node test-integration.js"
run_test "E2E Frontend Tests" "node test-frontend-e2e.js"

# 3. Coverage Reports
echo "════════════════════════════════════════"
echo "3️⃣  COVERAGE REPORTS"
echo "════════════════════════════════════════"

run_test "Auth API Coverage" "cd auth-api && npm run test:coverage"
run_test "Commande API Coverage" "cd commande-api && npm run test:coverage"
run_test "Frontend Coverage" "cd frontend && npm run test:coverage"

# 4. Security Scans
echo "════════════════════════════════════════"
echo "4️⃣  SECURITY SCANS"
echo "════════════════════════════════════════"

run_test "NPM Security Audit" "npm audit --audit-level=high"
run_test "Container Security Scan (Trivy)" "docker run --rm -v \$(pwd):/app aquasec/trivy:latest fs /app --severity HIGH,CRITICAL"

# 5. Performance Tests
echo "════════════════════════════════════════"
echo "5️⃣  PERFORMANCE TESTS"
echo "════════════════════════════════════════"

# Use full path to k6 (chocolatey installation)
K6_CMD="/mnt/c/ProgramData/chocolatey/bin/k6.exe"
if [ -f "$K6_CMD" ]; then
    run_test "Load Test (k6)" "$K6_CMD run performance-test.js"
else
    echo -e "${YELLOW}⚠️  k6 not found - skipping performance tests${NC}"
fi

# Summary
echo ""
echo "════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "════════════════════════════════════════"
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
