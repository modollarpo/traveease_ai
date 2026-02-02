# Traveease AWS Production Deployment Guide

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

### AWS Account Setup

1. **AWS Account**: Create an AWS account at https://aws.amazon.com
2. **IAM User**: Create an IAM user with the following permissions:
   - `cloudformation:*`
   - `ec2:*`
   - `ecs:*`
   - `rds:*`
   - `ecr:*`
   - `elasticloadbalancing:*`
   - `iam:CreateRole`, `iam:PassRole`, `iam:AttachRolePolicy`
   - `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`
   - `secretsmanager:*`

3. **Generate AWS Access Keys**: 
   - Go to IAM → Users → Your User → Security Credentials
   - Click "Create access key" and save the credentials

### Local Tools

Install the following tools on your development machine:

```bash
# macOS
brew install aws-cli jq docker mysql-client

# Ubuntu/Debian
sudo apt-get install awscli jq docker.io default-mysql-client

# Windows (using Chocolatey)
choco install awscli jq docker mysql-community
```

### Environment Setup

```bash
# Configure AWS CLI
aws configure
# Enter: AWS Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Export environment variables
export AWS_REGION=us-east-1
export ENVIRONMENT=production
export CERTIFICATE_ARN="arn:aws:acm:us-east-1:XXXXX:certificate/XXXXX" # Optional
```

### Domain & SSL Certificate

1. **Domain**: Register a domain (Route53 or external registrar)
2. **SSL Certificate**: 
   - Go to AWS Certificate Manager
   - Request a certificate for your domain (e.g., `api.traveease.com`)
   - Validate the certificate via email or DNS
   - Note the Certificate ARN

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │    Route53   │ (DNS)
                    └──────┬───────┘
                           │
                    ┌──────▼──────────┐
                    │      ALB         │ (Application Load Balancer)
                    │  Port 80 (HTTP)  │
                    │ Port 443 (HTTPS) │
                    └──────┬───────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
   │ Backend  │        │ Commerce │       │Frontend  │
   │ (Port    │        │ (Port    │       │(Port     │
   │ 8000)    │        │ 3001)    │       │ 3000)    │
   │ ECS      │        │ ECS      │       │ ECS      │
   │ Fargate  │        │ Fargate  │       │ Fargate  │
   │ 2-10     │        │ 2-10     │       │ 2-10     │
   │ Tasks    │        │ Tasks    │       │ Tasks    │
   └────┬─────┘        └────┬────┘        └────┬────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  RDS MySQL 8.0 │
                    │  db.t3.medium  │
                    │  Multi-AZ      │
                    │  Encrypted     │
                    │  100GB Storage │
                    └────────────────┘

Additional Components:
- VPC: 10.0.0.0/16
  - Public Subnets: 10.0.1/24, 10.0.2/24 (ALB, NAT Gateway)
  - Private Subnets: 10.0.10/24, 10.0.11/24 (ECS, RDS)
  
- Security Groups:
  - ALB: Ingress 80/443 from 0.0.0.0/0
  - ECS: Ingress 8000, 3001, 3000 from ALB
  - RDS: Ingress 3306 from ECS

- Monitoring:
  - CloudWatch Logs: /ecs/production-{backend,commerce,frontend}
  - CloudWatch Metrics: CPU, Memory, Network, Requests
  - Alarms: High CPU, Service failures

- Secrets:
  - RDS Credentials (Secrets Manager)
  - API Keys (Amadeus, Stripe, PayPal, etc.)
  - Encryption Keys (JWT, NDPR)
```

---

## Pre-Deployment Setup

### Step 1: Prepare Docker Images

Build and push Docker images to ECR (Elastic Container Registry):

```bash
# Authenticate Docker with AWS ECR
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend image
docker build -t production-backend:latest ./backend
docker tag production-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-backend:latest

# Build and push commerce image
docker build -t production-commerce:latest ./commerce
docker tag production-commerce:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-commerce:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-commerce:latest

# Build and push frontend image
docker build -t production-frontend:latest ./frontend
docker tag production-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-frontend:latest
```

### Step 2: Run AWS Setup Script

Execute the setup script to create ECR repositories and Secrets Manager secrets:

```bash
chmod +x ./infrastructure/aws/setup.sh
./infrastructure/aws/setup.sh
```

**What this script does:**
- ✓ Creates 3 ECR repositories (backend, commerce, frontend)
- ✓ Sets ECR lifecycle policies (keep last 10 images)
- ✓ Creates AWS Secrets Manager secrets for:
  - Database credentials (auto-generated password)
  - API keys (Amadeus, Stripe, PayPal, Flutterwave, Paystack)
  - Encryption keys (JWT, NDPR)
- ✓ Validates CloudFormation template

**Example Output:**
```
[✓] AWS CLI, jq, and Docker are installed
[✓] Created ECR repository: production-backend
[✓] Created ECR repository: production-commerce
[✓] Created ECR repository: production-frontend
[✓] ECR lifecycle policies configured
[✓] Created database credentials secret
[✓] Created API keys secret
[✓] CloudFormation template is valid

