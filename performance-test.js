// k6 Performance Test Script
// Run: k6 run performance-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');

// Test configuration
export let options = {
  stages: [
    // Ramp-up: 0 → 50 users over 30s
    { duration: '30s', target: 50 },
    // Stay at 50 users for 1 minute
    { duration: '1m', target: 50 },
    // Ramp-up: 50 → 100 users over 30s
    { duration: '30s', target: 100 },
    // Stay at 100 users for 1 minute
    { duration: '1m', target: 100 },
    // Ramp-down: 100 → 0 over 30s
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // 95% of requests should complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate should be below 5%
    errors: ['rate<0.05'],
    // API latency should be below 300ms on average
    api_latency: ['avg<300'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080/api';

export default function () {
  // Test 1: Health Check
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  // Test 2: User Registration
  const timestamp = Date.now();
  const registerPayload = JSON.stringify({
    email: `user${timestamp}@test.com`,
    password: 'TestPassword123!',
    role: 'CUSTOMER',
    address: '123 Test Street',
  });

  let registerRes = http.post(`${BASE_URL}/auth/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(registerRes, {
    'registration successful': (r) => r.status === 201 || r.status === 200,
  });

  // Test 3: User Login
  if (registerRes.status === 200 || registerRes.status === 201) {
    const loginPayload = JSON.stringify({
      email: `user${timestamp}@test.com`,
      password: 'TestPassword123!',
    });

    let loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(loginRes, {
      'login successful': (r) => r.status === 200,
      'received token': (r) => r.json('token') !== undefined,
    });

    const token = loginRes.json('token');

    // Test 4: Get Menu (authenticated)
    let menuRes = http.get(`${BASE_URL}/menu`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    check(menuRes, {
      'menu retrieved': (r) => r.status === 200,
    });

    apiLatency.add(menuRes.timings.duration);

    // Test 5: Create Order (authenticated)
    const orderPayload = JSON.stringify({
      items: [
        { menuItemId: '123', quantity: 2 },
        { menuItemId: '456', quantity: 1 },
      ],
      deliveryAddress: '123 Test Street',
    });

    let orderRes = http.post(`${BASE_URL}/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    check(orderRes, {
      'order created': (r) => r.status === 201 || r.status === 200,
    });

    apiLatency.add(orderRes.timings.duration);

    // Track errors
    if (orderRes.status >= 400) {
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }
  }

  sleep(1); // Wait 1 second between iterations
}
