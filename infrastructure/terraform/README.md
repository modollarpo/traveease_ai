# Terraform Infrastructure as Code for Traveease

## Overview

This directory contains Terraform configuration files for deploying Traveease on AWS. Terraform provides Infrastructure as Code (IaC) benefits including version control, reproducibility, and collaboration.

## Directory Structure

```
terraform/
├── main.tf              # Core infrastructure resources
├── variables.tf         # Input variables with validation
├── outputs.tf           # Output values for deployment
├── versions.tf          # Terraform and provider versions
└── README.md            # This file
```

## Files Description

### main.tf
Defines all AWS resources:
- **VPC & Networking**: VPC, subnets, internet gateway, NAT gateway, route tables
- **Security Groups**: ALB, ECS, and RDS security groups with least-privilege rules
- **RDS Cluster**: MySQL database with multi-AZ failover, encryption, backups
- **Application Load Balancer**: HTTPS listener with path-based routing
- **ECS Cluster**: Container orchestration with Fargate launch type
- **CloudWatch**: Log groups and monitoring alarms
- **IAM Roles**: Task execution and task roles for ECS

### variables.tf
Configurable input variables:
- `aws_region`: AWS region (default: us-east-1)
- `environment`: Environment name (production, staging, development)
- `vpc_cidr`: VPC CIDR block
- `db_instance_class`: RDS instance type
- `certificate_arn`: SSL certificate ARN from ACM
- And many more...

### outputs.tf
Exports important values:
- VPC ID, subnet IDs
- RDS endpoint and connection strings
- ALB DNS name and target group ARNs
- ECS cluster information
- CloudWatch log group names
- Deployment instructions

### versions.tf
Specifies Terraform and provider requirements:
- Terraform version >= 1.0
- AWS provider version ~> 5.0

## Prerequisites

1. **Terraform CLI**
   ```bash
   # macOS
   brew install terraform
   
   # Ubuntu/Debian
   curl https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
   sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
   sudo apt-get update && sudo apt-get install terraform
   
   # Windows
   choco install terraform
   ```

2. **AWS CLI & Credentials**
   ```bash
   # Configure AWS credentials
   aws configure
   ```

3. **AWS Certificate (for HTTPS)**
   - Create SSL certificate in AWS Certificate Manager
   - Note the certificate ARN

## Quick Start

### 1. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

This downloads the AWS provider and initializes the working directory.

### 2. Review Configuration

```bash
# View what will be created
terraform plan
```

### 3. Apply Configuration

```bash
# Create resources in AWS
terraform apply

# When prompted, type "yes" to confirm
```

**Expected Output:**
```
Apply complete! Resources: 45 added, 0 changed, 0 destroyed.

Outputs:

alb_dns_name = "traveease-alb-123456789.us-east-1.elb.amazonaws.com"
ecs_cluster_name = "traveease-production-cluster"
rds_cluster_endpoint = "traveease-production-db.cluster-c9akciq.us-east-1.rds.amazonaws.com"
```

### 4. Configure Application

```bash
# Get database credentials and connection string
terraform output rds_connection_string
terraform output alb_dns_name
```

### 5. Deploy Docker Containers

See [AWS_DEPLOYMENT_GUIDE.md](../aws/AWS_DEPLOYMENT_GUIDE.md) for container deployment steps.

## Variable Customization

### Example: Staging Environment

Create `terraform.tfvars`:

```hcl
environment              = "staging"
ecs_desired_count        = 1
ecs_min_capacity         = 1
ecs_max_capacity         = 3
db_instance_class        = "db.t3.small"
db_backup_retention_days = 7
log_retention_days       = 7
```

Apply with custom variables:

```bash
terraform apply -var-file="terraform.tfvars"
```

### Example: High-Availability Production

```hcl
environment              = "production"
ecs_desired_count        = 5
ecs_min_capacity         = 3
ecs_max_capacity         = 20
db_instance_count        = 3
db_instance_class        = "db.r6g.xlarge"
db_backup_retention_days = 30
```

## Common Commands

```bash
# Initialize working directory
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Show current state
terraform show

# Show resource details
terraform show aws_rds_cluster.main

# Output specific value
terraform output alb_dns_name

# Refresh state (sync with AWS)
terraform refresh

# Plan for destruction
terraform plan -destroy

# Destroy all resources
terraform destroy

# Destroy specific resource
terraform destroy -target aws_rds_cluster.main
```

## State Management

### Local State (Development)

By default, Terraform stores state locally:
- Location: `terraform.tfstate`
- **Warning**: Do NOT commit to git (add to `.gitignore`)

### Remote State (Production)

Store state in S3 for team collaboration:

```hcl
# In versions.tf, uncomment and update:
terraform {
  backend "s3" {
    bucket         = "traveease-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

Create S3 bucket and DynamoDB table:

```bash
# Create S3 bucket
aws s3api create-bucket \
  --bucket traveease-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket traveease-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locks
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

Then reinitialize Terraform:

```bash
terraform init
# When prompted, type "yes" to migrate existing state
```

