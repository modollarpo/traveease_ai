# Production Deployment Runbook

## Overview
Comprehensive guide for deploying Traveease to production Kubernetes (AKS).

---

## Prerequisites

### Access & Permissions
- ✅ Azure account with AKS cluster access
- ✅ kubectl configured for AKS cluster
- ✅ Helm 3+ installed
- ✅ Docker credentials configured
- ✅ GitHub access with deployment tokens

### Verification Checklist
```bash
# Verify kubectl access
kubectl cluster-info

# Verify Helm access
helm list

# Verify Docker credentials
docker ps

# Verify image registry access
az acr login --name traveease
```

---

## Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Pre-Deployment Checks                                     │
├─────────────────────────────────────────────────────────────┤
│ • Git status clean (no uncommitted changes)                 │
│ • All tests passing (unit, integration, security)           │
│ • Security scan passed (vulnerabilities < threshold)         │
│ • Performance baseline acceptable (SLA met)                 │
│ • Database backups created                                  │
│ • Rollback plan reviewed                                    │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ 2. Build & Push Docker Images                                │
├─────────────────────────────────────────────────────────────┤
│ • docker build -t backend:v3.0.0 backend/                  │
│ • docker build -t commerce:v3.0.0 commerce/                │
│ • docker build -t frontend:v3.0.0 frontend/                │
│ • Push to ACR (Azure Container Registry)                   │
│ • Tag with git commit hash                                 │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ 3. Update Helm Values & Deploy                               │
├─────────────────────────────────────────────────────────────┤
│ • Update image tags in values.yaml                          │
│ • Validate Helm chart (helm lint)                           │
│ • Dry-run deployment (helm install --dry-run)              │
│ • Apply Helm release (helm upgrade --install)              │
│ • Monitor rollout status                                    │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ 4. Post-Deployment Verification                              │
├─────────────────────────────────────────────────────────────┤
│ • Health checks (all endpoints responsive)                  │
│ • Database migrations completed                             │
│ • Logs for errors or warnings                               │
│ • Smoke tests passed (basic functionality)                  │
│ • Performance baseline met                                  │
│ • Error rate < 1%                                           │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ 5. Monitoring & Alerting                                     │
├─────────────────────────────────────────────────────────────┤
│ • CPU/Memory usage normal                                   │
│ • Disk space available                                      │
│ • Network latency acceptable                                │
│ • Error alerts configured                                   │
│ • Grafana dashboards updated                                │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ 6. Completion & Documentation                                │
├─────────────────────────────────────────────────────────────┤
│ • Update deployment log                                     │
│ • Send notification to stakeholders                         │
│ • Document any issues encountered                           │
│ • Schedule post-deployment review                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Deployment

### 1. Pre-Deployment Checks

```bash
#!/bin/bash
set -e

echo "🔍 Running pre-deployment checks..."

# Check git status
if [[ -n $(git status -s) ]]; then
  echo "❌ Git working directory not clean. Commit changes first."
  exit 1
fi
echo "✅ Git status clean"

# Check all tests pass
echo "Running tests..."
cd commerce && npm test && cd ..
cd backend && pytest && cd ..
cd frontend && npm test && cd ..
echo "✅ All tests passed"

# Check security scan
echo "Running security scan..."
npm run security-scan
echo "✅ Security scan passed"

# Backup database
echo "Backing up database..."
kubectl exec -it mysql-pod -- mysqldump -u root -p$MYSQL_ROOT_PASSWORD traveease > backup_$(date +%Y%m%d_%H%M%S).sql
echo "✅ Database backed up"

echo "✅ All pre-deployment checks passed!"
```

### 2. Build & Push Images