Next Steps:
1. Update GitHub repository secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_ACCOUNT_ID
   - AWS_REGION
   - SLACK_WEBHOOK (optional)

2. Deploy infrastructure:
   bash ./infrastructure/aws/deploy.sh
```

### Step 3: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `AWS_ACCESS_KEY_ID`: Your IAM user's access key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret key
   - `AWS_ACCOUNT_ID`: Your AWS Account ID
   - `AWS_REGION`: us-east-1 (or your preferred region)
   - `SLACK_WEBHOOK`: (Optional) Slack webhook for notifications

**Verification:**
```bash
# Verify AWS credentials are configured
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDACKCEVSQ6C2EXAMPLE",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/deploy-user"
# }
```

### Step 4: Prepare Domain & SSL

1. **Domain Setup**:
   - If using Route53:
     ```bash
     # Create hosted zone
     aws route53 create-hosted-zone \
       --name api.traveease.com \
       --caller-reference $(date +%s)
     ```
   - If using external registrar: Update nameservers to Route53

2. **SSL Certificate**:
   ```bash
   # Request SSL certificate
   aws acm request-certificate \
     --domain-name api.traveease.com \
     --validation-method DNS \
     --region us-east-1
   
   # Save the certificate ARN for later use
   # Example: arn:aws:acm:us-east-1:123456789012:certificate/12345678
   ```

---

## Deployment Process

### Step 1: Run Deployment Script

Execute the deployment script to provision AWS infrastructure:

```bash
chmod +x ./infrastructure/aws/deploy.sh
export CERTIFICATE_ARN="arn:aws:acm:us-east-1:123456789012:certificate/12345678"
./infrastructure/aws/deploy.sh
```

**What this script does:**
1. Retrieves database credentials from Secrets Manager
2. Deploys CloudFormation stack (VPC, RDS, ECS, ALB, security groups)
3. Waits for RDS to be ready
4. Initializes databases
5. Registers ECS task definitions
6. Creates ECS services
7. Performs health checks

**Expected Timeline:**
- CloudFormation stack: 5-10 minutes
- RDS initialization: 2-3 minutes
- ECS services launch: 3-5 minutes
- Total: ~15 minutes

**Example Output:**
```
[→] Deploying CloudFormation stack: traveease-production
[✓] CloudFormation stack deployed: traveease-production

CloudFormation Outputs:
  ALB DNS: traveease-alb-123456789.us-east-1.elb.amazonaws.com
  ECS Cluster: traveease-production-cluster
  RDS Endpoint: traveease-production-db.c9akciq32.us-east-1.rds.amazonaws.com

[✓] Database initialized
[✓] Backend task definition registered
[✓] Commerce task definition registered
[✓] Frontend task definition registered
[✓] Backend service created
[✓] Commerce service created
[✓] Frontend service created
[✓] Services are healthy and responding

========================================
Deployment Completed Successfully!
========================================

Access Information:
  Application URL: http://traveease-alb-123456789.us-east-1.elb.amazonaws.com
  ALB DNS: traveease-alb-123456789.us-east-1.elb.amazonaws.com
  ECS Cluster: traveease-production-cluster
  RDS Endpoint: traveease-production-db.c9akciq32.us-east-1.rds.amazonaws.com
```

### Step 2: Configure DNS

Point your domain to the ALB:

```bash
# Get ALB DNS name from deployment output
ALB_DNS="traveease-alb-123456789.us-east-1.elb.amazonaws.com"

# Get hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name api.traveease.com \
  --query 'HostedZones[0].Id' --output text | cut -d'/' -f3)

# Create Route53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.traveease.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
      }
    }]
  }'
```

### Step 3: Update ALB SSL Certificate

1. Go to **AWS EC2 → Load Balancers**
2. Select your ALB
3. Go to **Listeners**
4. Edit the HTTPS listener
5. Select your SSL certificate
6. Save changes

---

## Verification & Testing

### Health Check Verification

```bash
# Check ALB health
ALB_DNS="traveease-alb-123456789.us-east-1.elb.amazonaws.com"

# Test frontend
curl -I http://$ALB_DNS/
# Expected: HTTP/1.1 200 OK

# Test backend health
curl -I http://$ALB_DNS/api/health
# Expected: HTTP/1.1 200 OK

# Test commerce health
curl -I http://$ALB_DNS/payments/health
# Expected: HTTP/1.1 200 OK
```

### ECS Service Verification

```bash
# List all ECS services
aws ecs list-services \
  --cluster traveease-production-cluster \
  --region us-east-1

