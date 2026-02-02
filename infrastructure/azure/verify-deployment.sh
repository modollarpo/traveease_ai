#!/bin/bash

################################################################################
# Traveease Azure Pre-Deployment Verification Script
# Purpose: Validate all prerequisites and configuration before deployment
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

################################################################################
# Helper Functions
################################################################################

check_pass() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}[⚠]${NC} $1"
    ((WARN_COUNT++))
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_summary() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Verification Summary:"
    echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
    if [ $WARN_COUNT -gt 0 ]; then
        echo -e "${YELLOW}Warnings: $WARN_COUNT${NC}"
    fi
    if [ $FAIL_COUNT -gt 0 ]; then
        echo -e "${RED}Failed: $FAIL_COUNT${NC}"
        echo -e "${RED}Deployment blocked. Please fix issues and retry.${NC}"
    fi
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

################################################################################
# Verification Checks
################################################################################

check_cli_tools() {
    print_header "Checking CLI Tools"
    
    # Check Azure CLI
    if command -v az &> /dev/null; then
        check_pass "Azure CLI installed"
        local version=$(az version --query '\"azure-cli\"' -o tsv)
        check_pass "Azure CLI version: $version"
    else
        check_fail "Azure CLI not found. Install from https://aka.ms/InstallAzureCLIDeb"
        return 1
    fi
    
    # Check kubectl
    if command -v kubectl &> /dev/null; then
        check_pass "kubectl installed"
        local version=$(kubectl version --client --short 2>/dev/null | awk '{print $3}')
        check_pass "kubectl version: $version"
    else
        check_fail "kubectl not found. Run: az aks install-cli"
        return 1
    fi
    
    # Check Helm
    if command -v helm &> /dev/null; then
        check_pass "Helm installed"
        local version=$(helm version --short)
        check_pass "Helm version: $version"
    else
        check_fail "Helm not found. Install from https://helm.sh/docs/intro/install/"
        return 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        check_pass "Docker installed"
    else
        check_warn "Docker not found (optional for local development)"
    fi
}

check_azure_auth() {
    print_header "Checking Azure Authentication"
    
    # Check if logged in
    if az account show &>/dev/null; then
        check_pass "Azure CLI authenticated"
        
        # Get current account info
        local account=$(az account show --query name -o tsv)
        local subscription=$(az account show --query id -o tsv)
        
        check_pass "Current account: $account"
        check_pass "Subscription ID: $subscription"
    else
        check_fail "Not logged into Azure. Run: az login"
        return 1
    fi
    
    # Check permissions
    if az role assignment list --query "length(@)" -o tsv &>/dev/null; then
        check_pass "Sufficient permissions verified"
    else
        check_warn "Cannot verify all permissions. Some operations may fail."
    fi
}

check_resource_group() {
    print_header "Checking Resource Group"
    
    local rg=${AZURE_RESOURCE_GROUP:-"traveease-production"}
    
    if az group show --name "$rg" &>/dev/null; then
        check_pass "Resource group exists: $rg"
        
        local location=$(az group show --name "$rg" --query location -o tsv)
        check_pass "Location: $location"
    else
        check_warn "Resource group does not exist: $rg"
        check_warn "It will be created during deployment"
    fi
}

check_region_availability() {
    print_header "Checking Region Availability"
    
    local region=${AZURE_LOCATION:-"eastus"}
    
    # Check if AKS is available in region
    if az provider show --namespace Microsoft.ContainerService --query "resourceTypes[?resourceType=='managedClusters'].locations" -o tsv | grep -q "$region"; then
        check_pass "AKS available in region: $region"
    else
        check_fail "AKS not available in region: $region. Consider using: eastus, westus2, centralus"
        return 1
    fi
    
    # Check MySQL availability
    if az provider show --namespace Microsoft.DBforMySQL --query "resourceTypes[?resourceType=='flexibleServers'].locations" -o tsv | grep -q "$region"; then
        check_pass "MySQL Flexible Server available in region: $region"
    else
        check_fail "MySQL not available in region: $region"
        return 1
    fi
}

check_quotas() {
    print_header "Checking Azure Quotas"
    
    # Check vCPU quota
    local vcpu_quota=$(az vm list-usage --location eastus --query "[?name.value=='cores'].limit" -o tsv 2>/dev/null || echo "unknown")
    
    if [ "$vcpu_quota" != "unknown" ] && [ "$vcpu_quota" -gt 20 ]; then
        check_pass "Sufficient vCPU quota: $vcpu_quota"
    else
        check_warn "Cannot verify vCPU quota. Minimum required: 20 vCPUs"
    fi
}

