# Traveease Azure Infrastructure Package

## Overview

This directory contains a complete, production-ready Azure deployment package for Traveease, including infrastructure-as-code, automation scripts, Kubernetes manifests, and comprehensive documentation.

## 📦 Package Contents

### Core Infrastructure
- **templates/traveease-infrastructure.json** - ARM template defining all Azure resources
- **setup.sh** - Azure environment initialization and prerequisite setup
- **deploy.sh** - Automated infrastructure deployment orchestration

### Kubernetes Manifests
- **manifests/backend-deployment.yaml** - Backend API service (FastAPI)
- **manifests/commerce-deployment.yaml** - Commerce service (NestJS)
- **manifests/frontend-deployment.yaml** - Frontend service (Next.js)
- **manifests/ingress-and-policies.yaml** - Ingress controller, TLS, network policies
- **manifests/rbac-and-config.yaml** - RBAC, ConfigMaps, Secrets, PVCs

### CI/CD & Operations
- **../.github/workflows/azure-deploy.yml** - GitHub Actions CI/CD pipeline
- **rollback.sh** - Safe rollback procedures
- **AZURE_DEPLOYMENT_GUIDE.md** - Comprehensive operational documentation

## 🏗️ Architecture

```
Azure Subscription
├── Resource Group (traveease-production)
├── Virtual Network (10.0.0.0/8)
│   ├── AKS Subnet (10.1.0.0/16)
│   ├── App Gateway Subnet (10.2.0.0/24)
│   └── Database Subnet (10.3.0.0/24)
├── AKS Cluster (Kubernetes 1.27)
│   ├── Backend Pod (FastAPI)
│   ├── Commerce Pod (NestJS)
│   └── Frontend Pod (Next.js)
├── Azure Database for MySQL (Zone-Redundant)
├── Azure Container Registry (ACR)
├── Azure Storage Account (Geo-Redundant)
├── Key Vault (Secrets Management)
├── Log Analytics + Application Insights
└── Network Security Groups (Firewalls)
```

## 🚀 Quick Start

### Prerequisites
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install kubectl
az aks install-cli

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installations
az version
kubectl version --client
helm version
```

### 1. Login to Azure
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2. Run Setup Script
```bash
chmod +x ./setup.sh
./setup.sh
```

**Output includes:**
- Resource Group name
- Azure Container Registry login credentials
- Key Vault name for secrets storage

### 3. Deploy Infrastructure
```bash
chmod +x ./deploy.sh
./deploy.sh
```

**Deployment takes 20-30 minutes and includes:**
- VNet and subnet creation
- AKS cluster provisioning
- MySQL Flexible Server setup
- Container Registry configuration
- Kubernetes namespace creation
- Nginx Ingress Controller installation
- Secret management setup

### 4. Configure GitHub Secrets
In your GitHub repository: **Settings → Secrets and variables → Actions**

Add these secrets:
```
AZURE_SUBSCRIPTION_ID
AZURE_RESOURCE_GROUP
AZURE_CONTAINER_REGISTRY_LOGIN_SERVER
AZURE_CONTAINER_REGISTRY_USERNAME
AZURE_CONTAINER_REGISTRY_PASSWORD
AZURE_AKS_CLUSTER_NAME
SLACK_WEBHOOK (optional)
```

### 5. Deploy Application
Push code to main branch:
```bash
git push origin main
```

This triggers the GitHub Actions workflow which:
- Builds Docker images
- Pushes to Azure Container Registry
- Deploys to AKS
- Runs database migrations
- Verifies health endpoints

## 📋 File Reference

### setup.sh
**Purpose:** Initialize Azure environment

**What it does:**
- Creates resource group
- Creates ACR with lifecycle policies
- Creates Key Vault with soft delete
- Registers Azure providers
- Stores secrets securely

**Usage:**
```bash
./setup.sh
```

**Required permissions:**
- Contributor role on subscription

### deploy.sh
**Purpose:** Deploy ARM template and configure Kubernetes

**What it does:**
- Validates ARM template
- Deploys infrastructure (10-15 min)
- Configures kubectl access
- Creates namespaces and RBAC
- Installs Nginx Ingress via Helm
- Creates Kubernetes secrets

**Usage:**
```bash
./deploy.sh
```

**Parameters:**
- `ENVIRONMENT`: production (default)
- `LOCATION`: eastus (default)

### rollback.sh
**Purpose:** Safe rollback of failed deployments

**Usage:**
```bash
# Rollback to previous version
./rollback.sh backend

# Rollback to specific revision
./rollback.sh backend --revision 5

# List all revisions
./rollback.sh backend --list

# Dry run (show what would happen)
./rollback.sh backend --dry-run

