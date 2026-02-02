# Traveease Azure Deployment Checklist

## Pre-Deployment Phase

### Infrastructure Prerequisites
- [ ] Azure subscription created and activated
- [ ] Azure account has Contributor and User Access Administrator roles
- [ ] Verified Azure service quota (minimum 20 vCPUs)
- [ ] Selected target region (eastus recommended)
- [ ] Reviewed pricing estimates and cost controls

### Local Environment Setup
- [ ] Azure CLI installed (v2.40+)
- [ ] kubectl installed (v1.27+)
- [ ] Helm installed (v3.10+)
- [ ] Docker installed (for image building)
- [ ] Git installed and configured
- [ ] Text editor or IDE (VS Code recommended)

### Tool Verification
Run the verification script:
```bash
chmod +x infrastructure/azure/verify-deployment.sh
./infrastructure/azure/verify-deployment.sh
```
- [ ] All CLI tools verified
- [ ] Azure authentication confirmed
- [ ] All deployment files present
- [ ] ARM template syntax valid
- [ ] File permissions correct

### Authentication & Authorization
- [ ] Logged into Azure (`az login`)
- [ ] Correct subscription selected (`az account set`)
- [ ] Azure CLI credentials cached
- [ ] User has necessary permissions
- [ ] Service Principal configured (if applicable)

### Project Configuration
- [ ] Project repository cloned locally
- [ ] infrastructure/azure/ directory present
- [ ] All scripts have execute permissions
- [ ] Environment variables configured:
  - [ ] AZURE_SUBSCRIPTION_ID
  - [ ] AZURE_RESOURCE_GROUP
  - [ ] AZURE_LOCATION
  - [ ] ENVIRONMENT

---

## Deployment Phase

### Step 1: Setup Azure Resources
- [ ] Read setup.sh carefully
- [ ] Verify resource naming (no conflicts)
- [ ] Execute: `./infrastructure/azure/setup.sh`
- [ ] Verify output:
  - [ ] Resource group created
  - [ ] Container Registry (ACR) created
  - [ ] Key Vault created
  - [ ] Secrets stored securely
- [ ] Save output for reference

### Step 2: Deploy Infrastructure
- [ ] Backup any existing resources
- [ ] Review ARM template (templates/traveease-infrastructure.json)
- [ ] Review Bicep template (templates/traveease-infrastructure.bicep)
- [ ] Execute: `./infrastructure/azure/deploy.sh`
- [ ] Monitor deployment progress:
  - [ ] VNet created (2-3 min)
  - [ ] AKS cluster provisioning (10-15 min)
  - [ ] MySQL database created (5-10 min)
  - [ ] Container Registry configured
  - [ ] Monitoring enabled
- [ ] Verify deployment completion (~30 minutes total)

### Step 3: Kubernetes Configuration
During deploy.sh, verify:
- [ ] kubectl context updated
- [ ] AKS cluster access confirmed
- [ ] Namespaces created:
  - [ ] production
  - [ ] monitoring
  - [ ] ingress-nginx
- [ ] Nginx Ingress Controller installed
- [ ] Kubernetes secrets created:
  - [ ] database-credentials
  - [ ] redis-credentials
  - [ ] api-keys
  - [ ] acr-credentials

### Step 4: Deploy Application Services
- [ ] Build Docker images:
  - [ ] backend (FastAPI)
  - [ ] commerce (NestJS)
  - [ ] frontend (Next.js)
- [ ] Tag images with registry URL
- [ ] Push images to ACR
- [ ] Apply Kubernetes manifests:
  ```bash
  kubectl apply -f infrastructure/azure/manifests/backend-deployment.yaml -n production
  kubectl apply -f infrastructure/azure/manifests/commerce-deployment.yaml -n production
  kubectl apply -f infrastructure/azure/manifests/frontend-deployment.yaml -n production
  kubectl apply -f infrastructure/azure/manifests/ingress-and-policies.yaml
  kubectl apply -f infrastructure/azure/manifests/rbac-and-config.yaml
  ```
- [ ] Verify pod status:
  ```bash
  kubectl get pods -n production
  ```

### Step 5: Database Configuration
- [ ] MySQL server provisioned
- [ ] Databases created:
  - [ ] traveease_production
  - [ ] traveease_audit
- [ ] Run database migrations:
  ```bash
  kubectl exec -it deployment/backend -n production -- python -m alembic upgrade head
  kubectl exec -it deployment/commerce -n production -- npx prisma migrate deploy
  ```
