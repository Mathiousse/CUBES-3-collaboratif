const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:8080/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let testsPassed = 0;
let testsFailed = 0;

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  console.log(`${colors[type]}%s\x1b[0m`, message);
}

function logSection(title) {
  console.log('\n═══════════════════════════════════════════');
  console.log(`📋 ${title}`);
  console.log('═══════════════════════════════════════════');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFrontendAccessible() {
  logSection('Testing Frontend Accessibility');
  try {
    const response = await axios.get(FRONTEND_URL, { 
      timeout: 10000,
      maxRedirects: 5
    });
    if (response.status === 200) {
      log('  ✓ Frontend is accessible', 'success');
      testsPassed++;
      return true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('  ⚠ Frontend not running (this is OK for backend-only tests)', 'warning');
      log('  ℹ Start frontend with: docker-compose up -d frontend', 'info');
    } else {
      log(`  ✗ Frontend error: ${error.message}`, 'error');
    }
    testsFailed++;
    return false;
  }
}

async function testCustomerFlow() {
  logSection('Testing Customer Flow (E2E)');
  
  const timestamp = Date.now();
  const customerEmail = `customer${timestamp}@test.com`;
  const customerPassword = 'test123456';
  let customerToken = null;
  
  try {
    log('  → Registering new customer...', 'info');
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: customerEmail,
        password: customerPassword,
        name: 'Test Customer',
        role: 'CUSTOMER',
      });
      log('    ✓ Customer registered', 'success');
      testsPassed++;
    } catch (error) {
      if (error.response?.data?.msg === 'User already exists') {
        log('    ℹ User already exists, continuing...', 'warning');
      } else {
        throw error;
      }
    }
    
    await sleep(1000);
    
    log('  → Logging in customer...', 'info');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: customerEmail,
      password: customerPassword,
    });
    
    if (loginResponse.data.token && loginResponse.data.userId && loginResponse.data.role === 'CUSTOMER') {
      customerToken = loginResponse.data.token;
      log('    ✓ Customer logged in successfully', 'success');
      log(`    ✓ Token received: ${customerToken.substring(0, 20)}...`, 'success');
      log(`    ✓ User ID: ${loginResponse.data.userId}`, 'success');
      log(`    ✓ Role: ${loginResponse.data.role}`, 'success');
      testsPassed++;
    } else {
      throw new Error('Login response missing required fields');
    }
    
    log('  → Fetching menu items...', 'info');
    const menuResponse = await axios.get(`${API_URL}/logistique/menu-items`);
    if (Array.isArray(menuResponse.data) && menuResponse.data.length > 0) {
      log(`    ✓ Fetched ${menuResponse.data.length} menu items`, 'success');
      testsPassed++;
    } else {
      throw new Error('No menu items found');
    }
    
    log('  → Creating order...', 'info');
    const orderResponse = await axios.post(
      `${API_URL}/commande/orders`,
      {
        items: [
          { menuItemId: menuResponse.data[0].id, name: menuResponse.data[0].name, price: menuResponse.data[0].price, quantity: 1 }
        ],
        totalAmount: menuResponse.data[0].price,
        deliveryAddress: '123 Test Street, Test City',
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );
    
    if (orderResponse.data.order && orderResponse.data.clientSecret) {
      log(`    ✓ Order created: ${orderResponse.data.order._id}`, 'success');
      log('    ✓ Stripe client secret received', 'success');
      testsPassed++;
    } else {
      throw new Error('Order response missing required fields');
    }
    
    log('  → Fetching customer orders...', 'info');
    const myOrdersResponse = await axios.get(
      `${API_URL}/commande/orders/my-orders`,
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );
    
    if (Array.isArray(myOrdersResponse.data) && myOrdersResponse.data.length > 0) {
      log(`    ✓ Found ${myOrdersResponse.data.length} order(s)`, 'success');
      testsPassed++;
    } else {
      throw new Error('No orders found for customer');
    }
    
    return true;
  } catch (error) {
    log(`  ✗ Customer flow failed: ${error.message}`, 'error');
    if (error.response) {
      log(`    Response: ${JSON.stringify(error.response.data)}`, 'error');
    }
    testsFailed++;
    return false;
  }
}

