# Performance Testing & Load Testing Guide

## Overview
Comprehensive performance testing strategy for Traveease API using k6 load testing framework.

## SLA Targets
| Service | Metric | Target | Current |
|---------|--------|--------|---------|
| Payment Processing | 95th percentile latency | <5s | TBD |
| Flight Booking | 95th percentile latency | <10s | TBD |
| Hotel Booking | 95th percentile latency | <10s | TBD |
| Car Rental | 95th percentile latency | <10s | TBD |
| List Operations | 95th percentile latency | <500ms | TBD |
| Error Rate | < | 1% | TBD |

---

## Setup

### Install k6
```bash
# macOS
brew install k6

# Windows (via Chocolatey)
choco install k6

# Linux
sudo apt-get install k6

# Via npm (k6-runner)
npm install -D k6
```

### Verify Installation
```bash
k6 --version
```

---

## Running Load Tests

### 1. Local Execution
```bash
# Basic run (default 1 VU, 1 iteration)
k6 run load-test.js

# Custom VUs and duration
k6 run --vus 50 --duration 5m load-test.js

# Different target environment
BASE_URL=https://api-staging.traveease.com \
JWT_TOKEN=your-token \
k6 run load-test.js
```

### 2. Cloud Execution (k6 Cloud)
```bash
# Login to k6
k6 login cloud
# Visit: https://app.k6.io/ to get token

# Run test in cloud
k6 cloud load-test.js

# View results: https://app.k6.io/
```

### 3. Docker Execution
```bash
# Build k6 image with custom script
docker run -v $(pwd):/scripts grafana/k6 run /scripts/load-test.js

# Run with environment variables
docker run \
  -e BASE_URL=http://host.docker.internal:3001 \
  -e JWT_TOKEN=test-token \
  -v $(pwd):/scripts \
  grafana/k6 run /scripts/load-test.js
```

---

## Test Scenarios

### Scenario Breakdown
- 30% Flight booking flow
- 20% Payment processing
- 15% Hotel booking flow
- 15% Car rental flow
- 15% Itinerary & summary
- 5% Error handling

### Load Stages
```
Stage 1: Ramp-up (0→50 VUs over 2 minutes)
├─ Warmup phase
├─ Database connection pool initialization
└─ Cache population

Stage 2: Sustain (50 VUs for 5 minutes)
├─ Steady-state performance measurement
├─ Peak load evaluation
└─ SLA compliance verification

Stage 3: Ramp-down (50→0 VUs over 2 minutes)
└─ Graceful shutdown verification
```

---

## Performance Metrics

### Key Metrics
```
http_req_duration
  - p(95): 95th percentile latency
  - p(99): 99th percentile latency
  - max: Maximum latency

http_req_failed
  - rate: Error rate (0-1.0)

http_req_received
  - rate: Requests received per second

http_req_sending
  - duration: Time to send request

http_req_waiting
  - duration: Time waiting for response (TTFB)

http_req_receiving
  - duration: Time receiving response body
```

### Custom Metrics
```
errors (Rate)
  - Tracks failed checks
  - Threshold: < 1%
```

---

## Interpreting Results

### Successful Output
```
✅ http_req_duration................. avg=245ms    min=52ms    med=198ms    max=1.2s    p(90)=523ms p(95)=684ms p(99)=980ms
✅ http_req_failed..................... 0.00%
✅ http_reqs........................... 1234 (12.3/s)
✅ checks............................ 100% passed
✅ errors............................. 0 errors
```

### Red Flags
```
❌ p(95) latency > SLA target
❌ http_req_failed > 1%
❌ errors trending upward during sustain phase
❌ Memory/CPU exhaustion during ramp-down
```

---

## Baseline Metrics

### Development (Local)
```
VUs: 50, Duration: 9m

Flight Booking:
  - Duration: 8-12s (within SLA)
  - Error Rate: 0%

Payment:
  - Duration: 2-5s (within SLA)
  - Error Rate: 0%

List Operations:
  - Duration: 150-400ms (within SLA)
  - Error Rate: 0%
```

### Staging (AWS)
```
VUs: 100, Duration: 15m

Flight Booking:
  - Duration: 5-10s (within SLA)
  - Error Rate: < 0.1%

Payment:
  - Duration: 1.5-3s (within SLA)
  - Error Rate: < 0.1%

List Operations:
  - Duration: 100-250ms (within SLA)
  - Error Rate: 0%
```

### Production (AKS)
```
VUs: 500, Duration: 30m

Flight Booking:
  - Duration: 4-8s (within SLA)
  - Error Rate: < 0.05%

Payment:
  - Duration: 1-2s (within SLA)
  - Error Rate: < 0.05%

List Operations:
  - Duration: 50-150ms (within SLA)
  - Error Rate: 0%
```