- [ ] Verify database connectivity:
  ```bash
  kubectl exec -it deployment/backend -n production -- python -c "import sqlalchemy; print('OK')"
  ```

### Step 6: Network & DNS Configuration
- [ ] Get LoadBalancer External IP:
  ```bash
  kubectl get svc -n ingress-nginx
  ```
- [ ] Create Azure DNS records:
  - [ ] api.traveease.com → <EXTERNAL_IP>
  - [ ] commerce.traveease.com → <EXTERNAL_IP>
  - [ ] traveease.com → <EXTERNAL_IP>
  - [ ] www.traveease.com → <EXTERNAL_IP>
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify DNS resolution:
  ```bash
  nslookup api.traveease.com
  ```

---

## Post-Deployment Verification

### Health Checks
- [ ] Backend health endpoint:
  ```bash
  curl -I https://api.traveease.com/health
  ```
- [ ] Commerce health endpoint:
  ```bash
  curl -I https://commerce.traveease.com/health
  ```
- [ ] Frontend accessibility:
  ```bash
  curl -I https://traveease.com
  ```

### Kubernetes Verification
- [ ] All pods running:
  ```bash
  kubectl get pods -n production
  ```
- [ ] No pod errors:
  ```bash
  kubectl get events -n production
  ```
- [ ] Pod logs clean:
  ```bash
  kubectl logs deployment/backend -n production --tail=50
  ```
- [ ] Services accessible:
  ```bash
  kubectl get svc -n production
  ```

### Azure Resource Verification
- [ ] AKS cluster healthy (Portal → AKS → Overview)
- [ ] Nodes ready (Portal → AKS → Node pools)
- [ ] MySQL server running (Portal → Azure Database for MySQL)
- [ ] Container Registry active (Portal → Container registries)
- [ ] Key Vault accessible (Portal → Key Vault)

### Monitoring & Logging
- [ ] Application Insights receiving data
- [ ] Log Analytics workspace populated
- [ ] Metrics visible in Azure Portal
- [ ] No critical alerts

### SSL/TLS Certificate
- [ ] Certificate issued by Let's Encrypt
- [ ] HTTPS accessible on all domains
- [ ] Certificate valid (check browser certificate info)
- [ ] Certificate renewal scheduled (auto-renewal enabled)

---

## Security Verification

### Network Security
- [ ] Network Security Groups configured
- [ ] Firewall rules restrictive (deny by default)
- [ ] Only necessary ports open (80, 443)
- [ ] Database not publicly accessible
- [ ] VNet properly segmented

### Secrets & Access Control
- [ ] All secrets in Key Vault (not in code)
- [ ] Database passwords changed from defaults
- [ ] API keys rotated for production
- [ ] RBAC policies enforced
- [ ] Service accounts configured
- [ ] Pod security context enabled

### Encryption
- [ ] TLS 1.2+ enforced
- [ ] Database encryption enabled
- [ ] Storage encryption enabled
- [ ] Secrets encrypted at rest
- [ ] Backups encrypted

---

## Configuration Verification

### Environment Variables
- [ ] Database URL correct
- [ ] Redis URL configured
- [ ] API keys set (Amadeus, Stripe, PayPal, Flutterwave, Paystack)
- [ ] JWT secret configured
- [ ] Log level set appropriately
- [ ] Environment set to "production"

### Application Configuration
- [ ] Payment gateway credentials valid
- [ ] Email service configured
- [ ] SMS service configured (if applicable)
- [ ] Cache TTL appropriate
- [ ] Session timeout configured
- [ ] Logging properly configured

### Database Configuration
- [ ] Character set: UTF8MB4
- [ ] Collation: utf8mb4_general_ci
- [ ] Timezone: UTC
- [ ] Backup retention: 30 days
- [ ] High availability: Zone-redundant

---

## Performance & Optimization

### Resource Allocation
- [ ] CPU requests/limits appropriate
- [ ] Memory requests/limits appropriate
- [ ] Pod anti-affinity rules working
- [ ] Auto-scaling enabled
- [ ] Load balanced correctly

### Database Performance
- [ ] Connection pooling configured
- [ ] Indexes created on key columns
- [ ] Query performance acceptable
- [ ] Slow query log enabled
- [ ] Backups completing on schedule

### Caching
- [ ] Redis cache operational
- [ ] Cache invalidation working
- [ ] Cache hit rate > 70% (if applicable)
- [ ] TTL values appropriate

---

## Backup & Disaster Recovery

### Backup Configuration
- [ ] Database backups: 30-day retention
- [ ] Geo-redundant backups enabled
- [ ] Container images retained: 30 days
- [ ] Configuration backed up
- [ ] Backup encryption verified

