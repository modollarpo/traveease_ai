# Traveease Workspace Setup Script (Windows PowerShell)
# This script sets up the development environment with all required configurations
# Usage: .\setup-workspace.ps1

# Enable error handling
$ErrorActionPreference = "Stop"

# Color helper functions
function Write-Header {
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host $args[0] -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
}

function Write-Success {
    Write-Host "✓ $($args[0])" -ForegroundColor Green
}

function Write-Warning {
    Write-Host "⚠ $($args[0])" -ForegroundColor Yellow
}

function Write-Error {
    Write-Host "✗ $($args[0])" -ForegroundColor Red
}

# Check prerequisites
Write-Header "Checking Prerequisites"

$missing = @()

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Success "Node.js $nodeVersion"
} else {
    $missing += "Node.js v20+"
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm -v
    Write-Success "npm $npmVersion"
} else {
    $missing += "npm"
}

# Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Success "Python $pythonVersion"
} else {
    $missing += "Python 3.9+"
}

# Check Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Success "$gitVersion"
} else {
    $missing += "Git"
}

if ($missing.Count -gt 0) {
    Write-Error "Missing prerequisites:"
    $missing | ForEach-Object { Write-Error "  - $_" }
    exit 1
}

# Create .env files
Write-Header "Setting Up Environment Variables"

# Root .env
if (-not (Test-Path ".env")) {
    Write-Warning "Creating root .env file"
    Copy-Item ".env.example" ".env"
    Write-Warning "⚠️  Please fill in the following in .env:"
    Write-Warning "   - STRIPE_SECRET_KEY"
    Write-Warning "   - PAYPAL_CLIENT_ID"
    Write-Warning "   - PAYPAL_CLIENT_SECRET"
    Write-Warning "   - FLUTTERWAVE_SECRET_KEY"
    Write-Warning "   - PAYSTACK_SECRET_KEY"
    Write-Warning "   - AMADEUS_API_KEY"
    Write-Warning "   - AMADEUS_API_SECRET"
} else {
    Write-Success ".env exists"
}

# Commerce .env
if (-not (Test-Path "commerce\.env")) {
    Write-Warning "Creating commerce\.env file"
    Copy-Item "commerce\.env.example" "commerce\.env"
    Write-Warning "⚠️  Please fill in the payment gateway keys in commerce\.env"
} else {
    Write-Success "commerce\.env exists"
}

# Frontend setup
Write-Header "Setting Up Frontend (Next.js)"

Push-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Warning "Installing frontend dependencies (this may take a few minutes)..."
    npm install --legacy-peer-deps
    Write-Success "Frontend dependencies installed"
} else {
    Write-Success "Frontend dependencies already installed"
}

# Check for .next build
if (-not (Test-Path ".next")) {
    Write-Warning "Building Next.js application..."
    npm run build
    Write-Success "Next.js build complete"
} else {
    Write-Success "Next.js build artifacts exist"
}

Pop-Location

# Commerce setup
Write-Header "Setting Up Commerce Service (NestJS)"

Push-Location commerce

if (-not (Test-Path "node_modules")) {
    Write-Warning "Installing commerce dependencies..."
    npm install --legacy-peer-deps
    Write-Success "Commerce dependencies installed"
} else {
    Write-Success "Commerce dependencies already installed"
}

# Check Prisma Client
if (-not (Test-Path "node_modules\@prisma")) {
    Write-Warning "Generating Prisma Client..."
    npx prisma generate
    Write-Success "Prisma Client generated"
} else {
    Write-Success "Prisma Client exists"
}

Pop-Location

# Backend setup
Write-Header "Setting Up Backend (FastAPI)"

Push-Location backend

# Check for virtual environment
if (-not (Test-Path "venv") -and -not (Test-Path ".venv")) {
    Write-Warning "Creating Python virtual environment..."
    python -m venv venv
    Write-Success "Virtual environment created"
    Write-Warning "Activate with: venv\Scripts\activate"
} else {
    Write-Success "Python virtual environment exists"
}

# Install dependencies
$activateScript = if (Test-Path "venv\Scripts\activate.ps1") { "venv\Scripts\activate.ps1" } else { ".venv\Scripts\activate.ps1" }

if (Test-Path $activateScript) {
    Write-Warning "Installing Python dependencies..."
    & $activateScript
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    Write-Success "Python dependencies installed"
    deactivate
}

Pop-Location

# Docker setup validation
Write-Header "Validating Docker Setup"

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Success "Docker is installed"
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        Write-Success "Docker Compose is installed"
        Write-Warning "To start services, run: docker-compose up -d"
    } else {
        Write-Warning "Docker Compose not found or not compatible"
    }
} else {
    Write-Warning "Docker not found (optional for local development)"
}

# Final validation
Write-Header "Environment Setup Complete"

Write-Success "Frontend dependencies: ✓"
Write-Success "Commerce dependencies: ✓"
Write-Success "Backend dependencies: ✓"

Write-Host ""
Write-Warning "Next Steps:"
Write-Host "1. Fill in API keys in .env file"
Write-Host "2. Fill in payment gateway keys in commerce\.env"
Write-Host "3. Ensure MySQL is running (via Docker or local)"
Write-Host "4. Run: npm run dev (frontend)"
Write-Host "5. Run: npm run start:dev (commerce)"
Write-Host "6. Run: python -m uvicorn backend.main:app --reload (backend)"
Write-Host ""
Write-Success "Setup complete! Ready for development."
