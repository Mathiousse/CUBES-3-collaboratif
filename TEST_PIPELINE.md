# Test Pipeline Documentation

## Overview

This project includes a comprehensive testing suite covering unit tests, integration tests, security scans, performance tests, and coverage reports.

## Test Types

### 1. Unit Tests
Test individual components in isolation.

```bash
# Run all unit tests
npm run test:all-units

# Run specific API tests
npm run test:auth
npm run test:logistics
npm run test:orders
npm run test:frontend
```

### 2. Integration Tests
Test inter-service communication and API contracts.

```bash
npm run test:integration
```

### 3. End-to-End Tests
Test complete user flows through the frontend.

```bash
npm run test:frontend:e2e
```

### 4. Coverage Reports
Generate code coverage reports for all services.

```bash
# Individual services
cd auth-api && npm run test:coverage
cd commande-api && npm run test:coverage
cd frontend && npm run test:coverage

# All services
npm run test:all
```

Coverage thresholds are set to 70% minimum for:
- Branches
- Functions
- Lines
- Statements

### 5. Security Scans

#### NPM Audit
Check for known vulnerabilities in dependencies.

```bash
npm audit --audit-level=high
```

#### Container Scanning (Trivy)
Scan Docker images and filesystems for vulnerabilities.

```bash
# Scan all services
./container-scan.sh

# Or manually
docker run --rm -v $(pwd):/app aquasec/trivy:latest fs /app --severity HIGH,CRITICAL
```

#### SAST (CodeQL)
Static Application Security Testing via GitHub Actions.

Automatically runs on:
- Push to main/master
- Pull requests
- Weekly schedule (Mondays)

Results are available in the GitHub Security tab.

#### SonarQube
Comprehensive code quality and security analysis.

```bash
# Install sonar-scanner first
sonar-scanner
```

### 6. Performance Tests

#### Load Testing (k6)
Simulate normal load to verify performance under expected conditions.

```bash
# Install k6 first: https://k6.io/docs/getting-started/installation/
k6 run performance-test.js
```

Test configuration:
- Ramp-up: 0 → 50 users (30s)
- Steady: 50 users (1m)
- Ramp-up: 50 → 100 users (30s)
- Steady: 100 users (1m)
- Ramp-down: 100 → 0 (30s)

Thresholds:
- 95% of requests < 500ms
- Error rate < 5%

#### Stress Testing (k6)
Find the system's breaking point.

```bash
k6 run stress-test.js
```

Test configuration:
- Ramp-up: 0 → 200 users (2m)
- Steady: 200 users (5m)
- Spike: 200 → 500 users (30s)
- Steady: 500 users (2m)
- Ramp-down: 500 → 0 (1m)

## CI/CD Integration

### GitHub Actions

The following workflows are configured:

1. **main.yml** - Main CI/CD pipeline
   - Build & test all services
   - Generate coverage reports
   - Security scanning
   - Performance tests

2. **codeql.yml** - SAST analysis
   - JavaScript security analysis
   - Runs weekly and on push/PR

3. **container-scan.yml** - Container security
   - Trivy scans for all services
   - Blocks on HIGH/CRITICAL vulnerabilities

4. **coverage.yml** - Coverage reports
   - Generates coverage for all services
   - Uploads to Codecov (if configured)
   - Creates GitHub summary

### GitLab CI

The `.gitlab-ci.yml` includes:
- Dependency installation
- Integration tests with MongoDB/PostgreSQL
- Frontend build
- Security audit

## Running All Tests Locally

Use the comprehensive test runner:

```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

This will run:
1. All unit tests
2. Integration tests
3. E2E tests
4. Coverage reports
5. Security scans
6. Performance tests (if k6 installed)

## Test Reports

### Coverage Reports
Located in:
- `auth-api/coverage/lcov-report/`
- `commande-api/coverage/lcov-report/`
- `frontend/coverage/lcov-report/`

Open `index.html` in each folder for detailed coverage reports.

### Security Reports
- GitHub Security tab (CodeQL)
- Console output (Trivy, npm audit)

### Performance Reports
- Console output with metrics
- k6 provides detailed statistics

## Demo Script

For Deliverable 2 presentation:

1. **Show Test Coverage**
   ```bash
   ./run-all-tests.sh
   # Show coverage reports in browser
   ```

2. **Show Security Scans**
   ```bash
   npm audit
   docker run --rm -v $(pwd):/app aquasec/trivy:latest fs /app
   ```

3. **Show Performance Tests**
   ```bash
   k6 run performance-test.js
   ```

4. **Show CI/CD Pipeline**
   - Navigate to GitHub Actions
   - Show successful pipeline runs
   - Show test results and coverage

5. **Show Code Quality**
   - Navigate to SonarQube dashboard (if configured)
   - Or show coverage reports

## Requirements

- Node.js 20+
- Docker (for container scanning)
- k6 (for performance tests)
- SonarQube scanner (optional, for SonarQube integration)

## Troubleshooting

### Coverage Too Low
If coverage is below 70%, tests will fail. Add more tests to uncovered areas.

### Performance Tests Fail
- Ensure services are running
- Check API_URL environment variable
- Verify thresholds are appropriate for your hardware

### Container Scans Find Vulnerabilities
- Update dependencies: `npm update`
- Check for known vulnerabilities in base images
- Use `.trivyignore` to suppress false positives (not recommended for production)

## Best Practices

1. Run tests locally before pushing
2. Keep coverage above 70%
3. Address security vulnerabilities promptly
4. Monitor performance trends over time
5. Review CI/CD pipeline results regularly