## Monitoring & Debugging

### Check Current State

```bash
# List all resources
terraform state list

# Show specific resource
terraform state show aws_ecs_cluster.main

# Show outputs
terraform output
```

### Debug Logs

```bash
# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=/tmp/terraform-debug.log

terraform apply

# View logs
cat /tmp/terraform-debug.log
```

### AWS Resource Status

```bash
# Check RDS status
aws rds describe-db-clusters \
  --filter Name=db-cluster-id,Values=traveease-production-db-cluster \
  --region us-east-1

# Check ECS cluster
aws ecs describe-clusters \
  --clusters traveease-production-cluster \
  --region us-east-1

# Check ALB
aws elbv2 describe-load-balancers \
  --region us-east-1 | grep -i traveease
```

## Updating Infrastructure

### Add New Resource

1. Add resource definition to `main.tf`
2. Add output to `outputs.tf` if necessary
3. Review changes:
   ```bash
   terraform plan
   ```
4. Apply:
   ```bash
   terraform apply
   ```

### Modify Existing Resource

```bash
# Update variables
vim terraform.tfvars

# Review changes
terraform plan -var-file="terraform.tfvars"

# Apply updates
terraform apply -var-file="terraform.tfvars"
```

### Update Provider Version

```bash
# Check for updates
terraform version

# Update AWS provider
terraform init -upgrade
```

## Disaster Recovery

### Backup State

```bash
# Manual backup
cp terraform.tfstate terraform.tfstate.backup

# Or use S3 versioning (recommended)
```

### Recover from State Corruption

```bash
# Refresh state from AWS
terraform refresh

# Or pull from S3 backup
aws s3 cp s3://terraform-state-backup/terraform.tfstate .
terraform apply
```

### Destroy and Recreate

```bash
# Plan destruction
terraform plan -destroy

# Destroy all resources
terraform destroy

# Reinitialize and reapply
terraform init
terraform apply
```

## Cost Estimation

```bash
# Estimate costs (requires tfcost plugin)
terraform plan -json | tfcost

# Or manually:
# - ECS Fargate: $0.04704/hour per task
# - RDS db.t3.medium: $0.20/hour
# - ALB: $22.32/month + $0.006/hour
# - Data transfer: $0.02/GB (varies)
```

## Troubleshooting

### Error: InvalidCertificateException

**Problem**: Certificate ARN not valid or certificate not verified

**Solution**:
```bash
# Verify certificate exists
aws acm list-certificates --region us-east-1

# Use correct ARN format
certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/12345678"
```

### Error: User is not authorized

**Problem**: IAM user lacks required permissions

**Solution**: Add to user policy:
```json
{
  "Effect": "Allow",
  "Action": [
    "ec2:*",
    "rds:*",
    "ecs:*",
    "elasticloadbalancing:*",
    "iam:CreateRole",
    "iam:PassRole",
    "logs:*",
    "kms:*"
  ],
  "Resource": "*"
}
```

### Error: Terraform version conflict

**Problem**: Local Terraform version doesn't match requirements

**Solution**:
```bash
# Check version
terraform version

# Update Terraform
terraform init -upgrade

# Or specify version in versions.tf
terraform = "~> 1.5"
```

### RDS Connection Timeout

**Problem**: Cannot connect to RDS after creation

**Solution**:
```bash
# Wait for RDS to be ready (5-10 minutes)
aws rds describe-db-clusters \
  --db-cluster-identifier traveease-production-db-cluster \
  --query 'DBClusters[0].Status' \
  --region us-east-1

# Should show: "available"
```

## Best Practices

1. **Version Control**
   - Commit `main.tf`, `variables.tf`, `outputs.tf`
   - Add `terraform.tfstate*` to `.gitignore`
   - Store sensitive values separately

2. **Code Organization**
   - Use meaningful resource names
   - Add descriptions to variables
   - Use consistent formatting (`terraform fmt`)

3. **Security**
   - Store state in encrypted S3
   - Use IAM roles, not access keys
   - Enable encryption for RDS
   - Restrict security group rules

4. **Automation**
   - Integrate with CI/CD (GitHub Actions)
   - Use `terraform plan` in PR checks
   - Auto-apply on main branch

5. **Monitoring**
   - Enable CloudWatch logs
   - Set up alarms for critical metrics
   - Review terraform.log for issues

## Migration from CloudFormation

If using existing CloudFormation stack:

```bash
# Import existing resources
terraform import aws_vpc.main vpc-12345678

terraform import aws_rds_cluster.main traveease-production-db-cluster

# Then update main.tf to match imported resources
```

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices.html)
- [AWS Architecture Reference](https://docs.aws.amazon.com/architecture/)

## Support

For issues:
1. Run `terraform validate` to check syntax
2. Enable debug logs: `export TF_LOG=DEBUG`
3. Check AWS Console for resource status
4. Review [AWS Terraform Provider documentation](https://registry.terraform.io/providers/hashicorp/aws/latest)

---

**Version**: 1.0
**Last Updated**: 2024
**Maintained by**: Traveease DevOps Team
