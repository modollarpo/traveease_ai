#!/bin/bash

# Traveease AWS Setup Script
# Prerequisites: AWS CLI configured, jq installed, proper IAM permissions

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ENVIRONMENT=${ENVIRONMENT:-production}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
REPO_NAMES=("production-backend" "production-commerce" "production-frontend")

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Traveease AWS Setup Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}AWS Account: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status messages
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[→]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found. Please install it first."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    print_error "jq not found. Please install it first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install it first."
    exit 1
fi

print_status "AWS CLI, jq, and Docker are installed"

# Step 2: Create ECR repositories
print_step "Creating ECR repositories..."

for repo_name in "${REPO_NAMES[@]}"; do
    if aws ecr describe-repositories --repository-names "$repo_name" --region "$AWS_REGION" &>/dev/null; then
        print_warning "ECR repository '$repo_name' already exists"
    else
        aws ecr create-repository \
            --repository-name "$repo_name" \
            --region "$AWS_REGION" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES \
            --image-tag-mutability MUTABLE
        print_status "Created ECR repository: $repo_name"
    fi
done

# Step 3: Create lifecycle policy for ECR repositories (keep last 10 images)
print_step "Setting ECR image retention policies..."

ECR_POLICY='{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Expire untagged images after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}'

for repo_name in "${REPO_NAMES[@]}"; do
    aws ecr put-lifecycle-policy \
        --repository-name "$repo_name" \
        --lifecycle-policy-text "$ECR_POLICY" \
        --region "$AWS_REGION" 2>/dev/null || print_warning "Could not update lifecycle policy for $repo_name"
done

print_status "ECR lifecycle policies configured"

# Step 4: Create Secrets Manager secrets
print_step "Setting up AWS Secrets Manager..."

# Database secret
DB_SECRET="traveease/db/credentials"
if aws secretsmanager describe-secret --secret-id "$DB_SECRET" --region "$AWS_REGION" &>/dev/null; then
    print_warning "Database secret already exists: $DB_SECRET"
else
    DB_CREDS='{
      "username": "admin",
      "password": "'$(openssl rand -base64 32)'",
      "engine": "mysql",
      "host": "localhost",
      "port": 3306,
      "dbname": "traveease_production"
    }'
    
    aws secretsmanager create-secret \
        --name "$DB_SECRET" \
        --secret-string "$DB_CREDS" \
        --region "$AWS_REGION" \
        --description "Traveease Production Database Credentials"
    print_status "Created database credentials secret"
fi

# API Keys secret
API_KEYS_SECRET="traveease/api/keys"
if aws secretsmanager describe-secret --secret-id "$API_KEYS_SECRET" --region "$AWS_REGION" &>/dev/null; then
    print_warning "API Keys secret already exists: $API_KEYS_SECRET"
else
    read -p "Enter Amadeus Client ID (or press Enter to skip): " AMADEUS_ID
    read -p "Enter Amadeus Client Secret (or press Enter to skip): " AMADEUS_SECRET
    read -p "Enter Stripe Secret Key (or press Enter to skip): " STRIPE_KEY
    read -p "Enter PayPal Client ID (or press Enter to skip): " PAYPAL_ID
    read -p "Enter PayPal Client Secret (or press Enter to skip): " PAYPAL_SECRET
    read -p "Enter Flutterwave Secret Key (or press Enter to skip): " FLUTTERWAVE_KEY
    read -p "Enter Paystack Secret Key (or press Enter to skip): " PAYSTACK_KEY
    
    API_KEYS='{
      "amadeus_client_id": "'$AMADEUS_ID'",
      "amadeus_client_secret": "'$AMADEUS_SECRET'",
      "stripe_secret_key": "'$STRIPE_KEY'",
      "paypal_client_id": "'$PAYPAL_ID'",
      "paypal_client_secret": "'$PAYPAL_SECRET'",
      "flutterwave_secret_key": "'$FLUTTERWAVE_KEY'",
      "paystack_secret_key": "'$PAYSTACK_KEY'",
      "jwt_secret": "'$(openssl rand -base64 32)'",
      "ndpr_encryption_key": "'$(openssl rand -base64 32)'"
    }'
    
    aws secretsmanager create-secret \
        --name "$API_KEYS_SECRET" \
        --secret-string "$API_KEYS" \
        --region "$AWS_REGION" \
        --description "Traveease API Keys and Secrets"
    print_status "Created API keys secret"
fi

# Step 5: Validate CloudFormation template
print_step "Validating CloudFormation template..."

if aws cloudformation validate-template \
    --template-body file://infrastructure/aws/traveease-infrastructure.yml \
    --region "$AWS_REGION" &>/dev/null; then
    print_status "CloudFormation template is valid"
else
    print_error "CloudFormation template validation failed"
    exit 1
fi

# Step 6: Summary
print_step "Setup Summary"
echo ""
echo -e "${GREEN}Environment Configuration:${NC}"
echo "  AWS Region: $AWS_REGION"
echo "  AWS Account: $AWS_ACCOUNT_ID"
echo "  ECR Registry: $ECR_REGISTRY"
echo "  Environment: $ENVIRONMENT"
echo ""
echo -e "${GREEN}ECR Repositories Created:${NC}"
for repo_name in "${REPO_NAMES[@]}"; do
    echo "  • $ECR_REGISTRY/$repo_name"
done
echo ""
echo -e "${GREEN}Secrets Configured:${NC}"
echo "  • $DB_SECRET"
echo "  • $API_KEYS_SECRET"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  1. Update GitHub repository secrets:"
echo "     - AWS_ACCESS_KEY_ID"
echo "     - AWS_SECRET_ACCESS_KEY"
echo "     - AWS_ACCOUNT_ID"
echo "     - AWS_REGION"
echo "     - SLACK_WEBHOOK (optional)"
echo ""
echo "  2. Deploy infrastructure:"
echo "     bash ./infrastructure/aws/deploy.sh"
echo ""
echo -e "${BLUE}========================================${NC}\n"

print_status "AWS setup completed successfully!"