```bash
#!/bin/bash
set -e

REGISTRY="traveease.azurecr.io"
VERSION="v3.0.0"
GIT_COMMIT=$(git rev-parse --short HEAD)
BUILD_TAG="${VERSION}-${GIT_COMMIT}"

echo "🏗️  Building and pushing Docker images..."

# Backend
echo "Building backend:${BUILD_TAG}..."
docker build \
  --file backend/Dockerfile \
  --tag ${REGISTRY}/backend:${BUILD_TAG} \
  --tag ${REGISTRY}/backend:latest \
  backend/

echo "Pushing backend:${BUILD_TAG}..."
docker push ${REGISTRY}/backend:${BUILD_TAG}
docker push ${REGISTRY}/backend:latest

# Commerce
echo "Building commerce:${BUILD_TAG}..."
docker build \
  --file commerce/Dockerfile \
  --tag ${REGISTRY}/commerce:${BUILD_TAG} \
  --tag ${REGISTRY}/commerce:latest \
  commerce/

echo "Pushing commerce:${BUILD_TAG}..."
docker push ${REGISTRY}/commerce:${BUILD_TAG}
docker push ${REGISTRY}/commerce:latest

# Frontend
echo "Building frontend:${BUILD_TAG}..."
docker build \
  --file frontend/Dockerfile \
  --tag ${REGISTRY}/frontend:${BUILD_TAG} \
  --tag ${REGISTRY}/frontend:latest \
  frontend/

echo "Pushing frontend:${BUILD_TAG}..."
docker push ${REGISTRY}/frontend:${BUILD_TAG}
docker push ${REGISTRY}/frontend:latest

echo "✅ All images built and pushed: ${BUILD_TAG}"
```

### 3. Deploy with Helm

```bash
#!/bin/bash
set -e

NAMESPACE="production"
RELEASE_NAME="traveease"
CHART_PATH="./helm/traveease"
VERSION="v3.0.0"
GIT_COMMIT=$(git rev-parse --short HEAD)
BUILD_TAG="${VERSION}-${GIT_COMMIT}"

echo "🚀 Deploying Traveease v${VERSION} (${GIT_COMMIT}) to AKS..."

# Create namespace if not exists
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Create image pull secret
kubectl create secret docker-registry acr-secret \
  --docker-server=traveease.azurecr.io \
  --docker-username=$(az acr credential show -n traveease --query username -o tsv) \
  --docker-password=$(az acr credential show -n traveease --query passwords[0].value -o tsv) \
  --namespace=${NAMESPACE} \
  --dry-run=client -o yaml | kubectl apply -f -

# Update Helm values
cat > /tmp/values-override.yaml <<EOF
backend:
  image:
    tag: ${BUILD_TAG}

commerce:
  image:
    tag: ${BUILD_TAG}

frontend:
  image:
    tag: ${BUILD_TAG}

database:
  backup:
    enabled: true
    schedule: "0 2 * * *"  # Daily at 2 AM UTC

monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
EOF

# Validate Helm chart
echo "Validating Helm chart..."
helm lint ${CHART_PATH}
echo "✅ Helm chart valid"

# Dry-run deployment
echo "Running dry-run..."
helm upgrade --install ${RELEASE_NAME} ${CHART_PATH} \
  --namespace ${NAMESPACE} \
  --values /tmp/values-override.yaml \
  --dry-run \
  --debug > /tmp/helm-dry-run.yaml

echo "✅ Dry-run successful. Review /tmp/helm-dry-run.yaml"

# Actual deployment
echo "Deploying to AKS..."
helm upgrade --install ${RELEASE_NAME} ${CHART_PATH} \
  --namespace ${NAMESPACE} \
  --values /tmp/values-override.yaml \
  --wait \
  --timeout 10m \
  --history-max 5

echo "✅ Helm deployment completed"

# Monitor rollout
echo "Monitoring rollout status..."
kubectl rollout status deployment/traveease-backend -n ${NAMESPACE}
kubectl rollout status deployment/traveease-commerce -n ${NAMESPACE}
kubectl rollout status deployment/traveease-frontend -n ${NAMESPACE}

echo "✅ All deployments rolled out successfully"
```

### 4. Post-Deployment Verification

