import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration Options
export const options = {
  stages: [
    { duration: '15s', target: 10 }, // Ramp-up to 10 VUs over 15 seconds
    { duration: '30s', target: 50 }, // Ramp-up to 50 VUs over 30 seconds
    { duration: '15s', target: 0 },  // Ramp-down to 0 VUs over 15 seconds
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],  // Less than 1% request failures
    http_req_duration: ['p(95)<500'], // 95% of requests complete under 500ms
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost';

export default function () {
  // 1. Benchmark Health & Monitoring Endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health payload status ok': (r) => JSON.parse(r.body).status === 'ok',
  });

  sleep(1);
}
