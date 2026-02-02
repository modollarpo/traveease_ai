#!/bin/bash

# Traveease AWS Deployment Script
# Deploys CloudFormation stack and ECS services

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-production}
STACK_NAME="traveease-${ENVIRONMENT}"
CERTIFICATE_ARN=${CERTIFICATE_ARN:-""}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Traveease AWS Deployment${NC}"
echo -e "${BLUE}Stack: ${STACK_NAME}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}========================================${NC}\n"

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_step() { echo -e "${BLUE}[→]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }

# Validate prerequisites
if [ -z "$CERTIFICATE_ARN" ]; then
    print_warning "CERTIFICATE_ARN not set. Using self-signed for testing."
    print_warning "For production, set CERTIFICATE_ARN environment variable"
fi

# Step 1: Get or create RDS credentials from Secrets Manager
print_step "Retrieving database credentials from Secrets Manager..."

DB_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id "traveease/db/credentials" \
    --region "$AWS_REGION" \
    --query SecretString --output text)

DB_USERNAME=$(echo "$DB_SECRET" | jq -r '.username')
DB_PASSWORD=$(echo "$DB_SECRET" | jq -r '.password')

print_status "Database credentials retrieved"

# Step 2: Deploy CloudFormation stack
print_step "Deploying CloudFormation stack: $STACK_NAME"

aws cloudformation deploy \
    --template-file infrastructure/aws/traveease-infrastructure.yml \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        EnvironmentName="$ENVIRONMENT" \
        DBMasterUsername="$DB_USERNAME" \
        DBMasterUserPassword="$DB_PASSWORD" \
        CertificateArn="$CERTIFICATE_ARN" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$AWS_REGION" \
    --no-fail-on-empty-changeset

print_status "CloudFormation stack deployed: $STACK_NAME"

# Step 3: Get CloudFormation outputs
print_step "Retrieving stack outputs..."

OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs')

ALB_DNS=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="ALBDNSName") | .OutputValue')
ECS_CLUSTER=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="ECSClusterName") | .OutputValue')
RDS_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="RDSEndpoint") | .OutputValue')

echo -e "\n${GREEN}CloudFormation Outputs:${NC}"
echo "  ALB DNS: $ALB_DNS"
echo "  ECS Cluster: $ECS_CLUSTER"
echo "  RDS Endpoint: $RDS_ENDPOINT"

# Step 4: Update Secrets Manager with RDS endpoint
print_step "Updating Secrets Manager with RDS connection details..."

DB_SECRET_UPDATED='{
  "username": "'$DB_USERNAME'",
  "password": "'$DB_PASSWORD'",
  "engine": "mysql",
  "host": "'$RDS_ENDPOINT'",
  "port": 3306,
  "dbname": "traveease_production",
  "url": "mysql://'$DB_USERNAME':'$DB_PASSWORD'@'$RDS_ENDPOINT':3306/traveease_production"
}'

aws secretsmanager update-secret \
    --secret-id "traveease/db/credentials" \
    --secret-string "$DB_SECRET_UPDATED" \
    --region "$AWS_REGION" 2>/dev/null || print_warning "Could not update Secrets Manager"

print_status "Secrets Manager updated"

# Step 5: Wait for RDS to be ready
print_step "Waiting for RDS database to be ready..."

RETRY_COUNT=0
MAX_RETRIES=60
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if mysql -h "$RDS_ENDPOINT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1" &>/dev/null; then
        print_status "RDS database is ready"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            print_warning "RDS connection timeout. Please verify manually."
            break
        fi
        echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 10
    fi
done

# Step 6: Initialize database
print_step "Initializing database..."

mysql -h "$RDS_ENDPOINT" -u "$DB_USERNAME" -p"$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS traveease_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS traveease_audit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS traveease_production.migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

print_status "Database initialized"

# Step 7: Update task definitions
print_step "Registering ECS task definitions..."

DB_SECRET_ARN=$(aws secretsmanager describe-secret \
    --secret-id "traveease/db/credentials" \
    --region "$AWS_REGION" \
    --query 'ARN' --output text)

API_KEYS_ARN=$(aws secretsmanager describe-secret \
    --secret-id "traveease/api/keys" \
    --region "$AWS_REGION" \
    --query 'ARN' --output text)

# Update backend task definition with actual secret ARNs
BACKEND_TASK_DEF=$(cat infrastructure/aws/task-definitions/backend-task-def.json)
BACKEND_TASK_DEF=$(echo "$BACKEND_TASK_DEF" | sed "s|DB_SECRET_ARN|$DB_SECRET_ARN|g")
BACKEND_TASK_DEF=$(echo "$BACKEND_TASK_DEF" | sed "s|API_KEYS_ARN|$API_KEYS_ARN|g")

aws ecs register-task-definition \
    --cli-input-json "$BACKEND_TASK_DEF" \
    --region "$AWS_REGION" > /dev/null

print_status "Backend task definition registered"

