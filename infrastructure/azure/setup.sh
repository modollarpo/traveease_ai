#!/bin/bash

# Traveease Azure Setup Script
# Prerequisites: Azure CLI installed and logged in

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AZURE_SUBSCRIPTION=${AZURE_SUBSCRIPTION:-}
RESOURCE_GROUP=${RESOURCE_GROUP:-traveease-production}
LOCATION=${LOCATION:-eastus}
ENVIRONMENT=${ENVIRONMENT:-production}
ACR_NAME="traveease${ENVIRONMENT}"
KEYVAULT_NAME="traveease-${ENVIRONMENT}-kv"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Traveease Azure Setup Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Location: ${LOCATION}${NC}"
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

if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install it first."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    print_error "jq not found. Please install it first."
    exit 1
fi

print_status "Azure CLI and jq are installed"

# Step 2: Check Azure login
print_step "Checking Azure login status..."

if ! az account show &> /dev/null; then
    print_error "Not logged in to Azure. Run: az login"
    exit 1
fi

CURRENT_ACCOUNT=$(az account show --query name -o tsv)
print_status "Logged in as: $CURRENT_ACCOUNT"

# Step 3: Set subscription
if [ -z "$AZURE_SUBSCRIPTION" ]; then
    AZURE_SUBSCRIPTION=$(az account show --query id -o tsv)
fi

az account set --subscription "$AZURE_SUBSCRIPTION"
print_status "Using subscription: $AZURE_SUBSCRIPTION"

# Step 4: Create resource group
print_step "Creating resource group..."

if az group exists --name "$RESOURCE_GROUP" --query value -o tsv | grep -q "true"; then
    print_warning "Resource group '$RESOURCE_GROUP' already exists"
else
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION"
    print_status "Created resource group: $RESOURCE_GROUP"
fi

# Step 5: Create Azure Container Registry
print_step "Creating Azure Container Registry..."

if az acr show --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" &>/dev/null; then
    print_warning "ACR '$ACR_NAME' already exists"
else
    az acr create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$ACR_NAME" \
        --sku Premium \
        --location "$LOCATION" \
        --admin-enabled true
    print_status "Created ACR: $ACR_NAME"
fi

# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACR_NAME" \
    --query loginServer -o tsv)

ACR_USERNAME=$(az acr credential show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACR_NAME" \
    --query username -o tsv)

ACR_PASSWORD=$(az acr credential show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACR_NAME" \
    --query "passwords[0].value" -o tsv)

print_status "ACR Login Server: $ACR_LOGIN_SERVER"

# Step 6: Create Key Vault
print_step "Creating Azure Key Vault..."

if az keyvault show --resource-group "$RESOURCE_GROUP" --name "$KEYVAULT_NAME" &>/dev/null; then
    print_warning "Key Vault '$KEYVAULT_NAME' already exists"
else
    az keyvault create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$KEYVAULT_NAME" \
        --location "$LOCATION" \
        --enable-soft-delete true \
        --retention-days 90 \
        --enable-purge-protection false
    print_status "Created Key Vault: $KEYVAULT_NAME"
fi

# Step 7: Store secrets in Key Vault
print_step "Storing secrets in Key Vault..."

# Database password
DB_PASSWORD=$(openssl rand -base64 32)
az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "db-admin-password" \
    --value "$DB_PASSWORD" 2>/dev/null || print_warning "Could not store database password"

# ACR credentials
az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "acr-username" \
    --value "$ACR_USERNAME" 2>/dev/null || print_warning "Could not store ACR username"

az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "acr-password" \
    --value "$ACR_PASSWORD" 2>/dev/null || print_warning "Could not store ACR password"

# API Keys
read -p "Enter Amadeus Client ID (or press Enter to skip): " AMADEUS_ID
if [ -n "$AMADEUS_ID" ]; then
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "amadeus-client-id" \
        --value "$AMADEUS_ID" 2>/dev/null || print_warning "Could not store Amadeus Client ID"
fi

read -p "Enter Stripe Secret Key (or press Enter to skip): " STRIPE_KEY
if [ -n "$STRIPE_KEY" ]; then
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "stripe-secret-key" \
        --value "$STRIPE_KEY" 2>/dev/null || print_warning "Could not store Stripe Secret Key"
fi

read -p "Enter PayPal Client ID (or press Enter to skip): " PAYPAL_ID
if [ -n "$PAYPAL_ID" ]; then
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "paypal-client-id" \
        --value "$PAYPAL_ID" 2>/dev/null || print_warning "Could not store PayPal Client ID"
fi

read -p "Enter PayPal Client Secret (or press Enter to skip): " PAYPAL_SECRET
if [ -n "$PAYPAL_SECRET" ]; then
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "paypal-client-secret" \
        --value "$PAYPAL_SECRET" 2>/dev/null || print_warning "Could not store PayPal Client Secret"
fi

read -p "Enter Flutterwave Secret Key (or press Enter to skip): " FLUTTERWAVE_KEY
if [ -n "$FLUTTERWAVE_KEY" ]; then
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "flutterwave-secret-key" \
        --value "$FLUTTERWAVE_KEY" 2>/dev/null || print_warning "Could not store Flutterwave Key"
fi

read -p "Enter Paystack Secret Key (or press Enter to skip): " PAYSTACK_KEY
if [ -n "$PAYSTACK_KEY" ]; then
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "paystack-secret-key" \
        --value "$PAYSTACK_KEY" 2>/dev/null || print_warning "Could not store Paystack Key"
fi

JWT_SECRET=$(openssl rand -base64 32)
az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "jwt-secret" \
    --value "$JWT_SECRET" 2>/dev/null || print_warning "Could not store JWT secret"

NDPR_ENCRYPTION_KEY=$(openssl rand -base64 32)
az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "ndpr-encryption-key" \
    --value "$NDPR_ENCRYPTION_KEY" 2>/dev/null || print_warning "Could not store NDPR encryption key"

print_status "Secrets stored in Key Vault"

# Step 8: Enable AKS preview features (if needed)
print_step "Registering required Azure providers..."

az provider register --namespace Microsoft.ContainerService 2>/dev/null || true
az provider register --namespace Microsoft.DBforMySQL 2>/dev/null || true
az provider register --namespace Microsoft.Storage 2>/dev/null || true

print_status "Azure providers registered"

# Step 9: Summary
print_step "Setup Summary"
echo ""
echo -e "${GREEN}Azure Configuration:${NC}"
echo "  Subscription: $AZURE_SUBSCRIPTION"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo ""
echo -e "${GREEN}ACR Configuration:${NC}"
echo "  Registry Name: $ACR_NAME"
echo "  Login Server: $ACR_LOGIN_SERVER"
echo "  Username: $ACR_USERNAME"
echo ""
echo -e "${GREEN}Key Vault:${NC}"
echo "  Name: $KEYVAULT_NAME"
echo "  Location: $LOCATION"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  1. Update GitHub repository secrets:"
echo "     - AZURE_SUBSCRIPTION_ID"
echo "     - AZURE_RESOURCE_GROUP"
echo "     - AZURE_ACR_LOGIN_SERVER"
echo "     - AZURE_ACR_USERNAME"
echo "     - AZURE_ACR_PASSWORD"
echo ""
echo "  2. Deploy infrastructure:"
echo "     bash ./infrastructure/azure/deploy.sh"
echo ""
echo -e "${BLUE}========================================${NC}\n"

print_status "Azure setup completed successfully!"

# Export variables for next script
export RESOURCE_GROUP
export LOCATION
export ACR_NAME
export ACR_LOGIN_SERVER
export KEYVAULT_NAME