---

## Advanced Testing

### Test with Custom Payload
```bash
# Edit load-test.js and modify testData
# Example: Test with different price points

k6 run \
  --env BOOKING_AMOUNT=500000 \
  --env CURRENCY=USD \
  load-test.js
```

### Spike Testing
```javascript
// spike-test.js
export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Spike to 100 VUs
    { duration: '1m30s', target: 100 }, // Hold for 1.5m
    { duration: '20s', target: 10 },   // Quick drop
    { duration: '10s', target: 0 },    // Cleanup
  ],
};
```

### Stress Testing
```javascript
// stress-test.js
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 300 },
    { duration: '5m', target: 400 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 500 }, // Peak load
    { duration: '5m', target: 0 },   // Ramp-down
  ],
};
```

### Soak Testing (12+ hours)
```bash
# Long-running test to detect memory leaks
k6 run \
  --vus 20 \
  --duration 12h \
  load-test.js
```

---

## Troubleshooting

### High Latency Issues
```bash
# Check backend logs
docker logs traveease-commerce

# Profile database queries
PGTOOLS=1 k6 run load-test.js

# Monitor infrastructure
kubectl top nodes
kubectl top pods -n default
```

### Connection Errors
```bash
# Verify API connectivity
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3001/api/v1/health

# Check firewall rules
netstat -an | grep 3001

# Increase file descriptor limit
ulimit -n 65536
```

### Memory Issues
```bash
# Reduce VUs to match available memory
k6 run --vus 20 --duration 5m load-test.js

# Monitor memory usage
top -p $(pgrep k6)
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Performance Test

on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: load-test.js
          cloud: true
        env:
          K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
          BASE_URL: https://api-staging.traveease.com
          JWT_TOKEN: ${{ secrets.STAGING_JWT_TOKEN }}

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '📊 Performance test completed. Check k6 cloud dashboard for results.'
            })
```

---

## Performance Optimization Tips

### 1. Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_id ON FlightBooking(userId);
CREATE INDEX idx_status ON FlightBooking(status);
CREATE INDEX idx_created_at ON FlightBooking(createdAt);
```

### 2. Caching Strategy
```typescript
// Redis caching for flight offers
const flightOffer = await cache.get(`flight:${offerId}`);
if (!flightOffer) {
  const offer = await amadeus.getFlightOffer(offerId);
  await cache.set(`flight:${offerId}`, offer, 1200); // 20 mins TTL
}
```

### 3. Connection Pooling
```typescript
// NestJS TypeORM configuration
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      pool: {
        min: 5,
        max: 20,  // Increase for high-load scenarios
        acquireTimeoutMillis: 30000,
      },
    }),
  ],
})
export class DatabaseModule {}
```

### 4. Async Processing
```typescript
// Queue payment processing with Bull
@Controller('payments')
export class PaymentsController {
  @Post('confirm')
  async confirmPayment(@Body() dto: ConfirmPaymentDTO) {
    // Queue async job
    await this.paymentQueue.add(
      'process_payment',
      { paymentId: dto.paymentId },
      { delay: 0, attempts: 3 }
    );
    
    return { status: 'processing' };
  }
}
```

---

## Monitoring Integration

### Prometheus Metrics
```typescript
// Export metrics for Grafana
export const paymentDurationHistogram = new Histogram({
  name: 'payment_duration_seconds',
  help: 'Payment processing duration',
  buckets: [0.5, 1, 2, 5, 10, 15],
});

paymentDurationHistogram
  .labels({ gateway: 'stripe' })
  .observe(duration);
```

### Grafana Dashboards
- Create dashboard: **Traveease API Performance**
- Panels:
  - Request latency over time
  - Error rate by endpoint
  - Throughput (req/s)
  - Resource utilization (CPU, memory)

---

## Best Practices

✅ **DO:**
- Run tests regularly (daily in staging)
- Compare results against baseline
- Test during peak traffic windows
- Include realistic data scenarios
- Monitor infrastructure during tests
- Version control test scripts

❌ **DON'T:**
- Run load tests against production during business hours
- Ignore error rate increases
- Skip infrastructure monitoring
- Use production data for testing
- Run tests from single location (adds bias)

---

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Cloud](https://app.k6.io/)
- [Performance Testing Handbook](https://k6.io/blog/)
- [SLA Benchmarks](https://www.apdex.org/)

---

**Last Updated:** February 3, 2026
**Next Review:** May 3, 2026