### Recovery Testing
- [ ] Tested database point-in-time restore
- [ ] Tested pod restart from latest image
- [ ] Tested deployment rollback
- [ ] Recovery time documented
- [ ] Recovery runbook created

---

## Monitoring & Alerting

### Metrics Collection
- [ ] CPU usage metrics available
- [ ] Memory usage metrics available
- [ ] Network metrics available
- [ ] Application metrics available
- [ ] Database metrics available

### Log Aggregation
- [ ] Application logs centralized
- [ ] System logs captured
- [ ] Audit logs enabled
- [ ] Log retention: 30 days
- [ ] Log analysis tools working

### Alerting
- [ ] High CPU alert configured
- [ ] High memory alert configured
- [ ] Pod restart alert configured
- [ ] Database connection alert configured
- [ ] Certificate expiration alert configured
- [ ] Slack/Email notifications working

---

## Documentation

### Created Documentation
- [ ] Architecture diagram
- [ ] Deployment guide (AZURE_DEPLOYMENT_GUIDE.md)
- [ ] Runbook for common tasks
- [ ] Troubleshooting guide
- [ ] Rollback procedures (rollback.sh)

### Configuration Documentation
- [ ] Environment variables documented
- [ ] Secrets list maintained (in Key Vault)
- [ ] Resource names documented
- [ ] DNS configuration documented
- [ ] Firewall rules documented

### Operations Documentation
- [ ] Monitoring dashboard link documented
- [ ] Log analysis procedures documented
- [ ] Emergency procedures documented
- [ ] Escalation path documented
- [ ] On-call setup documented

---

## CI/CD Configuration

### GitHub Setup
- [ ] Repository configured
- [ ] Secrets added to GitHub:
  - [ ] AZURE_SUBSCRIPTION_ID
  - [ ] AZURE_RESOURCE_GROUP
  - [ ] AZURE_CONTAINER_REGISTRY_LOGIN_SERVER
  - [ ] AZURE_CONTAINER_REGISTRY_USERNAME
  - [ ] AZURE_CONTAINER_REGISTRY_PASSWORD
  - [ ] AZURE_AKS_CLUSTER_NAME
  - [ ] SLACK_WEBHOOK (optional)

### GitHub Actions Workflow
- [ ] Workflow file present (.github/workflows/azure-deploy.yml)
- [ ] Trigger configured (push to main)
- [ ] Build jobs working
- [ ] Push to ACR successful
- [ ] Deployment to AKS successful
- [ ] Database migrations running
- [ ] Health checks passing
- [ ] Notifications working

### Deployment Triggers
- [ ] Test push to main branch
- [ ] Verify workflow runs
- [ ] Verify deployment succeeds
- [ ] Verify notifications sent

---

## Final Sign-Off

### Testing Complete
- [ ] Functional testing passed
- [ ] Performance testing passed
- [ ] Security testing passed
- [ ] Load testing passed (if applicable)
- [ ] Failover testing passed

### Production Ready
- [ ] All checklist items completed
- [ ] Documentation finalized
- [ ] Team trained on operations
- [ ] On-call rotation established
- [ ] Monitoring dashboard reviewed

### Deployment Sign-Off
- [ ] Project Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______
- [ ] Product Lead: _________________ Date: _______

---

## Post-Deployment Tasks

### First Week
- [ ] Monitor all metrics closely
- [ ] Watch for any errors in logs
- [ ] Verify database performance
- [ ] Monitor cost trends
- [ ] Collect team feedback

### First Month
- [ ] Complete security audit
- [ ] Performance baseline established
- [ ] Documentation reviewed and updated
- [ ] Disaster recovery tested
- [ ] Team confidence assessment

### Ongoing Maintenance
- [ ] Patch management schedule established
- [ ] Image scanning enabled
- [ ] Cost optimization review (monthly)
- [ ] Security updates applied
- [ ] Backup restoration tested

---

## Support & Escalation

### Emergency Contacts
- DevOps Lead: ____________________ Phone: ____________
- On-Call: ____________________ Phone: ____________
- Azure Support: ____________________ ID: ____________

### Common Issues Reference
See AZURE_DEPLOYMENT_GUIDE.md Troubleshooting section for:
- Pod not starting
- Database connectivity issues
- LoadBalancer IP pending
- High resource usage
- Certificate issues

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Approved By:** _________________

---

*This checklist should be completed before considering production deployment as complete.*
*Keep a copy for audit and compliance purposes.*
