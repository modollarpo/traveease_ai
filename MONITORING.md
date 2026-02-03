# Traveease Monitoring & Alerting Stack (v3.0)

## Overview

This document describes the complete monitoring and observability stack for Traveease Enterprise Platform. The stack consists of:

- **Prometheus**: Metrics collection, aggregation, and storage
- **Grafana**: Visualization and dashboarding
- **AlertManager**: Alert routing and notifications
- **PrometheusRules**: SLA-based alerting with critical thresholds

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (AKS)                │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Backend    │  │ Commerce   │  │ Frontend   │            │
│  │ (NestJS)   │  │ (Node.js)  │  │ (Next.js)  │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │               │               │                   │
│         └───────────────┴───────────────┘                   │
│                         │                                    │
│              ┌──────────▼─────────────┐                     │
│              │   Prometheus Server    │                     │
│              │  (Metrics Collection)  │                     │
│              └──────────┬─────────────┘                     │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         │               │               │                   │
│    ┌────▼────┐     ┌───▼────┐   ┌─────▼──────┐            │
│    │ Grafana  │     │ Alert  │   │ TSDB       │            │
│    │Dashboard │     │Manager │   │(Time-series)           │
│    └──────────┘     └────┬───┘   └────────────┘            │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│    ┌────▼──┐        ┌───▼───┐       ┌───▼────┐            │
│    │ Slack  │        │Email  │       │PagerDuty           │
│    │Webhook │        │SMTP   │       │Webhook  │           │
│    └────────┘        └───────┘       └────────┘            │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Monitoring Namespace (monitoring)                    │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- AKS cluster with Kubernetes 1.20+
- `kubectl` configured to access cluster
- Helm 3+ (optional, for Helm-based deployment)
- Prometheus Operator (optional, for CRD-based management)

### Manual K8s Deployment

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Deploy Prometheus
kubectl apply -f k8s/monitoring/prometheus.yaml

# Deploy Grafana
kubectl apply -f k8s/monitoring/grafana.yaml

# Deploy AlertManager
kubectl apply -f k8s/monitoring/alertmanager.yaml

# Verify deployments
kubectl get pods -n monitoring
kubectl get svc -n monitoring
```

### Helm Deployment (Alternative)

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus Stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values helm/monitoring/values.yaml

# Install AlertManager
helm install alertmanager prometheus-community/alertmanager \
  --namespace monitoring \
  --values helm/monitoring/alertmanager-values.yaml
```

## Configuration

### Prometheus Configuration

**File**: `monitoring/prometheus.yml`

Key sections:
- **global**: Scrape interval (15s), evaluation interval (15s)
- **scrape_configs**: Job configurations for each service
- **alerting**: AlertManager integration
- **rule_files**: Alert and recording rules

**Service Discovery**:
- Kubernetes pod discovery via `kubernetes_sd_configs`
- Service annotations: `prometheus.io/scrape: true`
- Custom port annotation: `prometheus.io/port: 3001`

**Retention Policy**:
- Default: 15 days
- Remote write: Optional (for long-term storage)

### Alert Rules

**File**: `k8s/monitoring/alertmanager.yaml` (PrometheusRule)

**Core SLA Alerts**:

1. **PaymentProcessingDelay** (Critical)
   - Condition: p95 latency > 15 seconds
   - SLA Target: <15 seconds
   - Window: 5 minutes

2. **BookingConfirmationDelay** (Critical)
   - Condition: p95 latency > 30 seconds
   - SLA Target: <30 seconds
   - Window: 5 minutes

3. **HighErrorRate** (Critical)
   - Condition: Error rate > 0.1% (1 error per 1000 requests)
   - SLA Target: <0.1% error rate (99.9% uptime)
   - Window: 5 minutes

4. **HighLatency** (Warning)
   - Condition: API p95 latency > 200ms
   - SLA Target: <200ms p95
   - Window: 5 minutes

