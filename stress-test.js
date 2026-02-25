// k6 Stress Test - Find breaking point
// Run: k6 run stress-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    // Ramp-up to 200 users
    { duration: '2m', target: 200 },
    // Stay at 200 users
    { duration: '5m', target: 200 },
    // Spike to 500 users
    { duration: '30s', target: 500 },
    // Stay at 500 users
    { duration: '2m', target: 500 },
    // Ramp-down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // More lenient for stress test
    http_req_duration: ['p(95)<2000'], // 2s
    http_req_failed: ['rate<0.2'], // 20% error rate acceptable
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080/api';

export default function () {
  // Simple load test - just hit the main endpoints
  const endpoints = [
    '/health',
    '/menu',
    '/auth/login',
  ];

  endpoints.forEach((endpoint) => {
    let res = http.get(`${BASE_URL}${endpoint}`);
    check(res, {
      [`${endpoint} responded`]: (r) => r.status < 500,
    });
  });

  sleep(0.5);
}