async function testDeliveryFlow() {
  logSection('Testing Delivery Person Flow (E2E)');
  
  const timestamp = Date.now();
  const deliveryEmail = `delivery${timestamp}@test.com`;
  const deliveryPassword = 'test123456';
  let deliveryToken = null;
  
  try {
    log('  → Registering new delivery person...', 'info');
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: deliveryEmail,
        password: deliveryPassword,
        name: 'Test Delivery',
        role: 'DELIVERY',
      });
      log('    ✓ Delivery person registered', 'success');
      testsPassed++;
    } catch (error) {
      if (error.response?.data?.msg === 'User already exists') {
        log('    ℹ User already exists, continuing...', 'warning');
      } else {
        throw error;
      }
    }
    
    await sleep(1000);
    
    log('  → Logging in delivery person...', 'info');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: deliveryEmail,
      password: deliveryPassword,
    });
    
    if (loginResponse.data.token && loginResponse.data.userId && loginResponse.data.role === 'DELIVERY') {
      deliveryToken = loginResponse.data.token;
      log('    ✓ Delivery person logged in successfully', 'success');
      log(`    ✓ Role: ${loginResponse.data.role}`, 'success');
      testsPassed++;
    } else {
      throw new Error('Login response missing required fields');
    }
    
    log('  → Fetching available orders...', 'info');
    const availableResponse = await axios.get(
      `${API_URL}/commande/orders/available`,
      {
        headers: { Authorization: `Bearer ${deliveryToken}` }
      }
    );
    
    log(`    ✓ Found ${availableResponse.data.length} available order(s)`, 'success');
    testsPassed++;
    
    if (availableResponse.data.length > 0) {
      const orderId = availableResponse.data[0]._id;
      
      log('  → Claiming order...', 'info');
      await axios.post(
        `${API_URL}/commande/orders/${orderId}/claim`,
        {},
        {
          headers: { Authorization: `Bearer ${deliveryToken}` }
        }
      );
      log('    ✓ Order claimed successfully', 'success');
      testsPassed++;
      
      log('  → Fetching my deliveries...', 'info');
      const myOrdersResponse = await axios.get(
        `${API_URL}/commande/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${deliveryToken}` }
        }
      );
      
      if (myOrdersResponse.data.length > 0) {
        log(`    ✓ Found ${myOrdersResponse.data.length} active delivery(ies)`, 'success');
        testsPassed++;
      }
    }
    
    return true;
  } catch (error) {
    log(`  ✗ Delivery flow failed: ${error.message}`, 'error');
    if (error.response) {
      log(`    Response: ${JSON.stringify(error.response.data)}`, 'error');
    }
    testsFailed++;
    return false;
  }
}

async function runTests() {
  console.log('\n');
  log('═══════════════════════════════════════════', 'info');
  log('🧪 Good Food Frontend - E2E Tests', 'info');
  log('═══════════════════════════════════════════', 'info');
  log(`Testing against: ${API_URL}`, 'info');
  log(`Frontend URL: ${FRONTEND_URL}`, 'info');
  
  await testFrontendAccessible();
  await testCustomerFlow();
  await testDeliveryFlow();
  
  console.log('\n');
  log('═══════════════════════════════════════════', 'info');
  log('📊 Test Results:', 'info');
  log('═══════════════════════════════════════════', 'info');
  
  if (testsFailed === 0) {
    log(`✅ All tests passed! (${testsPassed}/${testsPassed})`, 'success');
    process.exit(0);
  } else {
    log(`❌ Some tests failed (${testsPassed} passed, ${testsFailed} failed)`, 'error');
    process.exit(1);
  }
}

runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});