5. **PodCrashLooping** (Warning)
   - Condition: Pod restart rate > 0 in 30m window
   - SLA Target: Zero restarts
   - Window: 5 minutes

6. **DBConnectionPoolExhausted** (Warning)
   - Condition: Connection usage > 80%
   - SLA Target: <80% utilization
   - Window: 5 minutes

7. **ServiceDown** (Critical)
   - Condition: Service health check fails
   - SLA Target: 99.9% availability
   - Window: 2 minutes

### AlertManager Configuration

**File**: `k8s/monitoring/alertmanager.yaml` (ConfigMap)

**Routing**:
- **Default route**: Slack #alerts
- **Critical route**: Slack #critical-alerts + PagerDuty
- **Warning route**: Slack #warnings
- **SLA route**: Slack #sla-tracking + Email

**Receivers**:
1. **default**: Slack #alerts
2. **critical**: Slack #critical-alerts + PagerDuty (0s wait, 5m repeat)
3. **warning**: Slack #warnings (30s wait, 1h repeat)
4. **sla-team**: Slack #sla-tracking + Email to sla-team@traveease.com (5s wait, 10m repeat)

**Inhibit Rules**:
- Critical errors suppress warning alerts
- Pod crashes suppress latency alerts

### Grafana Dashboards

**File**: `k8s/monitoring/grafana.yaml` (ConfigMaps)

**Built-in Dashboards**:

1. **API Metrics Dashboard** (`api-metrics.json`)
   - Request rate (req/s)
   - p95 latency (ms)
   - Error rate (%)
   - Error count (5xx responses)

2. **Infrastructure Dashboard** (`infrastructure.json`)
   - CPU usage %
   - Memory usage %
   - Network I/O (bytes/s)
   - Disk I/O time (s)

3. **SLA Tracking Dashboard** (`sla-tracking.json`)
   - 30-day uptime % (Target: >99.9%)
   - Payment p95 latency (Target: <15s)
   - Booking p95 latency (Target: <30s)
   - 7-day error rate (Target: <0.1%)

**Accessing Grafana**:
```bash
# Port-forward to local machine
kubectl port-forward -n monitoring svc/grafana 3000:80

# Navigate to http://localhost:3000
# Default credentials: admin / changeme
```

## SLO Thresholds

| Metric | Threshold | Window | Action |
|--------|-----------|--------|--------|
| Uptime | 99.9% | 30 days | Page on-call if <99.9% |
| Payment p95 | <15 seconds | 5 min | Critical alert, SLA tracking |
| Booking p95 | <30 seconds | 5 min | Critical alert, SLA tracking |
| Error rate | <0.1% | 5 min | Critical alert if >0.1% |
| API p95 latency | <200ms | 5 min | Warning if >200ms |
| Pod restarts | 0 | 30 min | Warning if >0 |
| DB connections | <80% | 5 min | Warning if >80% |

## Metrics Instrumentation

### Backend API (NestJS)

```typescript
import { register, Counter, Histogram } from 'prom-client';

// HTTP request metrics
const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

// Payment metrics
const paymentDuration = new Histogram({
  name: 'payment_processing_duration_seconds',
  help: 'Payment processing time',
  labelNames: ['payment_method', 'status'],
  buckets: [0.1, 1, 5, 10, 15, 20, 30]
});

// Booking metrics
const bookingDuration = new Histogram({
  name: 'booking_confirmation_duration_seconds',
  help: 'Booking confirmation time',
  labelNames: ['booking_type', 'status'],
  buckets: [1, 5, 10, 15, 20, 30, 60]
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### Commerce Service (Node.js)

Similar instrumentation for payment processing metrics:
```typescript
const paymentIntents = new Counter({
  name: 'payment_intents_total',
  help: 'Total payment intent creations',
  labelNames: ['currency', 'status']
});

const transactionTotal = new Counter({
  name: 'transaction_total',
  help: 'Total transactions processed',
  labelNames: ['type', 'currency', 'status']
});
```

### Database Metrics

MySQL Exporter configuration (via prometheus exporter):
```bash
# Run MySQL Exporter
docker run -d \
  -p 9104:9104 \
  -e DATA_SOURCE_NAME="user:password@tcp(mysql:3306)/" \
  prom/mysqld-exporter