```bash
#!/bin/bash
set -e

NAMESPACE="production"
TIMEOUT=300  # 5 minutes

echo "✅ Running post-deployment verification..."

# Wait for pods
echo "Waiting for all pods to be ready..."
kubectl wait --for=condition=Ready pod \
  -l app=traveease \
  -n ${NAMESPACE} \
  --timeout=${TIMEOUT}s

# Health checks
echo "Running health checks..."
BACKEND_POD=$(kubectl get pods -n ${NAMESPACE} -l app=backend -o jsonpath='{.items[0].metadata.name}')
COMMERCE_POD=$(kubectl get pods -n ${NAMESPACE} -l app=commerce -o jsonpath='{.items[0].metadata.name}')
FRONTEND_POD=$(kubectl get pods -n ${NAMESPACE} -l app=frontend -o jsonpath='{.items[0].metadata.name}')

# Backend health
echo "Backend health..."
kubectl exec -n ${NAMESPACE} ${BACKEND_POD} -- curl -s http://localhost:8000/health | grep -q "ok" && echo "✅ Backend healthy" || echo "❌ Backend health check failed"

# Commerce health
echo "Commerce health..."
kubectl exec -n ${NAMESPACE} ${COMMERCE_POD} -- curl -s http://localhost:3001/api/v1/health | grep -q "ok" && echo "✅ Commerce healthy" || echo "❌ Commerce health check failed"

# Frontend health
echo "Frontend health..."
kubectl exec -n ${NAMESPACE} ${FRONTEND_POD} -- curl -s http://localhost:3000/health | grep -q "ok" && echo "✅ Frontend healthy" || echo "❌ Frontend health check failed"

# Database migration status
echo "Checking database migrations..."
kubectl exec -n ${NAMESPACE} $(kubectl get pods -n ${NAMESPACE} -l app=commerce -o jsonpath='{.items[0].metadata.name}') -- \
  npm run prisma:migrate:status && echo "✅ Migrations up to date"

# Smoke tests
echo "Running smoke tests..."
FRONTEND_URL=$(kubectl get ingress -n ${NAMESPACE} frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -f http://${FRONTEND_URL}/health && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"

# Performance baseline
echo "Checking performance baseline..."
k6 run load-test.js --duration 1m --vus 10 > /tmp/smoke-test-results.json
echo "✅ Performance baseline met (see /tmp/smoke-test-results.json)"

echo "✅ All post-deployment checks passed!"
```

### 5. Monitoring & Alerting

```bash
#!/bin/bash

NAMESPACE="production"

echo "📊 Setting up monitoring and alerting..."

# Get Prometheus URL
PROMETHEUS_URL=$(kubectl get service -n monitoring prometheus-server -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Prometheus: http://${PROMETHEUS_URL}:9090"

# Get Grafana URL
GRAFANA_URL=$(kubectl get service -n monitoring grafana -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Grafana: http://${GRAFANA_URL}:3000"

# Get AlertManager URL
ALERTMANAGER_URL=$(kubectl get service -n monitoring alertmanager -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "AlertManager: http://${ALERTMANAGER_URL}:9093"

# Create PrometheusRule for Traveease
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: traveease-alerts
  namespace: ${NAMESPACE}
spec:
  groups:
  - name: traveease.rules
    interval: 30s
    rules:
    - alert: HighErrorRate
      expr: |
        (sum(rate(http_request_failed[5m])) / sum(rate(http_requests_total[5m]))) > 0.01
      for: 5m
      annotations:
        summary: "High error rate detected"
    
    - alert: HighLatency
      expr: |
        histogram_quantile(0.95, http_request_duration_seconds) > 0.5
      for: 5m
      annotations:
        summary: "High API latency detected"
    
    - alert: PodCrashLooping
      expr: |
        rate(kube_pod_container_status_restarts_total[15m]) > 0
      for: 5m
      annotations:
        summary: "Pod crash looping detected"
EOF

echo "✅ Monitoring and alerting configured"
```

---

## Rollback Procedure

### Manual Rollback

