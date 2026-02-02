# Traveease Azure Production Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Pre-Deployment Setup](#pre-deployment-setup)
4. [Deployment Process](#deployment-process)
5. [Verification & Testing](#verification--testing)
6. [Monitoring & Logs](#monitoring--logs)
7. [Scaling & Performance](#scaling--performance)
8. [Backup & Disaster Recovery](#backup--disaster-recovery)
9. [Troubleshooting](#troubleshooting)
10. [Cost Optimization](#cost-optimization)

---

## Prerequisites

### Azure Account Setup

1. **Azure Subscription**: Create an Azure subscription at https://azure.microsoft.com
2. **Azure CLI**: Install from https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
3. **kubectl**: Install Kubernetes CLI
4. **Helm**: Install Helm package manager (v3+)
5. **Docker**: Install Docker for building images

### Required Permissions

Your Azure user needs these roles:
- Contributor (for resource creation)
- User Access Administrator (for RBAC)
- Or custom role with permissions for:
  - Microsoft.ContainerService/*
  - Microsoft.DBforMySQL/*
  - Microsoft.Storage/*
  - Microsoft.KeyVault/*
  - Microsoft.ContainerRegistry/*

### Environment Setup

```bash
# Login to Azure
az login

# Set default subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify login
az account show

# Install kubectl
az aks install-cli

# Verify installations
az version
kubectl version --client
helm version
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Azure Region (East US)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Virtual Network (10.0.0.0/8)                   │ │
│  ├──────────────────────────────────────────────────┤ │
│  │                                                  │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  AKS Cluster (Kubernetes)                 │ │ │
│  │  │  ├─ Backend Pod (FastAPI, port 8000)      │ │ │
│  │  │  ├─ Commerce Pod (NestJS, port 3001)      │ │ │
│  │  │  ├─ Frontend Pod (Next.js, port 3000)     │ │ │
│  │  │  └─ 3 Nodes (Standard_D2s_v3)             │ │ │
│  │  │                                             │ │ │
│  │  │  Ingress: Nginx with LoadBalancer          │ │ │
│  │  │  └─ Routes traffic to services             │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  Azure Database for MySQL                 │ │ │
│  │  │  ├─ 8.0 Flexible Server                   │ │ │
│  │  │  ├─ Zone Redundant (HA)                   │ │ │
│  │  │  ├─ Encrypted Storage                     │ │ │
│  │  │  └─ 30-Day Backups                        │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  Azure Storage Account                    │ │ │
│  │  │  ├─ Geo-Redundant (GRS)                   │ │ │
│  │  │  ├─ TLS 1.2+ Required                     │ │ │
│  │  │  └─ Backup Containers                     │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  Container Registry (ACR)                 │ │ │
│  │  │  ├─ Premium Tier                          │ │ │
│  │  │  ├─ Geo-Replication                       │ │ │
│  │  │  └─ 30-Day Retention Policy               │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Monitoring & Security                          │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  • Azure Monitor + Application Insights        │ │
│  │  • Log Analytics Workspace (30-day retention)  │ │
│  │  • Key Vault (secrets management)              │ │
│  │  • Network Security Groups (firewalls)         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pre-Deployment Setup

### Step 1: Prepare Environment Variables

```bash
# Export Azure configuration
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_RESOURCE_GROUP="traveease-production"
export AZURE_LOCATION="eastus"
export ENVIRONMENT="production"

# Verify
az account show
```

### Step 2: Run Azure Setup Script

```bash
chmod +x ./infrastructure/azure/setup.sh
./infrastructure/azure/setup.sh
```

**What this script does**:
- ✓ Creates resource group
- ✓ Creates Azure Container Registry (ACR)
- ✓ Creates Key Vault
- ✓ Stores secrets in Key Vault
- ✓ Registers Azure providers

**Expected output**:
```
[✓] Azure setup completed successfully!

Azure Configuration:
  Subscription: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  Resource Group: traveease-production
  Location: eastus

ACR Configuration:
  Registry Name: traveaseproduction
  Login Server: traveaseproduction.azurecr.io
  Username: traveaseproduction

Key Vault:
  Name: traveease-production-kv
  Location: eastus
```

### Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
   - `AZURE_RESOURCE_GROUP`: traveease-production
   - `AZURE_CONTAINER_REGISTRY_LOGIN_SERVER`: ACR login server
   - `AZURE_CONTAINER_REGISTRY_USERNAME`: ACR username
   - `AZURE_CONTAINER_REGISTRY_PASSWORD`: ACR password
   - `AZURE_AKS_CLUSTER_NAME`: AKS cluster name (from deployment output)
   - `SLACK_WEBHOOK`: (Optional) Slack webhook URL

---

## Deployment Process

### Step 1: Run Deployment Script

```bash
chmod +x ./infrastructure/azure/deploy.sh
./infrastructure/azure/deploy.sh
```

**Deployment timeline**:
- Resource Group: ~1 minute
- Virtual Network: ~2 minutes
- AKS Cluster: ~10-15 minutes
- Azure Database: ~5-10 minutes
- Container Registry: ~2 minutes
- **Total: ~20-30 minutes**

**What this script does**:
1. Validates ARM template
2. Deploys resources (VNet, AKS, MySQL, ACR, Storage)
3. Configures kubectl
4. Creates Kubernetes namespaces
5. Installs Nginx Ingress Controller
6. Creates secrets for database and API keys
7. Sets up monitoring

### Step 2: Configure DNS

```bash
# Get LoadBalancer IP
kubectl get svc -n ingress-nginx

# Point your domain to the External IP
# In Azure Portal or DNS provider:
# - Create A record: api.traveease.com → <EXTERNAL_IP>
```

### Step 3: Deploy Application

The GitHub Actions workflow automatically deploys when you push to main:

```bash
git push origin main
# Triggers: .github/workflows/azure-deploy.yml
```

Or manually deploy:

```bash
# Tag images
docker build -t traveaseproduction.azurecr.io/production-backend:v1.0.0 ./backend
docker push traveaseproduction.azurecr.io/production-backend:v1.0.0

# Create/update deployment manifests and apply
kubectl apply -f infrastructure/azure/manifests/backend-deployment.yaml -n production
```

---

## Verification & Testing

### Health Check Verification

```bash
# Get LoadBalancer IP
EXTERNAL_IP=$(kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test endpoints
curl -I http://$EXTERNAL_IP/
curl -I http://$EXTERNAL_IP/api/health
curl -I http://$EXTERNAL_IP/payments/health
```

### AKS Cluster Verification

```bash
# List nodes
kubectl get nodes

# Check pod status
kubectl get pods -n production

# Describe deployment
kubectl describe deployment backend -n production

# Check events
kubectl get events -n production
```

### Database Verification

```bash
# Connect to database
# Get database FQDN from ARM deployment output or:
DB_FQDN=$(az deployment group show \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <deployment-name> \
  --query properties.outputs.databaseServerFqdn.value -o tsv)

# Connect (requires SSL)
mysql -h "$DB_FQDN" -u sqladmin -p -e "SELECT 1;" --ssl-mode=REQUIRED
```

---

## Monitoring & Logs

### View Kubernetes Logs

```bash
# Real-time logs
kubectl logs -f deployment/backend -n production

# Last 100 lines
kubectl logs --tail=100 deployment/backend -n production

# Previous logs (if pod crashed)
kubectl logs --previous deployment/backend -n production
```

### View Azure Monitor

```bash
# In Azure Portal:
# 1. Navigate to AKS cluster
# 2. Click "Insights"
# 3. View metrics and logs

# Or via CLI:
az monitor metrics list \
  --resource /subscriptions/<id>/resourceGroups/<rg>/providers/Microsoft.ContainerService/managedClusters/<cluster> \
  --metric CPUUsagePercentage
```

### View Application Insights

```bash
# Search traces
az monitor app-insights query \
  --app <insights-name> \
  --analytics-query "traces | take 10"
```

---

## Scaling & Performance

### Scale AKS Nodes

```bash
# Scale node pool
az aks scale --resource-group $AZURE_RESOURCE_GROUP \
  --name <cluster-name> \
  --node-count 5

# Auto-scaling (requires AKS auto-scaler addon)
az aks update \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <cluster-name> \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10
```

### Scale Kubernetes Deployments

```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n production

# Auto-scaling (requires Metrics Server)
kubectl autoscale deployment backend \
  --min=2 \
  --max=10 \
  --cpu-percent=70 \
  -n production
```

### Database Scaling

```bash
# Scale up compute
az mysql flexible-server update \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <db-server> \
  --sku-name Standard_D4s_v3

# Scale up storage
az mysql flexible-server update \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <db-server> \
  --storage 512
```

---

## Backup & Disaster Recovery

### Enable Automated Backups

```bash
# Already enabled in ARM template (30 days)
# Verify:
az mysql flexible-server show \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <db-server> \
  --query backup.backupRetentionDays
```

### Create Manual Backup

```bash
# Database dump
FQDN=$(az mysql flexible-server show \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <db-server> \
  --query fullyQualifiedDomainName -o tsv)

mysqldump -h "$FQDN" -u sqladmin -p --all-databases --single-transaction > backup.sql
```

### Restore from Backup

```bash
# Point-in-time restore
az mysql flexible-server restore \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <new-server-name> \
  --source-server <original-server> \
  --restore-time 2024-01-15T10:00:00Z
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# Check logs
kubectl logs <pod-name> -n production

# Check events
kubectl get events -n production
```

### Cannot Connect to Database

```bash
# Verify MySQL server is running
az mysql flexible-server show \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name <db-server>

# Check firewall rules
az mysql flexible-server firewall-rule list \
  --resource-group $AZURE_RESOURCE_GROUP \
  --server-name <db-server>

# Test connection with SSL
mysql -h <fqdn> -u sqladmin -p -e "SELECT 1;" --ssl-mode=REQUIRED
```

### High Memory/CPU Usage

```bash
# Check resource usage
kubectl top nodes -n production
kubectl top pods -n production

# Check resource limits
kubectl get pod <pod-name> -n production -o yaml | grep -A 5 resources

# Increase limits if needed
kubectl set resources deployment backend -n production --limits=cpu=2,memory=4Gi
```

### LoadBalancer IP Pending

```bash
# Wait for IP assignment
kubectl get svc -n ingress-nginx --watch

# Check service details
kubectl describe svc nginx-ingress-ingress-nginx-controller -n ingress-nginx

# Check for errors
kubectl get events -n ingress-nginx
```

---

## Cost Optimization

### Cost Analysis

```bash
# View resource costs in Azure Portal:
# 1. Cost Management + Billing
# 2. Cost Analysis
# 3. Filter by resource group

# Estimate with CLI:
az costmanagement query create \
  --type Usage \
  --timeframe MonthToDate \
  --scope "/subscriptions/<id>"
```

### Cost Reduction Strategies

1. **Use Spot VMs** (Up to 90% savings):
   ```bash
   # Requires manual node pool creation
   az aks nodepool add --resource-group $AZURE_RESOURCE_GROUP \
     --cluster-name <cluster> \
     --name spotnodes \
     --priority Spot \
     --eviction-policy Deallocate
   ```

2. **Reserved Instances** (30-40% discount)
   - Purchase through Azure Portal
   - 1-year or 3-year commitment

3. **Auto-scaling** (Right-size resources)
   - Enable cluster autoscaler
   - Configure pod autoscaling
   - Only pay for what you use

4. **Database Optimization**
   - Use Burstable tier for non-production
   - Scale down during off-hours
   - Archive old data to Storage

### Estimated Monthly Costs

```
Base Configuration:
├─ AKS (3 D2s_v3 nodes)        $360
├─ Azure Database MySQL        $150
├─ Storage Account             $25
├─ Container Registry          $10
└─ Monitoring                  $50
   ─────────────────────────
   Total                      ~$595/month

Optimized (with Spot VMs):
├─ AKS (2 spot + 1 regular)   $180
├─ Azure Database MySQL        $75 (Burstable)
├─ Storage Account             $15
├─ Container Registry          $5
└─ Monitoring                  $30
   ─────────────────────────
   Total                      ~$305/month
```

---

## Support Resources

- **Azure Documentation**: https://learn.microsoft.com/en-us/azure/
- **AKS Documentation**: https://learn.microsoft.com/en-us/azure/aks/
- **MySQL Docs**: https://learn.microsoft.com/en-us/azure/mysql/
- **kubectl Docs**: https://kubernetes.io/docs/
- **Azure CLI Docs**: https://learn.microsoft.com/en-us/cli/azure/

---

## Maintenance Tasks

### Daily
- Monitor AKS health
- Check pod status
- Review error logs
- Monitor database performance

### Weekly
- Review cost reports
- Verify backups
- Check security updates
- Review scaling metrics

### Monthly
- Update images
- Review capacity
- Test disaster recovery
- Audit access logs

---

*Last Updated: 2024*
*Traveease Azure Deployment Guide v1.0*
