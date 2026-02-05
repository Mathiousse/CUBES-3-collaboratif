const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:8080/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

let customerToken, deliveryToken, orderId;

async function testAuthAPI() {
  log('\n📝 Testing Auth API...', colors.blue);

  try {
    const customerEmail = `customer-${Date.now()}@test.com`;
    const deliveryEmail = `delivery-${Date.now()}@test.com`;

    log('  → Registering customer...');
    await axios.post(`${API_BASE}/auth/register`, {
      email: customerEmail,
      password: 'password123',
      role: 'CUSTOMER',
      address: '123 Test Street'
    });
    log('  ✓ Customer registered', colors.green);

    log('  → Registering delivery person...');
    await axios.post(`${API_BASE}/auth/register`, {
      email: deliveryEmail,
      password: 'password123',
      role: 'DELIVERY_PERSON'
    });
    log('  ✓ Delivery person registered', colors.green);

    log('  → Logging in customer...');
    const customerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: customerEmail,
      password: 'password123'
    });
    customerToken = customerLogin.data.token;
    log('  ✓ Customer logged in', colors.green);

    log('  → Logging in delivery person...');
    const deliveryLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: deliveryEmail,
      password: 'password123'
    });
    deliveryToken = deliveryLogin.data.token;
    log('  ✓ Delivery person logged in', colors.green);

    log('✅ Auth API tests passed', colors.green);
    return true;
  } catch (error) {
    log(`❌ Auth API test failed: ${error.response?.data?.msg || error.message}`, colors.red);
    return false;
  }
}

async function testLogisticsAPI() {
  log('\n🍔 Testing Logistics API...', colors.blue);

  try {
    log('  → Fetching menu items...');
    const response = await axios.get(`${API_BASE}/logistique/menu-items`);

    if (!Array.isArray(response.data)) {
      throw new Error('Menu items should be an array');
    }

    if (response.data.length === 0) {
      log('  ⚠ No menu items found (database might not be seeded)', colors.yellow);
    } else {
      log(`  ✓ Found ${response.data.length} menu items`, colors.green);
      log(`  → Sample item: ${response.data[0].name} - $${response.data[0].price}`);
    }

    log('✅ Logistics API tests passed', colors.green);
    return true;
  } catch (error) {
    log(`❌ Logistics API test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function testOrderAPI() {
  log('\n📦 Testing Order API...', colors.blue);

  try {
    log('  → Creating order as customer...');
    const orderResponse = await axios.post(
      `${API_BASE}/commande/orders`,
      {
        items: [
          { name: 'Test Burger', price: 12.99 },
          { name: 'Test Fries', price: 4.50 }
        ],
        totalAmount: 17.49,
        deliveryAddress: '123 Test Street'
      },
      {
        headers: { 'x-auth-token': customerToken }
      }
    );

    orderId = orderResponse.data.order._id;
    log(`  ✓ Order created: ${orderId}`, colors.green);
    log(`  → Client secret received: ${orderResponse.data.clientSecret ? 'Yes' : 'No'}`);

    log('  → Fetching available orders as delivery person...');
    const availableOrders = await axios.get(
      `${API_BASE}/commande/orders/available`,
      {
        headers: { 'x-auth-token': deliveryToken }
      }
    );

    log(`  ✓ Found ${availableOrders.data.length} available orders`, colors.green);

    if (availableOrders.data.length > 0) {
      log('  → Claiming order...');
      const claimResponse = await axios.post(
        `${API_BASE}/commande/orders/${orderId}/claim`,
        {},
        {
          headers: { 'x-auth-token': deliveryToken }
        }
      );

      log(`  ✓ Order claimed, status: ${claimResponse.data.status}`, colors.green);

      log('  → Updating status to DELIVERED...');
      const statusResponse = await axios.patch(
        `${API_BASE}/commande/orders/${orderId}/status`,
        { status: 'DELIVERED' },
        {
          headers: { 'x-auth-token': deliveryToken }
        }
      );
      log(`  ✓ Order status updated to: ${statusResponse.data.status}`, colors.green);
    }

    log('✅ Order API tests passed', colors.green);
    return true;
  } catch (error) {
    log(`❌ Order API test failed: ${error.response?.data || error.message}`, colors.red);
    if (error.response?.data) {
      log(`  → Response: ${JSON.stringify(error.response.data)}`, colors.red);
    }
    return false;
  }
}

async function testAPIGateway() {
  log('\n🚪 Testing API Gateway...', colors.blue);

  try {
    log('  → Testing gateway routing...');

    const endpoints = [
      { path: '/auth/login', method: 'POST', data: { email: 'test@test.com', password: 'test' } },
      { path: '/logistique/menu-items', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        if (endpoint.method === 'GET') {
          await axios.get(`${API_BASE}${endpoint.path}`);
        } else {
          await axios.post(`${API_BASE}${endpoint.path}`, endpoint.data);
        }
        log(`  ✓ Gateway correctly routes ${endpoint.path}`, colors.green);
      } catch (error) {
        if (error.response) {
          log(`  ✓ Gateway routes ${endpoint.path} (response received)`, colors.green);
        } else {
          throw error;
        }
      }
    }

    log('✅ API Gateway tests passed', colors.green);
    return true;
  } catch (error) {
    log(`❌ API Gateway test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function runAllTests() {
  log('═══════════════════════════════════════════', colors.blue);
  log('🧪 Good Food MVP - Integration Tests', colors.blue);
  log('═══════════════════════════════════════════', colors.blue);
  log(`Testing against: ${API_BASE}\n`);

  const results = {
    auth: false,
    logistics: false,
    orders: false,
    gateway: false
  };

  try {
    results.auth = await testAuthAPI();
    results.logistics = await testLogisticsAPI();

    if (results.auth) {
      results.orders = await testOrderAPI();
    } else {
      log('\n⚠ Skipping Order API tests (auth failed)', colors.yellow);
    }

    results.gateway = await testAPIGateway();

  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  }

  log('\n═══════════════════════════════════════════', colors.blue);
  log('📊 Test Results:', colors.blue);
  log('═══════════════════════════════════════════', colors.blue);

  const testSummary = [
    { name: 'Auth API', passed: results.auth },
    { name: 'Logistics API', passed: results.logistics },
    { name: 'Order API', passed: results.orders },
    { name: 'API Gateway', passed: results.gateway }
  ];

  testSummary.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    const color = test.passed ? colors.green : colors.red;
    log(`${status} - ${test.name}`, color);
  });

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  log('\n═══════════════════════════════════════════', colors.blue);
  if (totalPassed === totalTests) {
    log(`🎉 All tests passed! (${totalPassed}/${totalTests})`, colors.green);
    process.exit(0);
  } else {
    log(`⚠ ${totalPassed}/${totalTests} tests passed`, colors.yellow);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { runAllTests };