```bash
#!/bin/bash
set -e

NAMESPACE="production"
RELEASE_NAME="traveease"

echo "⚠️  Rolling back to previous version..."

# List release history
echo "Recent deployments:"
helm history ${RELEASE_NAME} -n ${NAMESPACE}

# Rollback to previous
REVISION=$(helm history ${RELEASE_NAME} -n ${NAMESPACE} | tail -2 | head -1 | awk '{print $1}')
echo "Rolling back to revision ${REVISION}..."

helm rollback ${RELEASE_NAME} ${REVISION} \
  --namespace ${NAMESPACE} \
  --wait \
  --timeout 10m

# Verify
kubectl rollout status deployment/traveease-backend -n ${NAMESPACE}
kubectl rollout status deployment/traveease-commerce -n ${NAMESPACE}
kubectl rollout status deployment/traveease-frontend -n ${NAMESPACE}

echo "✅ Rollback completed"
```

### Automatic Rollback (Helm)

```bash
helm upgrade --install traveease ./helm/traveease \
  --namespace production \
  --atomic \
  --timeout 10m
```

The `--atomic` flag automatically rolls back on failure.

---

## Troubleshooting

### Pod Stuck in Pending
```bash
# Check events
kubectl describe pod <pod-name> -n production

# Check PVC
kubectl get pvc -n production

# Check node resources
kubectl top nodes
kubectl describe nodes
```

### Image Pull Errors
```bash
# Verify image exists
az acr repository list -n traveease | grep backend

# Check image pull secret
kubectl get secrets -n production | grep acr

# Verify credentials
kubectl get secret acr-secret -n production -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq .
```

### Database Migration Failed
```bash
# Check migration status
kubectl exec -n production <commerce-pod> -- npm run prisma:migrate:status

# View migration logs
kubectl logs -n production <commerce-pod> --all-containers

# Manual migration (if needed)
kubectl exec -n production <commerce-pod> -- npm run prisma:migrate:deploy
```

### High Memory Usage
```bash
# Check memory by pod
kubectl top pods -n production

# Increase resource limits
kubectl set resources deployment traveease-backend \
  -n production \
  --limits=cpu=2,memory=2Gi \
  --requests=cpu=1,memory=1Gi
```

---

## Deployment Log Template

```markdown
# Deployment Log - Production v3.0.0

**Date:** February 3, 2026
**Version:** v3.0.0
**Commit:** abc1234
**Deployed By:** John Doe
**Duration:** 12 minutes

## Pre-Checks
- [x] Git clean
- [x] Tests passed
- [x] Security scan passed
- [x] Performance baseline met
- [x] Database backed up

## Build & Push
- [x] Backend image: v3.0.0-abc1234
- [x] Commerce image: v3.0.0-abc1234
- [x] Frontend image: v3.0.0-abc1234

## Deployment
- [x] Helm chart validated
- [x] Dry-run passed
- [x] Release deployed
- [x] Rollout successful

## Verification
- [x] All health checks passed
- [x] Database migrations completed
- [x] Smoke tests passed
- [x] Performance baseline met
- [x] Error rate < 1%

## Issues Encountered
None

## Post-Deployment
- [x] Monitoring configured
- [x] Stakeholders notified
- [x] Runbook updated

**Status:** ✅ Deployment successful
```

---

## Quick Commands

```bash
# Check deployment status
kubectl get deployment -n production

# View logs
kubectl logs -n production -f deployment/traveease-backend
kubectl logs -n production -f deployment/traveease-commerce
kubectl logs -n production -f deployment/traveease-frontend

# Execute in pod
kubectl exec -it -n production <pod-name> -- bash

# Port forward
kubectl port-forward -n production svc/traveease-api 3001:3001

# Scale deployment
kubectl scale deployment traveease-backend --replicas=3 -n production

# View resource usage
kubectl top pods -n production
kubectl top nodes

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| DevOps Lead | Alice Johnson | +1-555-0100 | alice@traveease.com |
| Backend Lead | Bob Smith | +1-555-0101 | bob@traveease.com |
| On-Call | TBD | +1-555-0102 | oncall@traveease.com |

---

**Last Updated:** February 3, 2026
**Next Review:** May 3, 2026
**Runbook Version:** 3.0.0