```

Key metrics scraped:
- `mysql_global_status_queries`
- `mysql_global_status_connections`
- `mysql_global_status_threads_connected`
- `mysql_slave_status_seconds_behind_master`

## Recording Rules

**File**: `monitoring/alert_rules.yml` (recording_rules.yml section)

Precomputed aggregate queries:
```yaml
- record: job:http_requests:rate5m
  expr: sum(rate(http_requests_total[5m])) by (job)

- record: job:http_error_rate:rate5m
  expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)) / (sum(rate(http_requests_total[5m])) by (job))

- record: job:http_latency:p95_5m
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (job)

- record: payment:latency:p95_5m
  expr: histogram_quantile(0.95, rate(payment_processing_duration_seconds_bucket[5m])) by (payment_method)

- record: booking:latency:p95_5m
  expr: histogram_quantile(0.95, rate(booking_confirmation_duration_seconds_bucket[5m])) by (booking_type)
```

## Alert Notifications

### Slack Integration

**Setup**:
1. Create Slack Workspace webhook
2. Store webhook URL in `alertmanager-secrets`
3. Configure routing rules in `alertmanager.yaml`

**Channels**:
- `#alerts`: General alerts (warnings)
- `#critical-alerts`: Critical service issues
- `#warnings`: Non-critical warnings
- `#sla-tracking`: SLA violations (payment, booking, error rate)

**Message Format**:
```
🚨 CRITICAL: HighErrorRate
Error rate for backend-api exceeds 0.1%
Current: 0.15% | Duration: 5m
Cluster: aks-primary | Timestamp: 2025-02-03T12:34:56Z
```

### PagerDuty Integration

**Setup**:
1. Create PagerDuty service
2. Generate integration key
3. Store key in `alertmanager-secrets`

**Trigger Conditions**:
- Critical alerts only
- Payment/Booking SLA violations
- Service down (300+ second response time)

**Escalation**:
- Immediate: On-call engineer
- 15m: Escalation policy
- 30m: Critical incident bridge

### Email Notifications

**Setup**:
1. Configure SendGrid API key in secrets
2. Define recipient email (sla-team@traveease.com)
3. Configure email SMTP in AlertManager

**Sent For**:
- SLA violations (payment, booking, error rate)
- Database connection pool exhaustion
- Pod crash loops

## Troubleshooting

### Prometheus Metrics Not Appearing

1. **Verify scrape targets**:
   ```bash
   kubectl port-forward -n monitoring svc/prometheus 9090:9090
   # Navigate to http://localhost:9090/targets
   # Check target health
   ```

2. **Check pod metrics endpoint**:
   ```bash
   kubectl port-forward -n traveease-prod svc/backend-api 3000:3000
   curl http://localhost:3000/metrics | head -20
   ```

3. **Verify Prometheus configuration**:
   ```bash
   kubectl logs -n monitoring -l app=prometheus | grep "config\|scrape"
   ```

### Alerts Not Firing

1. **Verify alert rules exist**:
   ```bash
   kubectl get PrometheusRule -n monitoring
   kubectl describe PrometheusRule traveease-slo-alerts -n monitoring
   ```

2. **Check AlertManager routing**:
   ```bash
   kubectl port-forward -n monitoring svc/alertmanager 9093:9093
   # Navigate to http://localhost:9093/#/alerts
   ```

3. **Test rule evaluation**:
   ```bash
   kubectl port-forward -n monitoring svc/prometheus 9090:9090
   # Test alert query in Graph tab
   # Example: histogram_quantile(0.95, rate(payment_processing_duration_seconds_bucket[5m])) > 15
   ```

### Grafana Dashboard Not Displaying Data

1. **Verify Prometheus datasource**:
   - Dashboard → Settings → Datasources
   - Click Prometheus → Test
   - Check connection status

