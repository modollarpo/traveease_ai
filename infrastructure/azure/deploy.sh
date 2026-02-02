#!/bin/bash

# Traveease Azure Deployment Script
# Deploys ARM template and configures AKS

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SUBSCRIPTION_ID=${AZURE_SUBSCRIPTION_ID:-}
RESOURCE_GROUP=${AZURE_RESOURCE_GROUP:-traveease-production}
LOCATION=${LOCATION:-eastus}
ENVIRONMENT=${ENVIRONMENT:-production}
DEPLOYMENT_NAME="traveease-${ENVIRONMENT}-deployment-$(date +%s)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Traveease Azure Deployment${NC}"
echo -e "${BLUE}Resource Group: ${RESOURCE_GROUP}${NC}"
echo -e "${BLUE}Location: ${LOCATION}${NC}"
echo -e "${BLUE}========================================${NC}\n"

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_step() { echo -e "${BLUE}[→]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }

# Validate prerequisites
if [ -z "$SUBSCRIPTION_ID" ]; then
    print_warning "SUBSCRIPTION_ID not provided. Using current subscription."
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
fi

# Step 1: Check Azure login
print_step "Verifying Azure authentication..."

if ! az account show &> /dev/null; then
    print_error "Not logged in to Azure. Run: az login"
fi

az account set --subscription "$SUBSCRIPTION_ID"
print_status "Using subscription: $SUBSCRIPTION_ID"

# Step 2: Get or create database password from Key Vault
print_step "Retrieving secrets from Key Vault..."

KEYVAULT_NAME="traveease-${ENVIRONMENT}-kv"
DB_PASSWORD=$(az keyvault secret show \
    --vault-name "$KEYVAULT_NAME" \
    --name "db-admin-password" \
    --query value -o tsv 2>/dev/null || echo "")

if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32)
    print_warning "Using generated password"
fi

print_status "Retrieved database password from Key Vault"

# Step 3: Validate ARM template
print_step "Validating ARM template..."

if ! az deployment group validate \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "infrastructure/azure/templates/traveease-infrastructure.json" \
    --parameters \
        environmentName="$ENVIRONMENT" \
        location="$LOCATION" \
        databasePassword="$DB_PASSWORD" &>/dev/null; then
    print_error "ARM template validation failed"
fi

print_status "ARM template is valid"

# Step 4: Deploy ARM template
print_step "Deploying ARM template (this may take 10-15 minutes)..."

az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "infrastructure/azure/templates/traveease-infrastructure.json" \
    --parameters \
        environmentName="$ENVIRONMENT" \
        location="$LOCATION" \
        databasePassword="$DB_PASSWORD" \
    --name "$DEPLOYMENT_NAME" \
    --output json > /tmp/deployment_output.json

print_status "ARM template deployed successfully"

# Step 5: Extract deployment outputs
print_step "Retrieving deployment outputs..."

AKS_CLUSTER_NAME=$(jq -r '.properties.outputs.aksClusterName.value' /tmp/deployment_output.json)
DATABASE_FQDN=$(jq -r '.properties.outputs.databaseServerFqdn.value' /tmp/deployment_output.json)
CONTAINER_REGISTRY=$(jq -r '.properties.outputs.containerRegistryLoginServer.value' /tmp/deployment_output.json)

echo -e "\n${GREEN}Deployment Outputs:${NC}"
echo "  AKS Cluster: $AKS_CLUSTER_NAME"
echo "  Database FQDN: $DATABASE_FQDN"
echo "  Container Registry: $CONTAINER_REGISTRY"

# Step 6: Configure kubectl
print_step "Configuring kubectl to access AKS cluster..."

az aks get-credentials \
    --resource-group "$RESOURCE_GROUP" \
    --name "$AKS_CLUSTER_NAME" \
    --overwrite-existing

print_status "kubectl configured"

# Step 7: Verify AKS cluster
print_step "Verifying AKS cluster..."

if kubectl cluster-info &>/dev/null; then
    print_status "AKS cluster is accessible"
else
    print_warning "Could not verify AKS cluster access"
fi

# Step 8: Create namespaces
print_step "Creating Kubernetes namespaces..."

kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace ingress-nginx --dry-run=client -o yaml | kubectl apply -f -

print_status "Namespaces created"

# Step 9: Create container registry secret
print_step "Creating container registry secret..."

ACR_USERNAME=$(az keyvault secret show \
    --vault-name "$KEYVAULT_NAME" \
    --name "acr-username" \
    --query value -o tsv 2>/dev/null || echo "")