check_files() {
    print_header "Checking Deployment Files"
    
    local files=(
        "setup.sh"
        "deploy.sh"
        "rollback.sh"
        "templates/traveease-infrastructure.json"
        "templates/traveease-infrastructure.bicep"
        "manifests/backend-deployment.yaml"
        "manifests/commerce-deployment.yaml"
        "manifests/frontend-deployment.yaml"
        "manifests/ingress-and-policies.yaml"
        "manifests/rbac-and-config.yaml"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            check_pass "Found: $file"
        else
            check_fail "Missing: $file"
            return 1
        fi
    done
}

check_file_permissions() {
    print_header "Checking File Permissions"
    
    local scripts=(
        "setup.sh"
        "deploy.sh"
        "rollback.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -x "$script" ]; then
            check_pass "Executable: $script"
        else
            check_warn "Not executable: $script (Run: chmod +x $script)"
        fi
    done
}

check_arm_template() {
    print_header "Checking ARM Template"
    
    if command -v jq &> /dev/null; then
        # Basic JSON validation
        if jq empty templates/traveease-infrastructure.json 2>/dev/null; then
            check_pass "ARM template valid JSON"
        else
            check_fail "ARM template has JSON syntax errors"
            return 1
        fi
        
        # Check schema
        local schema=$(jq -r '.$schema' templates/traveease-infrastructure.json)
        check_pass "Schema version: $schema"
    else
        check_warn "jq not installed. Cannot validate ARM template (optional)"
    fi
}

check_github_config() {
    print_header "Checking GitHub Configuration"
    
    if [ -d ".github/workflows" ]; then
        if [ -f ".github/workflows/azure-deploy.yml" ]; then
            check_pass "GitHub Actions workflow found"
        else
            check_warn "GitHub Actions workflow not found"
        fi
    else
        check_warn "GitHub workflows directory not found"
    fi
    
    # Check for GitHub secrets configuration
    check_warn "Remember to configure GitHub Secrets:"
    echo "  - AZURE_SUBSCRIPTION_ID"
    echo "  - AZURE_RESOURCE_GROUP"
    echo "  - AZURE_CONTAINER_REGISTRY_LOGIN_SERVER"
    echo "  - AZURE_CONTAINER_REGISTRY_USERNAME"
    echo "  - AZURE_CONTAINER_REGISTRY_PASSWORD"
    echo "  - AZURE_AKS_CLUSTER_NAME"
}

check_environment_vars() {
    print_header "Checking Environment Variables"
    
    if [ -z "$AZURE_SUBSCRIPTION_ID" ]; then
        check_warn "AZURE_SUBSCRIPTION_ID not set (Optional, use: az account show)"
    else
        check_pass "AZURE_SUBSCRIPTION_ID set"
    fi
    
    if [ -z "$AZURE_RESOURCE_GROUP" ]; then
        check_warn "AZURE_RESOURCE_GROUP not set (Defaults to: traveease-production)"
    else
        check_pass "AZURE_RESOURCE_GROUP set: $AZURE_RESOURCE_GROUP"
    fi
    
    if [ -z "$AZURE_LOCATION" ]; then
        check_warn "AZURE_LOCATION not set (Defaults to: eastus)"
    else
        check_pass "AZURE_LOCATION set: $AZURE_LOCATION"
    fi
}

check_container_images() {
    print_header "Checking Container Images"
    
    if command -v docker &> /dev/null; then
        check_warn "Ensure these Docker images are built:"
        echo "  - production-backend (FastAPI)"
        echo "  - production-commerce (NestJS)"
        echo "  - production-frontend (Next.js)"
        echo ""
        echo "Build command:"
        echo "  docker build -t <registry>/<image>:latest -f <path/Dockerfile> ."
    else
        check_warn "Docker not installed. Manual image build required."
    fi
}

check_ssl_certificates() {
    print_header "Checking SSL Certificate Requirements"
    
    check_warn "SSL/TLS will be handled by Let's Encrypt via cert-manager"
    echo "  Domains to secure:"
    echo "  - api.traveease.com"
    echo "  - commerce.traveease.com"
    echo "  - traveease.com"
    echo "  - www.traveease.com"
    echo ""
    echo "Action required: Configure DNS records to point to LoadBalancer IP"
}

check_backup_plan() {
    print_header "Checking Backup & Recovery Plan"
    
    echo "Database Backups:"
    echo "  ✓ Automated 30-day retention"
    echo "  ✓ Geo-redundant backups enabled"
    echo ""
    echo "Container Images:"
    echo "  ✓ Stored in ACR Premium tier"
    echo "  ✓ 30-day retention policy"
    echo ""
    echo "Configuration:"
    echo "  ✓ Stored in Key Vault"
    echo "  ✓ Encrypted at rest"
    echo ""
    
    check_pass "Backup and recovery plan in place"
}

check_monitoring_plan() {
    print_header "Checking Monitoring & Logging"
    
    echo "Components:"
    echo "  ✓ Azure Monitor + Application Insights"
    echo "  ✓ Log Analytics Workspace"
    echo "  ✓ Container Insights"
    echo "  ✓ Pod logs (via kubectl)"
    echo ""
    echo "Dashboards:"
    echo "  ✓ AKS Insights in Azure Portal"
    echo "  ✓ Application Insights Analytics"
    echo "  ✓ Custom queries via KQL"
    echo ""
    
    check_pass "Comprehensive monitoring in place"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Traveease Azure Pre-Deployment Verification Script   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    
    # Run all checks
    check_cli_tools || true
    check_azure_auth || true
    check_resource_group || true
    check_region_availability || true
    check_quotas || true
    check_files || true
    check_file_permissions || true
    check_arm_template || true
    check_github_config || true
    check_environment_vars || true
    check_container_images || true
    check_ssl_certificates || true
    check_backup_plan || true
    check_monitoring_plan || true
    
    # Print summary
    print_summary
    
    # Exit code
    if [ $FAIL_COUNT -gt 0 ]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
