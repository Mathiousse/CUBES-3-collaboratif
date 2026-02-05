#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`  ✓ ${description}`, colors.green);
    return true;
  } else {
    log(`  ✗ ${description}`, colors.red);
    log(`    Missing: ${filePath}`, colors.gray);
    return false;
  }
}

async function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  if (exists) {
    log(`  ✓ ${description}`, colors.green);
    return true;
  } else {
    log(`  ✗ ${description}`, colors.red);
    return false;
  }
}

async function checkNodeModules(serviceDir) {
  const nmPath = path.join(serviceDir, 'node_modules');
  return fs.existsSync(nmPath);
}

async function checkDockerRunning() {
  try {
    await execPromise('docker --version');
    return true;
  } catch (error) {
    return false;
  }
}

async function checkMongoRunning() {
  try {
    await execPromise('mongosh --version');
    return true;
  } catch (error) {
    try {
      await execPromise('mongo --version');
      return true;
    } catch (error2) {
      return false;
    }
  }
}

async function verifySetup() {
  log('\n═══════════════════════════════════════════', colors.blue);
  log('🔍 Good Food MVP - Setup Verification', colors.blue);
  log('═══════════════════════════════════════════', colors.blue);

  const results = {
    structure: true,
    dependencies: true,
    config: true,
    tools: true
  };

  // Check project structure
  log('\n📁 Checking project structure...', colors.blue);
  results.structure = await checkDirectory('auth-api', 'auth-api directory') && results.structure;
  results.structure = await checkDirectory('logistique-api', 'logistique-api directory') && results.structure;
  results.structure = await checkDirectory('commande-api', 'commande-api directory') && results.structure;
  results.structure = await checkDirectory('api-gateway', 'api-gateway directory') && results.structure;
  results.structure = await checkDirectory('frontend', 'frontend directory') && results.structure;
  results.structure = await checkFile('docker-compose.yml', 'docker-compose.yml') && results.structure;
  results.structure = await checkFile('.gitignore', '.gitignore') && results.structure;

  // Check test files
  log('\n🧪 Checking test files...', colors.blue);
  results.structure = await checkFile('auth-api/tests/auth.test.js', 'Auth API tests') && results.structure;
  results.structure = await checkFile('logistique-api/tests/menu.test.js', 'Logistics API tests') && results.structure;
  results.structure = await checkFile('commande-api/tests/orders.test.js', 'Orders API tests') && results.structure;
  results.structure = await checkFile('test-integration.js', 'Integration tests') && results.structure;

  // Check dependencies
  log('\n📦 Checking dependencies...', colors.blue);
  results.dependencies = await checkFile('package.json', 'Root package.json') && results.dependencies;
  results.dependencies = await checkFile('auth-api/package.json', 'Auth API package.json') && results.dependencies;
  results.dependencies = await checkFile('logistique-api/package.json', 'Logistics API package.json') && results.dependencies;
  results.dependencies = await checkFile('commande-api/package.json', 'Orders API package.json') && results.dependencies;
  results.dependencies = await checkFile('api-gateway/package.json', 'API Gateway package.json') && results.dependencies;

  // Check node_modules
  log('\n📚 Checking installed packages...', colors.blue);
  const rootModules = await checkNodeModules('.');
  if (rootModules) {
    log('  ✓ Root node_modules installed', colors.green);
  } else {
    log('  ✗ Root node_modules missing', colors.red);
    log('    Run: npm install', colors.gray);
    results.dependencies = false;
  }

  const authModules = await checkNodeModules('auth-api');
  if (authModules) {
    log('  ✓ Auth API dependencies installed', colors.green);
  } else {
    log('  ✗ Auth API dependencies missing', colors.red);
    log('    Run: cd auth-api && npm install', colors.gray);
    results.dependencies = false;
  }

  const logisticsModules = await checkNodeModules('logistique-api');
  if (logisticsModules) {
    log('  ✓ Logistics API dependencies installed', colors.green);
  } else {
    log('  ✗ Logistics API dependencies missing', colors.red);
    log('    Run: cd logistique-api && npm install', colors.gray);
    results.dependencies = false;
  }

  const ordersModules = await checkNodeModules('commande-api');
  if (ordersModules) {
    log('  ✓ Orders API dependencies installed', colors.green);
  } else {
    log('  ✗ Orders API dependencies missing', colors.red);
    log('    Run: cd commande-api && npm install', colors.gray);
    results.dependencies = false;
  }

  const gatewayModules = await checkNodeModules('api-gateway');
  if (gatewayModules) {
    log('  ✓ API Gateway dependencies installed', colors.green);
  } else {
    log('  ✗ API Gateway dependencies missing', colors.red);
    log('    Run: cd api-gateway && npm install', colors.gray);
    results.dependencies = false;
  }

  // Check configuration files
  log('\n⚙️  Checking configuration...', colors.blue);
  const authEnv = fs.existsSync('auth-api/.env');
  if (authEnv) {
    log('  ✓ auth-api/.env exists', colors.green);
  } else {
    log('  ⚠ auth-api/.env missing', colors.yellow);
    log('    Copy from: auth-api/.env.example', colors.gray);
    results.config = false;
  }

  const ordersEnv = fs.existsSync('commande-api/.env');
  if (ordersEnv) {
    log('  ✓ commande-api/.env exists', colors.green);
  } else {
    log('  ⚠ commande-api/.env missing', colors.yellow);
    log('    Create with JWT_SECRET and STRIPE_SECRET_KEY', colors.gray);
    results.config = false;
  }

  // Check tools
  log('\n🛠️  Checking required tools...', colors.blue);
  
  try {
    const { stdout: nodeVersion } = await execPromise('node --version');
    log(`  ✓ Node.js installed: ${nodeVersion.trim()}`, colors.green);
  } catch (error) {
    log('  ✗ Node.js not found', colors.red);
    results.tools = false;
  }

  try {
    const { stdout: npmVersion } = await execPromise('npm --version');
    log(`  ✓ npm installed: ${npmVersion.trim()}`, colors.green);
  } catch (error) {
    log('  ✗ npm not found', colors.red);
    results.tools = false;
  }

  const dockerInstalled = await checkDockerRunning();
  if (dockerInstalled) {
    try {
      const { stdout: dockerVersion } = await execPromise('docker --version');
      log(`  ✓ Docker installed: ${dockerVersion.trim()}`, colors.green);
    } catch (error) {
      log('  ✓ Docker installed', colors.green);
    }
  } else {
    log('  ⚠ Docker not found (required for integration tests)', colors.yellow);
    results.tools = false;
  }

  const mongoInstalled = await checkMongoRunning();
  if (mongoInstalled) {
    log('  ✓ MongoDB CLI installed', colors.green);
  } else {
    log('  ⚠ MongoDB CLI not found (needed for local unit tests)', colors.yellow);
    log('    Unit tests can still run with Docker MongoDB', colors.gray);
  }

  // Summary
  log('\n═══════════════════════════════════════════', colors.blue);
  log('📊 Verification Summary:', colors.blue);
  log('═══════════════════════════════════════════', colors.blue);

  const checks = [
    { name: 'Project Structure', passed: results.structure, required: true },
    { name: 'Dependencies', passed: results.dependencies, required: true },
    { name: 'Configuration', passed: results.config, required: false },
    { name: 'Tools', passed: results.tools, required: false }
  ];

  checks.forEach(check => {
    const status = check.passed ? '✅ PASS' : (check.required ? '❌ FAIL' : '⚠️  WARN');
    const color = check.passed ? colors.green : (check.required ? colors.red : colors.yellow);
    const req = check.required ? '(Required)' : '(Optional)';
    log(`${status} - ${check.name} ${req}`, color);
  });

  const allRequired = results.structure && results.dependencies;
  
  log('\n═══════════════════════════════════════════', colors.blue);
  
  if (allRequired && results.config && results.tools) {
    log('✅ Everything looks good! You\'re ready to test!', colors.green);
    log('\nNext steps:', colors.blue);
    log('  1. Run unit tests: npm run test:all-units', colors.gray);
    log('  2. Start Docker: docker-compose up', colors.gray);
    log('  3. Run integration tests: npm test', colors.gray);
  } else if (allRequired) {
    log('⚠️  Setup is functional but needs attention', colors.yellow);
    log('\nYou can run tests, but some features may not work.', colors.gray);
    log('Review the warnings above to complete setup.', colors.gray);
  } else {
    log('❌ Setup incomplete - please fix the issues above', colors.red);
    log('\nSee QUICKSTART-TESTING.md for detailed setup instructions.', colors.gray);
  }

  log('\n');
  process.exit(allRequired ? 0 : 1);
}

if (require.main === module) {
  verifySetup().catch(error => {
    log(`\n❌ Verification failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { verifySetup };