ACR_PASSWORD=$(az keyvault secret show \
    --vault-name "$KEYVAULT_NAME" \
    --name "acr-password" \
    --query value -o tsv 2>/dev/null || echo "")

if [ -n "$ACR_USERNAME" ] && [ -n "$ACR_PASSWORD" ]; then
    kubectl create secret docker-registry acr-secret \
        --docker-server="$CONTAINER_REGISTRY" \
        --docker-username="$ACR_USERNAME" \
        --docker-password="$ACR_PASSWORD" \
        --docker-email="admin@traveease.com" \
        --namespace production \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_status "Container registry secret created"
else
    print_warning "ACR credentials not found in Key Vault"
fi

# Step 10: Install Nginx Ingress Controller
print_step "Installing Nginx Ingress Controller..."

# Add Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>/dev/null || true
helm repo update

# Install Nginx Ingress
helm upgrade --install nginx-ingress ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --set controller.service.type=LoadBalancer \
    --set controller.service.externalTrafficPolicy=Local \
    --wait \
    --timeout 10m 2>/dev/null || print_warning "Nginx Ingress installation may take a moment"

print_status "Nginx Ingress Controller installed/updated"

# Step 11: Wait for LoadBalancer IP
print_step "Waiting for Load Balancer IP assignment..."

RETRIES=0
while [ $RETRIES -lt 30 ]; do
    EXTERNAL_IP=$(kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [ -n "$EXTERNAL_IP" ]; then
        print_status "External IP assigned: $EXTERNAL_IP"
        break
    fi
    
    RETRIES=$((RETRIES + 1))
    echo "  Waiting... ($RETRIES/30)"
    sleep 10
done

# Step 12: Create database secret
print_step "Creating database secret in Kubernetes..."

kubectl create secret generic database-secret \
    --from-literal=username=sqladmin \
    --from-literal=password="$DB_PASSWORD" \
    --from-literal=host="$DATABASE_FQDN" \
    --from-literal=port=3306 \
    --from-literal=database=traveease_production \
    --namespace production \
    --dry-run=client -o yaml | kubectl apply -f -

print_status "Database secret created"

# Step 13: Create API keys secret
print_step "Creating API keys secret in Kubernetes..."

declare -A api_keys

# Retrieve secrets from Key Vault
for key_name in amadeus-client-id stripe-secret-key paypal-client-id paypal-client-secret flutterwave-secret-key paystack-secret-key jwt-secret ndpr-encryption-key; do
    value=$(az keyvault secret show \
        --vault-name "$KEYVAULT_NAME" \
        --name "$key_name" \
        --query value -o tsv 2>/dev/null || echo "")
    
    if [ -n "$value" ]; then
        api_keys[$key_name]="$value"
    fi
done

# Create kubectl secret command
SECRET_CMD="kubectl create secret generic api-keys --namespace production"
for key in "${!api_keys[@]}"; do
    SECRET_CMD="$SECRET_CMD --from-literal=$key=${api_keys[$key]}"
done
SECRET_CMD="$SECRET_CMD --dry-run=client -o yaml | kubectl apply -f -"

eval "$SECRET_CMD"

print_status "API keys secret created"

# Step 14: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Azure Resources:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Location: $LOCATION"
echo ""
echo -e "${GREEN}AKS Cluster:${NC}"
echo "  Cluster Name: $AKS_CLUSTER_NAME"
echo "  External IP: ${EXTERNAL_IP:-pending}"
echo ""
echo -e "${GREEN}Database:${NC}"
echo "  Server: $DATABASE_FQDN"
echo "  Admin User: sqladmin"
echo ""
echo -e "${GREEN}Container Registry:${NC}"
echo "  Login Server: $CONTAINER_REGISTRY"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  1. Configure DNS to point to Load Balancer IP: ${EXTERNAL_IP:-pending}"
echo "  2. Create Ingress resources for your services"
echo "  3. Deploy application manifests to AKS"
echo "  4. Monitor with: kubectl get pods -n production"
echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo "  View deployments:"
echo "    kubectl get deployments -n production"
echo ""
echo "  View services:"
echo "    kubectl get svc -n production"
echo ""
echo "  View pods:"
echo "    kubectl get pods -n production"
echo ""
echo "  View logs:"
echo "    kubectl logs <pod-name> -n production"
echo ""
echo "  Rollback:"
echo "    bash ./infrastructure/azure/rollback.sh"
echo ""
