# Traveease AWS Deployment - Quick Reference

## 🚀 5-Minute Quick Start

### Prerequisites
```bash
# Install required tools
brew install aws-cli jq docker mysql-client
# or on Ubuntu: sudo apt-get install awscli jq docker.io mysql-client

# Configure AWS
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output (json)
```

### Step 1: Setup AWS Infrastructure
```bash
cd infrastructure/aws
chmod +x setup.sh deploy.sh rollback.sh
./setup.sh  # Creates ECR repos, Secrets Manager entries
```

### Step 2: Deploy Infrastructure
```bash
export CERTIFICATE_ARN="arn:aws:acm:us-east-1:123456789:certificate/abc123"
./deploy.sh  # Creates VPC, RDS, ECS, ALB (~15 minutes)
```

### Step 3: Get Deployment Info
```bash
# From the deployment output, note:
# - ALB_DNS: traveease-alb-xxx.elb.amazonaws.com
# - RDS_ENDPOINT: traveease-production-db.c9akciq.us-east-1.rds.amazonaws.com
# - ECS_CLUSTER: traveease-production-cluster
```

### Step 4: Push Docker Images & Deploy
```bash
# Images are deployed via GitHub Actions when you push to main branch
# Or push manually:
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t production-backend:latest ./backend
docker tag production-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/production-backend:latest
# Repeat for commerce and frontend
```

### Step 5: Access Application
```bash
# Get ALB DNS
curl http://<ALB_DNS>/
# Should respond with 200 OK
```

---

## 📋 Deployment Modes

### Option 1: CloudFormation (AWS-Native, Recommended)
```bash
./infrastructure/aws/setup.sh      # Prepare AWS
./infrastructure/aws/deploy.sh     # Deploy stack
```
**Time**: ~15 minutes | **Maintenance**: Minimal | **Multi-Cloud**: No

### Option 2: Terraform (Infrastructure as Code)
```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```
**Time**: ~20 minutes | **Maintenance**: Git-tracked | **Multi-Cloud**: Yes

### Option 3: Both (Hybrid)
Use Terraform for infrastructure, GitHub Actions for continuous deployment
```bash
# Deploy once with Terraform
cd infrastructure/terraform && terraform apply

# Then use GitHub Actions for CI/CD on code pushes
git push origin main  # Triggers .github/workflows/aws-deploy.yml
```

---

## 🔄 Common Workflows

### Deploy New Version
```bash
# GitHub Actions handles this automatically on git push
git add .
git commit -m "Update backend service"
git push origin main

# Watch deployment: GitHub Actions → aws-deploy workflow
# Logs: CloudWatch → /ecs/production-backend
```

### Scale Services
```bash
# Automatic scaling: 2-10 tasks based on 70% CPU target
# Manual scaling:
aws ecs update-service \
  --cluster traveease-production-cluster \
  --service production-backend \
  --desired-count 5 \
  --region us-east-1
```

### Monitor Logs
```bash
# Real-time logs
aws logs tail /ecs/production-backend --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /ecs/production-backend \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Rollback Deployment
```bash
# Automatic rollback to previous task definition
./infrastructure/aws/rollback.sh

# Or manual:
aws ecs update-service \
  --cluster traveease-production-cluster \
  --service production-backend \
  --task-definition production-backend:1  # Previous revision
  --region us-east-1
```

### Database Operations
```bash
# Get RDS endpoint
RDS=$(aws rds describe-db-clusters \
  --db-cluster-identifier traveease-production-db-cluster \
  --query 'DBClusters[0].Endpoint' --output text)

# Connect to database
mysql -h $RDS -u admin -p

# Run migrations
aws ecs execute-command \
  --cluster traveease-production-cluster \
  --task <task-id> \
  --container production-commerce \
  --interactive \
  --command "npx prisma migrate deploy"

# Create backup
aws rds create-db-snapshot \
  --db-cluster-identifier traveease-production-db-cluster \
  --db-cluster-snapshot-identifier backup-$(date +%Y%m%d-%H%M%S)
```

---

## 🔍 Troubleshooting Quick Links

| Issue | Command |
|-------|---------|
| Services not healthy | `aws elbv2 describe-target-health --target-group-arn <arn>` |
| High memory usage | `aws ecs describe-tasks --cluster <cluster> --tasks <task-arn>` |
| Database connection failed | `mysql -h <rds-endpoint> -u admin -p -e "SELECT 1"` |
| Cannot push to ECR | `aws ecr get-login-password \| docker login ...` |
| Logs not appearing | `aws logs describe-log-groups \| grep production` |
| Deployment stuck | `terraform plan` or `aws cloudformation describe-stacks --stack-name traveease-production` |
| Certificate error | `aws acm list-certificates --region us-east-1` |

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Route53 (DNS)                                          │
│  api.traveease.com ──────────────────────────────┐     │
└─────────────────────────────────────────────────────────┘
                                                   │
                              ┌────────────────────▼────┐
                              │  ALB                     │
                              │  Port 80 → 443          │
                              └────────────────────┬────┘
                                                   │
         ┌─────────────────────────────────────────┼─────────────────┐
         │                                         │                 │
    ┌────▼────┐                            ┌────────▼───┐     ┌────▼─────┐
    │Backend   │◄───────────────────────►  │ Commerce  │     │Frontend   │
    │Port 8000 │    ECS Fargate            │Port 3001  │     │Port 3000  │
    │2-10 tasks│    1024 CPU/2GB RAM       │2-10 tasks │     │512 CPU/1GB│
    └────┬────┘                            └────┬─────┘     └────┬──────┘
         │                                      │                │
         └──────────────────────┬────────────────┘────────────────┘
                                │
                        ┌───────▼──────────┐
                        │  RDS MySQL 8.0   │
                        │  db.t3.medium    │
                        │  100GB Storage   │
                        │  Multi-AZ        │
                        │  Encrypted       │
                        └──────────────────┘

Monitoring:
├─ CloudWatch Logs (/ecs/production-*)
├─ CloudWatch Metrics (CPU, Memory, Network)
├─ Container Insights
└─ Alarms (High CPU, Unhealthy targets)

Secrets:
├─ Database credentials
├─ API keys (Amadeus, Stripe, PayPal, etc.)
└─ Encryption keys (JWT, NDPR)
```