2. **Check metrics exist**:
   ```bash
   # From Prometheus UI
   # Query: {job="backend-api"}
   # Should return available metrics
   ```

3. **Verify Grafana configuration**:
   ```bash
   kubectl logs -n monitoring -l app=grafana | grep -i datasource
   ```

## Performance Tuning

### Prometheus Optimization

**Reduce cardinality** (high label count):
```yaml
metric_relabel_configs:
  - source_labels: [__name__]
    action: keep
    regex: 'http_requests_total|http_request_duration_seconds'
```

**Increase retention** (for cost-benefit analysis):
```bash
# Current: 15 days
# Max recommended: 30 days (requires 100GB+ storage)
# For older data: Use remote storage (S3, Azure Blob)
```

**Recording rules** (precompute expensive queries):
```yaml
- record: job:http_latency:p95_5m
  expr: histogram_quantile(0.95, rate(...))
  interval: 30s  # Evaluate every 30 seconds
```

### Grafana Optimization

**Panel refresh** (balance freshness vs load):
```yaml
refresh: 10s  # Current
# Options: 5s (most fresh), 30s (less load), 1m (baseline)
```

**Query caching**:
```bash
# Grafana Enterprise feature
# Reduces repeated queries within time window
```

## Scaling Considerations

### High-Volume Environments (>1M metrics/day)

1. **Prometheus Federation**: Multiple Prometheus instances scrape services, one aggregates
2. **Remote Storage**: Use Thanos or Mimir for long-term storage
3. **Vertical Scaling**: Increase replicas (current: 2, max: 5)
4. **Horizontal Scaling**: Service-level Prometheus instances

### Example: Multi-Region Setup

```yaml
# Primary cluster
Prometheus (region: us-east-1) → Remote Write to Thanos
AlertManager (us-east-1)

# Secondary cluster
Prometheus (region: eu-west-1) → Remote Write to Thanos
AlertManager (eu-west-1) [Standby]

# Centralized storage
Thanos (all metrics from all regions)
Grafana (single pane of glass)
```

## Maintenance

### Regular Tasks

- **Weekly**: Review new alerts, adjust thresholds if needed
- **Monthly**: Archive old dashboards, update documentation
- **Quarterly**: Review SLO compliance, plan capacity

### Backup & Recovery

**Prometheus state**:
```bash
# Take snapshot
curl -X POST http://prometheus:9090/api/v1/admin/tsdb/snapshot

# Backup storage
kubectl exec -n monitoring prometheus-0 -- tar czf /tmp/prometheus-backup.tar.gz /prometheus
kubectl cp monitoring/prometheus-0:/tmp/prometheus-backup.tar.gz ./
```

**Grafana dashboards**:
```bash
# Export dashboards via API
for dash_id in {1..10}; do
  curl http://admin:password@grafana:3000/api/dashboards/uid/dash-$dash_id > dash-$dash_id.json
done

# Or use Grafana UI: Dashboard → Share → Export
```

## Related Files

- `DEPLOYMENT_RUNBOOK.md`: Deployment pipeline (includes monitoring setup section)
- `SECURITY.md`: Monitoring security considerations
- `PRODUCTION_READINESS.md`: Production checklist (includes monitoring)
- `monitoring/prometheus.yml`: Prometheus configuration file
- `monitoring/alert_rules.yml`: Alert and recording rules
- `k8s/monitoring/prometheus.yaml`: K8s manifests for Prometheus
- `k8s/monitoring/grafana.yaml`: K8s manifests for Grafana
- `k8s/monitoring/alertmanager.yaml`: K8s manifests for AlertManager + PrometheusRules

## Support & References

- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **AlertManager Docs**: https://prometheus.io/docs/alerting/latest/alertmanager/
- **Kubernetes Monitoring**: https://kubernetes.io/docs/tasks/debug-application-cluster/resource-metrics-pipeline/
- **SRE Best Practices**: https://sre.google/resources/
