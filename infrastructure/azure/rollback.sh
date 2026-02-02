#!/bin/bash

################################################################################
# Traveease Azure Rollback Script
# Purpose: Safely rollback failed deployments with minimal downtime
# Usage: ./rollback.sh [deployment] [revision]
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="production"
DEFAULT_HISTORY_LIMIT=10
WAIT_TIMEOUT=600  # 10 minutes

################################################################################
# Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_help() {
    cat << EOF
Usage: $0 [OPTIONS] [DEPLOYMENT]

OPTIONS:
  -h, --help              Show this help message
  -n, --namespace NS      Target namespace (default: production)
  -r, --revision REV      Rollback to specific revision (optional)
  -a, --all              Rollback all deployments
  -d, --dry-run          Show what would be rolled back without executing
  --list                 List all deployments and their revisions
  --status               Show deployment status before rollback

EXAMPLES:
  # Rollback latest deployment
  $0 backend

  # Rollback to specific revision
  $0 backend --revision 5

  # List all revisions
  $0 backend --list

  # Dry run (show changes)
  $0 backend --dry-run

  # Rollback all deployments
  $0 --all
EOF
}

################################################################################
# Validation Functions
################################################################################

validate_namespace() {
    if ! kubectl get namespace "$1" &>/dev/null; then
        log_error "Namespace '$1' not found"
        exit 1
    fi
}

validate_deployment() {
    if ! kubectl get deployment "$1" -n "$NAMESPACE" &>/dev/null; then
        log_error "Deployment '$1' not found in namespace '$NAMESPACE'"
        exit 1
    fi
}

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl"
        exit 1
    fi
    log_success "kubectl found: $(kubectl version --client --short)"
}

check_aks_connection() {
    if ! kubectl cluster-info &>/dev/null; then
        log_error "Cannot connect to AKS cluster. Please run: az aks get-credentials"
        exit 1
    fi
    log_success "Connected to AKS cluster"
}

################################################################################
# Information Functions
################################################################################

list_deployments() {
    log_info "Deployments in namespace '$NAMESPACE':"
    kubectl get deployments -n "$NAMESPACE" -o wide
}

list_revisions() {
    local deployment=$1
    
    log_info "Revision history for deployment: $deployment"
    echo ""
    
    kubectl rollout history deployment/"$deployment" -n "$NAMESPACE"
}

show_deployment_status() {
    local deployment=$1
    
    log_info "Current status of deployment: $deployment"
    echo ""
    
    kubectl describe deployment "$deployment" -n "$NAMESPACE" | \
        grep -E "Replicas|Selector|Pod Template|Image|Args"
}

show_recent_events() {
    local deployment=$1
    
    log_info "Recent events for deployment: $deployment"
    echo ""
    
    kubectl get events -n "$NAMESPACE" \
        --field-selector involvedObject.name="$deployment" \
        --sort-by='.lastTimestamp' | tail -10
}

################################################################################
# Rollback Functions
################################################################################

perform_rollback() {
    local deployment=$1
    local revision=$2
    local dry_run=$3
    
    validate_deployment "$deployment"
    
    if [ -n "$dry_run" ]; then
        log_warning "DRY RUN - No changes will be made"
    fi
    
    # Show current status
    log_info "Current deployment status:"
    show_deployment_status "$deployment"
    echo ""
    
    # Show recent revisions
    log_info "Available revisions:"
    list_revisions "$deployment"
    echo ""
    
    # Perform rollback
    if [ -z "$revision" ]; then
        log_info "Rolling back to previous revision..."
        
        if [ -n "$dry_run" ]; then
            kubectl rollout undo deployment/"$deployment" \
                -n "$NAMESPACE" --dry-run=client
        else
            kubectl rollout undo deployment/"$deployment" -n "$NAMESPACE"
        fi
    else
        log_info "Rolling back to revision $revision..."
        
        if [ -n "$dry_run" ]; then
            kubectl rollout undo deployment/"$deployment" \
                -n "$NAMESPACE" --to-revision="$revision" --dry-run=client
        else
            kubectl rollout undo deployment/"$deployment" \
                -n "$NAMESPACE" --to-revision="$revision"
        fi
    fi
    
    if [ -z "$dry_run" ]; then
        log_success "Rollback initiated for $deployment"
    fi
}

wait_for_rollback() {
    local deployment=$1
    
    log_info "Waiting for rollback to complete (timeout: ${WAIT_TIMEOUT}s)..."
    
    if kubectl rollout status deployment/"$deployment" \
        -n "$NAMESPACE" --timeout="${WAIT_TIMEOUT}s"; then
        log_success "Rollback completed successfully"
        return 0
    else
        log_error "Rollback timeout or failed"
        return 1
    fi
}

verify_rollback() {
    local deployment=$1
    
    log_info "Verifying rollback..."
    echo ""
    
    # Check pod status
    log_info "Pod status:"
    kubectl get pods -n "$NAMESPACE" \
        -l app="$deployment" \
        -o wide
    echo ""
    
    # Check deployment status
    log_info "Deployment status:"
    kubectl get deployment "$deployment" -n "$NAMESPACE" -o wide
    echo ""
    
    # Check recent events
    show_recent_events "$deployment"
}

