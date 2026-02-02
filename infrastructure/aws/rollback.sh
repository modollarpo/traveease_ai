#!/bin/bash

# Traveease AWS Rollback Script
# Reverts to previous task definitions and optionally restores database from RDS snapshot

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

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Traveease AWS Rollback Script${NC}"
echo -e "${YELLOW}Stack: ${STACK_NAME}${NC}"
echo -e "${YELLOW}Region: ${AWS_REGION}${NC}"
echo -e "${YELLOW}========================================${NC}\n"

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_step() { echo -e "${BLUE}[→]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }

# Function to get previous task definition revision
get_previous_revision() {
    local task_family=$1
    local current_revision=$(aws ecs describe-task-definition \
        --task-definition "$task_family" \
        --region "$AWS_REGION" \
        --query 'taskDefinition.revision' --output text)
    
    if [ "$current_revision" -gt 1 ]; then
        echo $((current_revision - 1))
    else
        echo "1"
    fi
}

# Step 1: Confirm rollback
echo -e "${RED}WARNING: This will rollback to previous task definitions.${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_warning "Rollback cancelled"
    exit 0
fi

# Step 2: Get ECS cluster
print_step "Getting ECS cluster information..."

ECS_CLUSTER=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
    --output text)

if [ -z "$ECS_CLUSTER" ]; then
    print_error "Could not find ECS cluster"
fi

print_status "ECS Cluster: $ECS_CLUSTER"

# Step 3: Rollback backend service
print_step "Rolling back backend service..."

BACKEND_PREV_REV=$(get_previous_revision "production-backend")
print_warning "Rolling back backend to revision: $BACKEND_PREV_REV"

aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "production-backend" \
    --task-definition "production-backend:$BACKEND_PREV_REV" \
    --region "$AWS_REGION" > /dev/null

print_status "Backend service rolled back"

# Step 4: Rollback commerce service
print_step "Rolling back commerce service..."

COMMERCE_PREV_REV=$(get_previous_revision "production-commerce")
print_warning "Rolling back commerce to revision: $COMMERCE_PREV_REV"

aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "production-commerce" \
    --task-definition "production-commerce:$COMMERCE_PREV_REV" \
    --region "$AWS_REGION" > /dev/null

print_status "Commerce service rolled back"

# Step 5: Rollback frontend service
print_step "Rolling back frontend service..."

FRONTEND_PREV_REV=$(get_previous_revision "production-frontend")
print_warning "Rolling back frontend to revision: $FRONTEND_PREV_REV"

aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "production-frontend" \
    --task-definition "production-frontend:$FRONTEND_PREV_REV" \
    --region "$AWS_REGION" > /dev/null

print_status "Frontend service rolled back"

# Step 6: Wait for services to stabilize
print_step "Waiting for services to stabilize after rollback..."

for service in "production-backend" "production-commerce" "production-frontend"; do
    RETRY=0
    while [ $RETRY -lt 30 ]; do
        RUNNING=$(aws ecs describe-services \
            --cluster "$ECS_CLUSTER" \
            --services "$service" \
            --region "$AWS_REGION" \
            --query 'services[0].runningCount' --output text)
        
        DESIRED=$(aws ecs describe-services \
            --cluster "$ECS_CLUSTER" \
            --services "$service" \
            --region "$AWS_REGION" \
            --query 'services[0].desiredCount' --output text)
        
        if [ "$RUNNING" = "$DESIRED" ]; then
            print_status "$service is running ($RUNNING/$DESIRED tasks)"
            break
        fi
        
        RETRY=$((RETRY + 1))
        echo "  Waiting for $service... ($RUNNING/$DESIRED) - Attempt $RETRY/30"
        sleep 10
    done
done

# Step 7: Database rollback (optional)
echo ""
read -p "Do you want to restore the database from RDS snapshot? (yes/no): " db_restore

if [ "$db_restore" = "yes" ]; then
    print_step "Listing available RDS snapshots..."
    
    SNAPSHOTS=$(aws rds describe-db-snapshots \
        --db-instance-identifier "traveease-${ENVIRONMENT}-db" \
        --region "$AWS_REGION" \
        --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
        --output table)
    
    echo "$SNAPSHOTS"
    
    read -p "Enter snapshot ID to restore from: " snapshot_id
    
    if [ -n "$snapshot_id" ]; then
        print_step "Restoring database from snapshot: $snapshot_id"
        
        aws rds restore-db-instance-from-db-snapshot \
            --db-instance-identifier "traveease-${ENVIRONMENT}-db-restored" \
            --db-snapshot-identifier "$snapshot_id" \
            --region "$AWS_REGION"
        
        print_warning "Database restore initiated. This may take several minutes."
        print_warning "You will need to update the RDS endpoint in Secrets Manager after restore completes."
    fi
fi

# Step 8: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Rollback Completed${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Services Rolled Back To:${NC}"
echo "  • Backend: revision $BACKEND_PREV_REV"
echo "  • Commerce: revision $COMMERCE_PREV_REV"
echo "  • Frontend: revision $FRONTEND_PREV_REV"
echo ""
echo -e "${GREEN}Monitoring Commands:${NC}"
echo "  View service status:"
echo "    aws ecs describe-services --cluster $ECS_CLUSTER --services production-backend production-commerce production-frontend --region $AWS_REGION"
echo ""
echo "  View recent logs:"
echo "    aws logs tail /ecs/production-backend --follow --since 10m"
echo ""
echo -e "${YELLOW}Note: If issues persist, consider rolling back the CloudFormation stack:${NC}"
echo "    aws cloudformation cancel-update-stack --stack-name $STACK_NAME --region $AWS_REGION"
echo ""
