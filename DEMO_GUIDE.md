# Demo Guide for Deliverable 2

## Quick Demo Script (10 minutes)

### 1. Show Test Pipeline Overview (1 min)
```bash
cat TEST_PIPELINE.md
```
Explain: Unit tests, Integration tests, E2E tests, Coverage, Security, Performance

### 2. Run All Tests Locally (3 min)
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```
Show:
- Unit tests passing
- Integration tests passing
- Coverage reports generated
- Security scans running

### 3. Show Coverage Reports (2 min)
```bash
# Open coverage reports in browser
open auth-api/coverage/lcov-report/index.html
open frontend/coverage/lcov-report/index.html
```
Highlight:
- Coverage percentages
- Which files are covered
- Branch/function/line coverage

### 4. Security Scans (2 min)
```bash
# NPM audit
npm audit

# Container scanning
docker run --rm -v $(pwd):/app aquasec/trivy:latest fs /app --severity HIGH,CRITICAL
```
Show:
- No HIGH or CRITICAL vulnerabilities
- Security-first approach

### 5. Performance Tests (2 min)
```bash
# Load test
k6 run performance-test.js
```
Show:
- 100 concurrent users
- Response times < 500ms
- Error rate < 5%

### 6. CI/CD Pipeline (Optional - 1 min)
Open GitHub Actions:
- Show successful pipeline runs
- Show test results
- Show coverage reports
- Show security scan results

## Key Points to Emphasize

1. **Comprehensive Testing**
   - Unit + Integration + E2E
   - 70%+ coverage on all services
   - Automated in CI/CD

2. **Security-First**
   - SAST (CodeQL)
   - Container scanning (Trivy)
   - Dependency auditing
   - Automated in pipeline

3. **Performance Validated**
   - Load tested to 100 users
   - Stress tested to 500 users
   - Response time thresholds enforced

4. **Quality Gates**
   - Coverage thresholds enforced
   - Security vulnerabilities block builds
   - Performance thresholds validated

## Files Created

### Test Files
- `performance-test.js` - Load testing with k6
- `stress-test.js` - Stress testing to find breaking point
- `run-all-tests.sh` - Comprehensive test runner

### Security Files
- `.github/workflows/codeql.yml` - SAST analysis
- `.github/workflows/container-scan.yml` - Container scanning
- `container-scan.sh` - Local container scanning script
- `sonar-project.properties` - SonarQube configuration

### Coverage Files
- `.github/workflows/coverage.yml` - Coverage reporting
- Updated `auth-api/package.json` with coverage config

### Documentation
- `TEST_PIPELINE.md` - Complete test documentation
- `DEMO_GUIDE.md` - This file

### Updated Files
- `.github/workflows/main.yml` - Enhanced main pipeline
- `.gitlab-ci.yml` - Enhanced GitLab pipeline

## Requirements for Demo

Install these tools:
```bash
# k6 for performance tests
brew install k6  # macOS
# or
choco install k6  # Windows

# Trivy for container scanning (optional - can use Docker)
# Already included in CI/CD
```

## What This Demonstrates

✅ **Microservices Architecture POC**
- Multiple services tested independently
- Inter-service communication tested

✅ **API Microservices + Communication**
- Integration tests verify API contracts
- E2E tests verify complete flows

✅ **Web App POC**
- Frontend tests with coverage
- E2E tests for user flows

✅ **Security Focus**
- SAST (CodeQL)
- Container scanning (Trivy)
- Dependency auditing
- Security policies in CI/CD

✅ **Code Quality Focus**
- Coverage reports (70%+ threshold)
- Linting integrated
- Quality gates enforced

✅ **Improvement Axes Identified**
- Mobile app testing (not yet implemented)
- More comprehensive performance monitoring
- Chaos engineering tests
- Contract testing (Pact)

## Questions to Anticipate

**Q: Why 70% coverage threshold?**
A: Balances thoroughness with development speed. Critical paths are covered.

**Q: How do you handle security vulnerabilities?**
A: Automated scanning in CI/CD. HIGH/CRITICAL block deployment.

**Q: What happens when tests fail?**
A: Pipeline stops. No deployment until fixed. Quality gates enforced.

**Q: How do you test performance?**
A: Load tests simulate 100 users. Stress tests find breaking point. Thresholds enforced.

**Q: Why both GitHub Actions and GitLab CI?**
A: Demonstrates CI/CD platform flexibility. Both are fully functional.

## Next Steps (Improvement Axes)

1. Mobile App Testing (Detox / Appium)
2. Contract Testing (Pact)
3. Chaos Engineering (Chaos Mesh)
4. Monitoring Integration (Prometheus/Grafana)
5. Automated Regression Testing
6. Performance Baseline Tracking