---

## 💾 Database Information

**Connection String Format**:
```
mysql://admin:PASSWORD@RDS_ENDPOINT:3306/traveease_production
```

**Retrieve from Secrets Manager**:
```bash
aws secretsmanager get-secret-value \
  --secret-id "traveease/db/credentials" \
  --query SecretString --output text | jq
```

**Common Commands**:
```bash
# Show databases
mysql -h $RDS -u admin -p -e "SHOW DATABASES;"

# Show migrations
mysql -h $RDS -u admin -p -D traveease_production -e "SELECT * FROM migrations;"

# Check connections
mysql -h $RDS -u admin -p -e "SHOW PROCESSLIST;"

# Backup
mysqldump -h $RDS -u admin -p traveease_production > backup.sql

# Restore
mysql -h $RDS -u admin -p traveease_production < backup.sql
```

---

## 🔐 Security Quick Checks

```bash
# 1. Verify VPC isolation
aws ec2 describe-security-groups --filter Name=group-name,Values=traveease-*-sg

# 2. Check IAM permissions
aws iam get-role --role-name traveease-production-ecs-task-execution-role

# 3. Verify encryption
aws rds describe-db-clusters \
  --db-cluster-identifier traveease-production-db-cluster \
  --query 'DBClusters[0].StorageEncrypted'

# 4. List secrets
aws secretsmanager list-secrets --filters Key=name,Values=traveease

# 5. Check ALB HTTPS
aws elbv2 describe-listeners --load-balancer-arn <alb-arn> \
  --query 'Listeners[?Protocol==`HTTPS`]'
```

---

## 📈 Performance Metrics

**Real-time Dashboard**:
```bash
# CPU Utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=production-backend \
  --statistics Average \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300

# Request Count
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=<alb-name> \
  --statistics Sum \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60
```

---

## 🛠️ Maintenance Tasks

### Daily
- Monitor CloudWatch alarms
- Check service health: `curl http://<alb-dns>/api/health`
- Review error logs

### Weekly
- Verify backups completed
- Review RDS performance metrics
- Check cost reports

### Monthly
- Update security patches
- Review and rotate credentials
- Update DNS/SSL certificates
- Audit IAM permissions

---

## 📞 Emergency Contacts

**Problem**: Services down
```bash
# 1. Check service status
aws ecs describe-services --cluster traveease-production-cluster --services production-backend production-commerce production-frontend

# 2. View recent logs
aws logs tail /ecs/production-backend --follow --since 5m

# 3. Rollback if needed
./infrastructure/aws/rollback.sh

# 4. Restart services
aws ecs update-service --cluster traveease-production-cluster --service production-backend --force-new-deployment
```

**Problem**: Database unreachable
```bash
# 1. Check RDS status
aws rds describe-db-clusters --db-cluster-identifier traveease-production-db-cluster

# 2. Test connection
mysql -h $RDS -u admin -p -e "SELECT 1"

# 3. Check security group
aws ec2 describe-security-groups --filter Name=group-name,Values=traveease-production-rds-sg
```

**Problem**: Out of disk space
```bash
# 1. Check storage
aws rds describe-db-clusters --db-cluster-identifier traveease-production-db-cluster \
  --query 'DBClusters[0].AllocatedStorage'

# 2. Scale storage
aws rds modify-db-cluster --db-cluster-identifier traveease-production-db-cluster \
  --storage-quota 200 --apply-immediately
```

---

## 🎯 Cost Estimation

```
Expected Monthly Costs:
├─ ECS Fargate (2-10 tasks)      $300-500
├─ RDS MySQL (db.t3.medium)      $150-200
├─ ALB + Data Transfer           $70-150
├─ CloudWatch/Logging            $50-100
├─ Secrets Manager               $5
└─ NAT Gateway/Other             $50-100
─────────────────────────────────────────
Total:                          ~$650-1000

Cost Optimization:
- Use Fargate Spot: 50% savings (~$150-250/month)
- Reserved Instances: 30-40% savings
- Auto-scaling: Only pay for what you use
```

---

## 📚 Documentation

- **Full Guide**: `infrastructure/aws/AWS_DEPLOYMENT_GUIDE.md`
- **Terraform**: `infrastructure/terraform/README.md`
- **CI/CD**: `.github/workflows/aws-deploy.yml`
- **Architecture**: This document
- **Task Defs**: `infrastructure/aws/task-definitions/`

---

## ✅ Pre-Flight Checklist

Before deploying to production:

- [ ] AWS Account created and configured
- [ ] IAM user with appropriate permissions
- [ ] Domain registered
- [ ] SSL certificate requested in ACM
- [ ] GitHub secrets configured
- [ ] Docker images pushed to ECR
- [ ] Database credentials generated
- [ ] API keys obtained (Amadeus, Stripe, etc.)
- [ ] Monitoring configured (CloudWatch)
- [ ] Alarms set up
- [ ] Backup strategy defined
- [ ] Rollback procedure tested
- [ ] Team trained on operations
- [ ] Runbooks documented

---

**Traveease Production Deployment**
*Enterprise Travel OS Ready for Global Deployment*

Last Updated: 2024
Version: 1.0