# Describe services
aws ecs describe-services \
  --cluster traveease-production-cluster \
  --services production-backend production-commerce production-frontend \
  --region us-east-1 \
  --query 'services[*].[serviceName,status,runningCount,desiredCount]' \
  --output table

# Expected output:
# |  serviceName         |  status  |  runningCount  |  desiredCount  |
# |  production-backend  |  ACTIVE  |       2        |       2        |
# |  production-commerce |  ACTIVE  |       2        |       2        |
# |  production-frontend |  ACTIVE  |       2        |       2        |
```

### Database Verification

```bash
# Get RDS endpoint
RDS_ENDPOINT="traveease-production-db.c9akciq32.us-east-1.rds.amazonaws.com"

# Test MySQL connection
mysql -h $RDS_ENDPOINT -u admin -p -e "SELECT 1"

# List databases
mysql -h $RDS_ENDPOINT -u admin -p -e "SHOW DATABASES;"

# Check migrations
mysql -h $RDS_ENDPOINT -u admin -p -D traveease_production -e "SELECT * FROM migrations;"
```

### Load Testing

```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://$ALB_DNS/

# Expected: Requests per second > 100
```

---

## Monitoring & Logs

### CloudWatch Logs

```bash
# View backend logs
aws logs tail /ecs/production-backend --follow --since 10m

# View commerce logs
aws logs tail /ecs/production-commerce --follow --since 10m

# View frontend logs
aws logs tail /ecs/production-frontend --follow --since 10m

# Search for errors
aws logs filter-log-events \
  --log-group-name /ecs/production-backend \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### CloudWatch Metrics

```bash
# Get CPU utilization for ECS services
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=production-backend Name=ClusterName,Value=traveease-production-cluster \
  --statistics Average \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300

# Get memory utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=production-backend Name=ClusterName,Value=traveease-production-cluster \
  --statistics Average \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300
```

### Create CloudWatch Dashboard

```bash
aws cloudwatch put-dashboard \
  --dashboard-name "Traveease-Production" \
  --dashboard-body file://infrastructure/aws/cloudwatch-dashboard.json
```

### Set Up Alarms

```bash
# High CPU Alarm for backend service
aws cloudwatch put-metric-alarm \
  --alarm-name traveease-backend-high-cpu \
  --alarm-description "Alert when backend CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=ServiceName,Value=production-backend Name=ClusterName,Value=traveease-production-cluster \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts
```

---

## Scaling & Performance

### Auto-Scaling Configuration

Auto-scaling is configured in CloudFormation with these parameters:

**Target Scaling Policy:**
- **Target CPU Utilization:** 70%
- **Scale Out (Up):** When CPU > 70% for 2 consecutive 5-minute periods
- **Scale In (Down):** When CPU < 50% for 15 consecutive 5-minute periods
- **Min Instances:** 2
- **Max Instances:** 10

### Manual Scaling

```bash
# Scale backend service to 5 tasks
aws ecs update-service \
  --cluster traveease-production-cluster \
  --service production-backend \
  --desired-count 5 \
  --region us-east-1

# Scale down to 2 tasks
aws ecs update-service \
  --cluster traveease-production-cluster \
  --service production-backend \
  --desired-count 2 \
  --region us-east-1
```

### Performance Tuning

**RDS Optimization:**
```bash
# Increase RDS instance type (if needed)
aws rds modify-db-instance \
  --db-instance-identifier traveease-production-db \
  --db-instance-class db.t3.large \
  --apply-immediately

# Enable Enhanced Monitoring
aws rds modify-db-instance \
  --db-instance-identifier traveease-production-db \
  --enable-cloudwatch-logs-exports error general slowquery \
  --apply-immediately
```

**ECS Optimization:**
- Increase task CPU/memory allocation in task definitions
- Enable Container Insights for detailed metrics
- Use Fargate Spot for non-critical tasks (50% cost savings)

---

## Backup & Disaster Recovery

### RDS Automated Backups

```bash
# Modify backup retention
aws rds modify-db-instance \
  --db-instance-identifier traveease-production-db \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier traveease-production-db \
  --db-snapshot-identifier traveease-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier traveease-production-db \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output table

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier traveease-production-db-restored \
  --db-snapshot-identifier traveease-backup-20240101 \
  --region us-east-1
```

### Application Backup

```bash
# Export RDS data to S3
aws dms create-s3-settings \
  --s3-settings '{
    "BucketName": "traveease-backups",
    "ServiceAccessRoleArn": "arn:aws:iam::123456789012:role/dms-role"
  }'
```

---

## Troubleshooting

### Common Issues

#### Issue 1: ECS Tasks Not Starting

**Symptoms:**
- Tasks stuck in PROVISIONING state
- Services not reaching desired count