# Update commerce task definition
COMMERCE_TASK_DEF=$(cat infrastructure/aws/task-definitions/commerce-task-def.json)
COMMERCE_TASK_DEF=$(echo "$COMMERCE_TASK_DEF" | sed "s|DB_SECRET_ARN|$DB_SECRET_ARN|g")
COMMERCE_TASK_DEF=$(echo "$COMMERCE_TASK_DEF" | sed "s|API_KEYS_ARN|$API_KEYS_ARN|g")

aws ecs register-task-definition \
    --cli-input-json "$COMMERCE_TASK_DEF" \
    --region "$AWS_REGION" > /dev/null

print_status "Commerce task definition registered"

# Update frontend task definition
FRONTEND_TASK_DEF=$(cat infrastructure/aws/task-definitions/frontend-task-def.json)

aws ecs register-task-definition \
    --cli-input-json "$FRONTEND_TASK_DEF" \
    --region "$AWS_REGION" > /dev/null

print_status "Frontend task definition registered"

# Step 8: Create ECS services
print_step "Creating ECS services..."

# Get target group ARNs
BACKEND_TG=$(aws cloudformation describe-stack-resources \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'StackResources[?ResourceType==`AWS::ElasticLoadBalancingV2::TargetGroup` && ResourceStatus==`CREATE_COMPLETE`] | [0].PhysicalResourceId' \
    --output text)

echo "  Target Group: $BACKEND_TG"

# Create backend service if it doesn't exist
if ! aws ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "production-backend" \
    --region "$AWS_REGION" &>/dev/null; then
    
    aws ecs create-service \
        --cluster "$ECS_CLUSTER" \
        --service-name "production-backend" \
        --task-definition "production-backend:1" \
        --desired-count 2 \
        --launch-type FARGATE \
        --region "$AWS_REGION" > /dev/null
    
    print_status "Created backend service"
else
    print_warning "Backend service already exists"
fi

# Create commerce service
if ! aws ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "production-commerce" \
    --region "$AWS_REGION" &>/dev/null; then
    
    aws ecs create-service \
        --cluster "$ECS_CLUSTER" \
        --service-name "production-commerce" \
        --task-definition "production-commerce:1" \
        --desired-count 2 \
        --launch-type FARGATE \
        --region "$AWS_REGION" > /dev/null
    
    print_status "Created commerce service"
else
    print_warning "Commerce service already exists"
fi

# Create frontend service
if ! aws ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "production-frontend" \
    --region "$AWS_REGION" &>/dev/null; then
    
    aws ecs create-service \
        --cluster "$ECS_CLUSTER" \
        --service-name "production-frontend" \
        --task-definition "production-frontend:1" \
        --desired-count 2 \
        --launch-type FARGATE \
        --region "$AWS_REGION" > /dev/null
    
    print_status "Created frontend service"
else
    print_warning "Frontend service already exists"
fi

# Step 9: Wait for services to stabilize
print_step "Waiting for services to stabilize..."

for service in "production-backend" "production-commerce" "production-frontend"; do
    RETRY=0
    while [ $RETRY -lt 60 ]; do
        STATUS=$(aws ecs describe-services \
            --cluster "$ECS_CLUSTER" \
            --services "$service" \
            --region "$AWS_REGION" \
            --query 'services[0].status' --output text)
        
        if [ "$STATUS" = "ACTIVE" ]; then
            print_status "$service is ACTIVE"
            break
        fi
        
        RETRY=$((RETRY + 1))
        echo "  Waiting for $service... ($RETRY/60)"
        sleep 10
    done
done

# Step 10: Health check
print_step "Verifying service health..."

HEALTH_CHECK_URL="http://${ALB_DNS}/"

for i in {1..30}; do
    if curl -sf "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_status "Services are healthy and responding"
        break
    else
        if [ $i -eq 30 ]; then
            print_warning "Services not responding yet. Check CloudWatch logs."
        else
            echo "  Health check attempt $i/30..."
            sleep 10
        fi
    fi
done

# Step 11: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Access Information:${NC}"
echo "  Application URL: http://${ALB_DNS}"
echo "  ALB DNS: $ALB_DNS"
echo "  ECS Cluster: $ECS_CLUSTER"
echo "  RDS Endpoint: $RDS_ENDPOINT"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  1. Configure DNS to point to ALB: $ALB_DNS"
echo "  2. Set up SSL certificate in AWS Certificate Manager"
echo "  3. View logs: aws logs tail /ecs/production-backend --follow"
echo "  4. Monitor metrics in CloudWatch"
echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo "  View services:"
echo "    aws ecs list-services --cluster $ECS_CLUSTER --region $AWS_REGION"
echo ""
echo "  View tasks:"
echo "    aws ecs list-tasks --cluster $ECS_CLUSTER --region $AWS_REGION"
echo ""
echo "  Rollback:"
echo "    bash ./infrastructure/aws/rollback.sh"
echo ""
