#!/bin/bash
# Traveease Workspace Setup Script
# This script sets up the development environment with all required configurations
# Usage: bash setup-workspace.sh

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js v20+"
    exit 1
fi
print_success "Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
fi
print_success "npm $(npm -v)"

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 not found. Please install Python 3.9+"
    exit 1
fi
print_success "Python $(python3 --version)"

# Check git
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git"
    exit 1
fi
print_success "Git $(git --version | cut -d' ' -f3)"

# Create .env files
print_header "Setting Up Environment Variables"

# Root .env
if [ ! -f .env ]; then
    print_warning "Creating root .env file"
    cp .env.example .env
    print_warning "⚠️  Please fill in the following in .env:"
    print_warning "   - STRIPE_SECRET_KEY"
    print_warning "   - PAYPAL_CLIENT_ID"
    print_warning "   - PAYPAL_CLIENT_SECRET"
    print_warning "   - FLUTTERWAVE_SECRET_KEY"
    print_warning "   - PAYSTACK_SECRET_KEY"
    print_warning "   - AMADEUS_API_KEY"
    print_warning "   - AMADEUS_API_SECRET"
else
    print_success ".env exists"
fi

# Commerce .env
if [ ! -f commerce/.env ]; then
    print_warning "Creating commerce/.env file"
    cp commerce/.env.example commerce/.env
    print_warning "⚠️  Please fill in the payment gateway keys in commerce/.env"
else
    print_success "commerce/.env exists"
fi

# Frontend setup
print_header "Setting Up Frontend (Next.js)"

cd frontend

if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies (this may take a few minutes)..."
    npm install --legacy-peer-deps
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

# Check for .next build
if [ ! -d ".next" ]; then
    print_warning "Building Next.js application..."
    npm run build
    print_success "Next.js build complete"
else
    print_success "Next.js build artifacts exist"
fi

cd ..

# Commerce setup
print_header "Setting Up Commerce Service (NestJS)"

cd commerce

if [ ! -d "node_modules" ]; then
    print_warning "Installing commerce dependencies..."
    npm install --legacy-peer-deps
    print_success "Commerce dependencies installed"
else
    print_success "Commerce dependencies already installed"
fi

# Check Prisma Client
if [ ! -d "node_modules/@prisma" ]; then
    print_warning "Generating Prisma Client..."
    npx prisma generate
    print_success "Prisma Client generated"
else
    print_success "Prisma Client exists"
fi

cd ..

# Backend setup
print_header "Setting Up Backend (FastAPI)"

cd backend

# Check for virtual environment
if [ ! -d ".venv" ] && [ ! -d "venv" ]; then
    print_warning "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
    print_warning "Activate with: source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)"
else
    print_success "Python virtual environment exists"
fi

# Install dependencies if venv exists
if [ -d "venv" ] || [ -d ".venv" ]; then
    ENV_ACTIVATE="venv/bin/activate"
    [ -f ".venv/bin/activate" ] && ENV_ACTIVATE=".venv/bin/activate"
    
    if [ -f "$ENV_ACTIVATE" ]; then
        print_warning "Installing Python dependencies..."
        source "$ENV_ACTIVATE"
        pip install --upgrade pip
        pip install -r requirements.txt
        print_success "Python dependencies installed"
    fi
fi

cd ..

# Docker setup validation
print_header "Validating Docker Setup"

if command -v docker &> /dev/null; then
    print_success "Docker is installed"
    if docker compose version &> /dev/null; then
        print_success "Docker Compose is installed"
        print_warning "To start services, run: docker compose up -d"
    else
        print_warning "Docker Compose not found or not compatible"
    fi
else
    print_warning "Docker not found (optional for local development)"
fi

# Final validation
print_header "Environment Setup Complete"

print_success "Frontend dependencies: ✓"
print_success "Commerce dependencies: ✓"
print_success "Backend dependencies: ✓"

echo ""
print_warning "Next Steps:"
echo "1. Fill in API keys in .env file"
echo "2. Fill in payment gateway keys in commerce/.env"
echo "3. Ensure MySQL is running (via Docker or local)"
echo "4. Run: npm run dev (frontend)"
echo "5. Run: npm run start:dev (commerce)"
echo "6. Run: python3 -m uvicorn backend.main:app --reload (backend)"
echo ""
print_success "Setup complete! Ready for development."
