#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

const authEnvTemplate = `PORT=3001
MONGO_URI=mongodb://auth-db:27017/auth
JWT_SECRET=YOUR_SUPER_SECRET_KEY_FOR_JWT_CHANGE_THIS_IN_PRODUCTION
`;

const commandeEnvTemplate = `PORT=3003
MONGO_URI=mongodb://commande-db:27017/orders
JWT_SECRET=YOUR_SUPER_SECRET_KEY_FOR_JWT_CHANGE_THIS_IN_PRODUCTION
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
`;

function createEnvFile(filePath, content) {
  try {
    if (fs.existsSync(filePath)) {
      log(`  ⚠ ${filePath} already exists, skipping...`, colors.yellow);
      return false;
    }
    
    fs.writeFileSync(filePath, content);
    log(`  ✓ Created ${filePath}`, colors.green);
    return true;
  } catch (error) {
    log(`  ✗ Failed to create ${filePath}: ${error.message}`, colors.yellow);
    return false;
  }
}

function setupEnvFiles() {
  log('\n═══════════════════════════════════════════', colors.blue);
  log('⚙️  Environment File Setup', colors.blue);
  log('═══════════════════════════════════════════', colors.blue);

  log('\n📝 Creating .env files...', colors.blue);

  const authCreated = createEnvFile('auth-api/.env', authEnvTemplate);
  const commandeCreated = createEnvFile('commande-api/.env', commandeEnvTemplate);

  log('\n═══════════════════════════════════════════', colors.blue);

  if (authCreated || commandeCreated) {
    log('✅ Environment files created!', colors.green);
    
    log('\n⚠️  IMPORTANT: Update these values before deploying:', colors.yellow);
    log('', colors.reset);
    
    if (authCreated) {
      log('  📄 auth-api/.env:', colors.blue);
      log('    - JWT_SECRET: Change to a strong random value', colors.gray);
    }
    
    if (commandeCreated) {
      log('  📄 commande-api/.env:', colors.blue);
      log('    - JWT_SECRET: Must match auth-api JWT_SECRET!', colors.gray);
      log('    - STRIPE_SECRET_KEY: Get from https://dashboard.stripe.com/test/apikeys', colors.gray);
    }

    log('\n💡 For local development, the default values will work.', colors.blue);
    log('   For production, you MUST change JWT_SECRET and use real Stripe keys.', colors.blue);
  } else {
    log('ℹ️  No new environment files created.', colors.blue);
    log('   All .env files already exist.', colors.gray);
  }

  log('\n✨ Ready to test! Run: npm run verify', colors.green);
  log('\n');
}

if (require.main === module) {
  setupEnvFiles();
}

module.exports = { setupEnvFiles };