# Rollback all deployments
./rollback.sh --all
```

**Features:**
- Automatic rollout status monitoring
- Health check verification
- Event logging
- Timeout handling

### Backend Deployment (backend-deployment.yaml)
**Service:** FastAPI
**Port:** 8000
**Replicas:** 3
**CPU:** 500m-1000m
**Memory:** 512Mi-1Gi
**HPA:** 3-10 replicas based on CPU/Memory

**Features:**
- Liveness/readiness probes
- Rolling update strategy
- Pod anti-affinity
- Init container for DB migrations
- Security context (read-only filesystem)
- Resource limits and requests
- Secrets injection
- Metrics export (Prometheus)

### Commerce Deployment (commerce-deployment.yaml)
**Service:** NestJS
**Port:** 3001
**Replicas:** 2
**CPU:** 400m-800m
**Memory:** 512Mi-1Gi
**HPA:** 2-8 replicas

**Features:**
- Same pattern as backend
- Prisma migrations via init container
- Payment gateway credentials
- Auto-scaling on CPU/memory metrics

### Frontend Deployment (frontend-deployment.yaml)
**Service:** Next.js
**Port:** 3000
**Replicas:** 2
**CPU:** 250m-500m
**Memory:** 256Mi-512Mi
**HPA:** 2-6 replicas

**Features:**
- Read-only filesystem (nginx user)
- Cache mounting
- Minimal resource footprint
- Pod disruption budgets

### Ingress Configuration (ingress-and-policies.yaml)
**Features:**
- SSL/TLS termination via cert-manager
- Let's Encrypt integration
- Network policies (restricted ingress/egress)
- Resource quotas
- Rate limiting

### RBAC & Configuration (rbac-and-config.yaml)
**Features:**
- Service accounts for each service
- Role-based access control
- ConfigMaps for application config
- Secrets for sensitive data
- PersistentVolumeClaims for logs/cache

## 🔄 Deployment Workflow

```
1. Developer pushes to main
   ↓
2. GitHub Actions triggered
   ↓
3. Build Docker images (backend, commerce, frontend)
   ↓
4. Push to Azure Container Registry (ACR)
   ↓
5. Update deployment manifests
   ↓
6. Deploy to AKS via kubectl
   ↓
7. Wait for rollout (5min timeout)
   ↓
8. Run database migrations
   ↓
9. Verify health endpoints
   ↓
10. Notify Slack (success/failure)
```

## 📊 Monitoring & Operations

### View Logs
```bash
# Real-time logs from backend
kubectl logs -f deployment/backend -n production

# View Azure Monitor
# Portal: AKS Cluster → Insights → Metrics

# Query Application Insights
az monitor app-insights query --app <insights-name> \
  --analytics-query "traces | take 10"
```

### Check Deployment Status
```bash
# Pod status
kubectl get pods -n production

# Node status
kubectl get nodes

# Deployment details
kubectl describe deployment backend -n production

# Events
kubectl get events -n production
```

### Scale Services
```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n production

# AKS node scaling
az aks scale --resource-group traveease-production \
  --name <cluster-name> --node-count 5

# Enable autoscaling
az aks update --resource-group traveease-production \
  --name <cluster-name> \
  --enable-cluster-autoscaler \
  --min-count 3 --max-count 10
```

## 💾 Backup & Disaster Recovery

### Database Backups
- Automatic: 30-day retention
- Restore via Point-in-Time Recovery (PITR)
- Manual dump: `mysqldump` to Azure Blob Storage

### Container Images
- ACR stores all images with 30-day retention
- Geo-replication for disaster recovery
- Vulnerability scanning included

### Application State
- Secrets stored in Azure Key Vault
- Configuration in ConfigMaps
- Database as source of truth

## 🔐 Security Features

- **Network Isolation:** NSGs with restricted ingress/egress
- **Encryption:** TLS 1.2+ for all communication
- **Secrets Management:** Azure Key Vault integration
- **RBAC:** Least privilege access control
- **Pod Security:** Non-root users, read-only filesystems
- **SSL/TLS:** Let's Encrypt via cert-manager
- **Managed Identity:** No credentials in pods

## 💰 Cost Optimization

**Base Configuration:** ~$595/month
```
AKS (3 nodes): $360
MySQL: $150
Storage: $25
Container Registry: $10
Monitoring: $50
```

**Optimized (with Spot VMs):** ~$305/month
```
AKS (Spot + Reserved): $180
MySQL (Burstable): $75
Storage: $15
Container Registry: $5
Monitoring: $30
```

**Savings Tips:**
1. Use Spot VMs for non-critical workloads (up to 90% savings)
2. Purchase Reserved Instances (30-40% discount)
3. Auto-scale based on demand
4. Archive old data to Blob Storage

## 🆘 Troubleshooting

### Pod not starting
```bash
kubectl describe pod <pod-name> -n production
kubectl logs <pod-name> -n production
```

### Cannot connect to database
```bash
az mysql flexible-server show \
  --resource-group traveease-production \
  --name <server>
```

### LoadBalancer IP pending
```bash
kubectl get svc -n ingress-nginx --watch
kubectl describe svc nginx-ingress-ingress-nginx-controller -n ingress-nginx
```

### High memory/CPU usage
```bash
kubectl top pods -n production
kubectl top nodes
```

See [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) for comprehensive troubleshooting.

## 📚 Additional Resources

- [Azure Documentation](https://learn.microsoft.com/en-us/azure/)
- [AKS Best Practices](https://learn.microsoft.com/en-us/azure/aks/best-practices)
- [MySQL Flexible Server](https://learn.microsoft.com/en-us/azure/mysql/)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [ARM Template Reference](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/)

## 🚨 Important Notes

1. **Always test in development first** before applying to production
2. **Backup database** before major operations
3. **Monitor costs** in Azure Portal
4. **Update secrets** after initial deployment
5. **Enable audit logging** for compliance
6. **Use Slack webhook** for notifications
7. **Keep images updated** with security patches

## 📝 Support & Contact

- **Documentation:** See [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md)
- **Issues:** Check troubleshooting section
- **Enhancement Requests:** Open GitHub issues
- **Security:** Report via security@traveease.com

---

**Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Traveease DevOps Team