**Diagnosis:**
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster traveease-production-cluster \
  --tasks <task-arn> \
  --region us-east-1

# Check CloudWatch logs
aws logs tail /ecs/production-backend --follow
```

**Solutions:**
1. Check ECR image exists and is accessible
2. Verify task role has Secrets Manager permissions
3. Check security group rules
4. Increase ECS service scale limits

#### Issue 2: RDS Connection Failures

**Symptoms:**
- Backend/Commerce services failing to connect
- `ER_HOST_NOT_KNOWN` or timeout errors

**Diagnosis:**
```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier traveease-production-db \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint]' \
  --output text

# Test connection from EC2 instance
mysql -h <RDS_ENDPOINT> -u admin -p -e "SELECT 1"
```

**Solutions:**
1. Verify RDS instance is in AVAILABLE state
2. Check security group allows ECS → RDS on port 3306
3. Verify credentials in Secrets Manager
4. Check DATABASE_URL format: `mysql://user:pass@host:3306/database`

#### Issue 3: ALB Health Checks Failing

**Symptoms:**
- Target health shows UNHEALTHY
- 502 Bad Gateway errors

**Diagnosis:**
```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region us-east-1

# Check ECS health check definition
aws ecs describe-task-definition \
  --task-definition production-backend:1 \
  --query 'taskDefinition.containerDefinitions[0].healthCheck' \
  --output json
```

**Solutions:**
1. Verify health check endpoint is responding
2. Increase health check timeout (start period)
3. Check application logs for startup errors
4. Verify port mappings are correct

#### Issue 4: High Memory Usage

**Symptoms:**
- OOMKilled (Out of Memory) task failures
- Memory utilization > 90%

**Solutions:**
```bash
# Increase task memory
aws ecs register-task-definition \
  --cli-input-json file://task-def-increased-memory.json

# Update service to use new task definition
aws ecs update-service \
  --cluster traveease-production-cluster \
  --service production-backend \
  --task-definition production-backend:2
```

### Debug Commands

```bash
# View all running tasks
aws ecs list-tasks \
  --cluster traveease-production-cluster \
  --desired-status RUNNING

# Get detailed task information
aws ecs describe-tasks \
  --cluster traveease-production-cluster \
  --tasks <task-arn> \
  --region us-east-1

# View ECS Container Agent logs
aws logs tail /aws/ecs/containerinsights/traveease-production-cluster/performance --follow

# Test security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxx \
  --query 'SecurityGroups[0].IpPermissions' \
  --output table
```

---

## Cost Optimization

### Cost Analysis

```bash
# Get AWS cost data (requires AWS Cost Explorer)
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Cost Reduction Strategies

1. **Use Fargate Spot** (50% cheaper):
   ```bash
   # Update task definition to use SPOT capacity provider
   # Suitable for non-critical tasks
   ```

2. **Right-Size RDS Instance**:
   - Start with db.t3.medium ($0.20/hour)
   - Monitor and scale based on actual load

3. **Enable S3 Intelligent-Tiering**:
   - Automatically move logs to cheaper storage

4. **Use Reserved Instances**:
   - 30-40% discount for 1-year commitment

5. **Optimize Data Transfer**:
   - Use VPC endpoints to avoid NAT charges
   - Compress CloudWatch logs

### Estimated Monthly Cost

```
ECS Fargate:     $300-500/month (2-10 tasks)
RDS MySQL:       $150-200/month (db.t3.medium)
Data Transfer:   $50-100/month
CloudWatch:      $50-100/month
Storage (EBS):   $50-100/month
────────────────────────
Total:          ~$600-1000/month
```

---

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous task definitions
bash ./infrastructure/aws/rollback.sh
```

### Rollback Entire Stack

```bash
# Rollback CloudFormation stack
aws cloudformation cancel-update-stack \
  --stack-name traveease-production \
  --region us-east-1

# Or delete and redeploy
aws cloudformation delete-stack \
  --stack-name traveease-production \
  --region us-east-1
```

---

## Maintenance Tasks

### Daily

- Monitor CloudWatch alarms
- Check ECS service health
- Review error logs

### Weekly

- Verify database backups completed
- Review cost reports
- Update security patches

### Monthly

- Review performance metrics
- Update RDS instance if needed
- Audit IAM permissions
- Review security group rules

---

## Support & Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **ECS Best Practices**: https://docs.aws.amazon.com/AmazonECS/latest/developerguide
- **RDS Best Practices**: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide
- **CloudFormation Reference**: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide

---

## Contact & Support

For issues or questions:
1. Check CloudWatch logs for error messages
2. Review AWS Console for service status
3. Contact AWS Support for infrastructure issues
4. Contact development team for application issues

---

*Last Updated: 2024*
*Traveease Production Deployment Guide v1.0*