rollback_all_deployments() {
    local dry_run=$1
    
    log_info "Rolling back all deployments in namespace '$NAMESPACE'..."
    echo ""
    
    # Get list of deployments
    local deployments
    deployments=$(kubectl get deployments -n "$NAMESPACE" \
        -o jsonpath='{.items[*].metadata.name}')
    
    if [ -z "$deployments" ]; then
        log_error "No deployments found in namespace '$NAMESPACE'"
        return 1
    fi
    
    for deployment in $deployments; do
        log_info "Processing deployment: $deployment"
        perform_rollback "$deployment" "" "$dry_run"
        echo ""
        
        if [ -z "$dry_run" ]; then
            wait_for_rollback "$deployment"
            verify_rollback "$deployment"
        fi
        
        echo ""
    done
    
    log_success "All deployments rolled back"
}

################################################################################
# Database Rollback Functions
################################################################################

restore_database_from_backup() {
    local backup_time=$1
    local new_server_name=$2
    
    if [ -z "$backup_time" ] || [ -z "$new_server_name" ]; then
        log_error "Usage: restore_database_from_backup <backup_time> <new_server_name>"
        return 1
    fi
    
    log_warning "Database restore requires manual intervention"
    log_info "To restore from backup, use:"
    echo ""
    echo "az mysql flexible-server restore \\"
    echo "  --resource-group <RESOURCE_GROUP> \\"
    echo "  --name $new_server_name \\"
    echo "  --source-server <SOURCE_SERVER> \\"
    echo "  --restore-time $backup_time"
    echo ""
}

################################################################################
# Secret Rollback Functions
################################################################################

restore_secrets_from_vault() {
    local secret_name=$1
    
    log_info "Restoring secret from Key Vault: $secret_name"
    
    # Get secret from Key Vault
    local secret_value
    secret_value=$(az keyvault secret show \
        --vault-name "traveease-production-kv" \
        --name "$secret_name" \
        --query value -o tsv)
    
    if [ -z "$secret_value" ]; then
        log_error "Secret not found in Key Vault: $secret_name"
        return 1
    fi
    
    # Update Kubernetes secret
    kubectl create secret generic "$secret_name" \
        --from-literal=value="$secret_value" \
        -n "$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Secret restored: $secret_name"
}

################################################################################
# Monitoring & Health Check Functions
################################################################################

check_deployment_health() {
    local deployment=$1
    
    log_info "Checking health of deployment: $deployment"
    echo ""
    
    # Get deployment details
    local ready_replicas
    ready_replicas=$(kubectl get deployment "$deployment" \
        -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    
    local desired_replicas
    desired_replicas=$(kubectl get deployment "$deployment" \
        -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    
    if [ "$ready_replicas" = "$desired_replicas" ]; then
        log_success "Deployment is healthy: $ready_replicas/$desired_replicas replicas ready"
        return 0
    else
        log_error "Deployment is unhealthy: $ready_replicas/$desired_replicas replicas ready"
        return 1
    fi
}

check_pod_readiness() {
    local deployment=$1
    
    log_info "Checking pod readiness:"
    
    kubectl get pods -n "$NAMESPACE" \
        -l app="$deployment" \
        -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'
}

view_pod_logs() {
    local deployment=$1
    local num_lines=${2:-50}
    
    log_info "Last $num_lines lines of logs for deployment: $deployment"
    
    # Get first pod
    local pod
    pod=$(kubectl get pods -n "$NAMESPACE" \
        -l app="$deployment" \
        -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$pod" ]; then
        log_error "No pods found for deployment: $deployment"
        return 1
    fi
    
    kubectl logs "$pod" -n "$NAMESPACE" --tail="$num_lines"
}

################################################################################
# Main Execution
################################################################################

main() {
    local deployment=""
    local revision=""
    local dry_run=""
    local all_flag=""
    local list_flag=""
    local status_flag=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -r|--revision)
                revision="$2"
                shift 2
                ;;
            -a|--all)
                all_flag=true
                shift
                ;;
            -d|--dry-run)
                dry_run=true
                shift
                ;;
            --list)
                list_flag=true
                shift
                ;;
            --status)
                status_flag=true
                shift
                ;;
            *)
                deployment="$1"
                shift
                ;;
        esac
    done
    
    # Initial checks
    log_info "Starting Traveease Azure Rollback Script"
    check_kubectl
    check_aks_connection
    validate_namespace "$NAMESPACE"
    
    echo ""
    
    # Handle different modes
    if [ "$list_flag" = true ]; then
        if [ -z "$deployment" ]; then
            list_deployments
        else
            list_revisions "$deployment"
        fi
        exit 0
    fi
    
    if [ "$status_flag" = true ]; then
        if [ -z "$deployment" ]; then
            list_deployments
        else
            show_deployment_status "$deployment"
        fi
        exit 0
    fi
    
    if [ "$all_flag" = true ]; then
        rollback_all_deployments "$dry_run"
        exit $?
    fi
    
    if [ -z "$deployment" ]; then
        log_error "No deployment specified. Use --help for usage"
        exit 1
    fi
    
    # Single deployment rollback
    perform_rollback "$deployment" "$revision" "$dry_run"
    
    if [ -z "$dry_run" ]; then
        echo ""
        if wait_for_rollback "$deployment"; then
            echo ""
            verify_rollback "$deployment"
        else
            log_error "Rollback failed or timed out"
            exit 1
        fi
    fi
}

# Run main
main "$@"
