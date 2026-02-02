# Traveease Production Deployment Guide

## Overview
This guide covers deployment of the complete Traveease platform (Next.js frontend, FastAPI backend, NestJS commerce) using Docker Compose, with CI/CD via GitHub Actions, monitoring with Prometheus/Grafana, and NDPR compliance.

---

## Prerequisites

### System Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- 8GB RAM (minimum)
- 20GB disk space (for volumes)
- Ubuntu 20.04+ or macOS 10.15+ or Windows 10+

### Access Requirements
- GitHub repository access
- Docker Hub account (for custom images)
- GitHub Container Registry (ghcr.io) access
- Domain for SSL/TLS (for production)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/TRAVEEASE_AI.git
cd TRAVEEASE_AI
```

### 2. Create Environment Files

#### `.env` (Root Directory)
```bash
# Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_USER=traveease_user
MYSQL_PASSWORD=your_secure_db_password
MYSQL_DATABASE=traveease_commerce

# Payment Gateways
STRIPE_SECRET_KEY=sk_REDACTED_STRIPE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_KEY
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_SECRET
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE_YOUR_KEY
PAYSTACK_SECRET_KEY=sk_REDACTED_PAYSTACK_KEY

# Travel APIs
AMADEUS_API_KEY=YOUR_AMADEUS_API_KEY
AMADEUS_API_SECRET=YOUR_AMADEUS_API_SECRET
VIATOR_API_KEY=YOUR_VIATOR_API_KEY
TREEPZ_API_KEY=YOUR_TREEPZ_API_KEY
TRAVU_API_KEY=YOUR_TRAVU_API_KEY

# Security
NDPR_ENCRYPTION_KEY=your_256_bit_encryption_key
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Monitoring
PROMETHEUS_RETENTION_DAYS=15
GRAFANA_ADMIN_PASSWORD=secure_admin_password

# Domain
DOMAIN=your-domain.com
```

#### `backend/.env`
```bash
AMADEUS_API_KEY=${AMADEUS_API_KEY}
AMADEUS_API_SECRET=${AMADEUS_API_SECRET}
VIATOR_API_KEY=${VIATOR_API_KEY}
TREEPZ_API_KEY=${TREEPZ_API_KEY}
TRAVU_API_KEY=${TRAVU_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
FLUTTERWAVE_SECRET_KEY=${FLUTTERWAVE_SECRET_KEY}
PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
LOG_LEVEL=INFO
NDPR_ENCRYPTION_KEY=${NDPR_ENCRYPTION_KEY}
```

#### `commerce/.env`
```bash
NODE_ENV=production
DATABASE_URL=mysql://traveease_user:${MYSQL_PASSWORD}@mysql:3306/traveease_commerce
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
FLUTTERWAVE_SECRET_KEY=${FLUTTERWAVE_SECRET_KEY}
PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
NDPR_ENCRYPTION_KEY=${NDPR_ENCRYPTION_KEY}
```

#### `frontend/.env.local`
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_AGENTIC_URL=https://agentic.your-domain.com
NEXT_PUBLIC_COMMERCE_URL=https://commerce.your-domain.com
```

---

## Database Migration

### 1. Initialize Database Schema
```bash
# Run Prisma migrations
docker-compose exec commerce npx prisma migrate deploy

# Generate Prisma Client
docker-compose exec commerce npx prisma generate

# (Optional) Seed initial data
docker-compose exec commerce npx prisma db seed
```

### 2. Verify Database
```bash
# Connect to MySQL
docker-compose exec mysql mysql -u traveease_user -p traveease_commerce

# Check tables
SHOW TABLES;
DESCRIBE transactions;
DESCRIBE split_payments;
```

---

## Deployment Steps

### 1. Build Docker Images
```bash
# Build all services
docker-compose build --no-cache

# Or build individual services
docker-compose build backend
docker-compose build commerce
docker-compose build frontend
```

### 2. Start Services
```bash
# Development with logs
docker-compose up

# Production in background
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f commerce
docker-compose logs -f frontend
```

### 3. Health Checks
```bash
# Check service status
docker-compose ps

# Test backend health
curl http://localhost:8000/health

# Test commerce health
curl http://localhost:3001/health

# Test frontend
curl http://localhost:3000
```

### 4. Run Database Migrations
```bash
docker-compose exec commerce npx prisma migrate deploy
```

---

## GitHub Actions CI/CD

### 1. Configure Secrets
Add these to GitHub repository secrets (`Settings > Secrets > New repository secret`):

```
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
SNYK_TOKEN=your_snyk_token
GHCR_TOKEN=your_github_container_registry_token
DATABASE_URL=mysql://user:pass@host:3306/db
```

### 2. Deploy Triggers
CI/CD pipelines trigger on:
- Push to `main` or `develop` branches
- Pull requests
- Changes to specific directories (`frontend/**`, `backend/**`, `commerce/**`)

### 3. Workflow Files
- `.github/workflows/frontend.yml` - Next.js linting, testing, building
- `.github/workflows/backend.yml` - Python testing, security scanning
- `.github/workflows/commerce.yml` - NestJS testing, Prisma migrations

---

## Monitoring & Alerts

### 1. Access Monitoring Dashboards
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (default user: admin/admin)

### 2. Configure Alert Channels
In Grafana:
1. Settings > Notification channels > New channel
2. Choose: Email, Slack, PagerDuty, or Webhook
3. Configure contact information

### 3. Import Dashboards
```bash
# JSON dashboard files available in ./monitoring/dashboards/
# Import manually via Grafana UI or use provisioning
```

### 4. Key Metrics to Monitor
- Backend response time (target: <500ms)
- Payment processing time (target: <5s)
- Circuit breaker state (target: closed)
- Database connection pool (target: <80% utilization)
- Error rate (target: <1%)

---

## NDPR Compliance

### 1. PII Data Masking
All sensitive data automatically masked in logs:
- Passport numbers: `XX****567`
- Credit cards: `4242 **** **** 4242`
- Emails: `j***@example.com`
- Phone numbers: `+1-555-***-4567`

### 2. Compliance Audit Logs
Located in: `./backend/logs/compliance_audit.log`

Events logged:
- Data access
- Data modifications
- Payment processing
- Visa applications
- Bookings
- Security alerts

### 3. Data Encryption
- In-transit: TLS 1.2+ (handled by reverse proxy)
- At-rest: Database encryption via `NDPR_ENCRYPTION_KEY`
- Logs: Sensitive data masked before logging

---

## Scaling & Performance

### 1. Horizontal Scaling (Docker Swarm/Kubernetes)
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Load balance with Nginx (configure separately)
```

### 2. Caching Strategy
- Redis: Session storage, rate limiting
- HTTP caching: Frontend static assets (CDN via Cloudflare)
- Database query cache: Via Prisma caching

### 3. Performance Targets
- Page load time: <2s (frontend)
- API response: <500ms (backend)
- Payment processing: <5s (commerce)
- Database queries: <100ms (99th percentile)

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MySQL container
docker-compose logs mysql

# Verify connection
docker-compose exec mysql mysql -u root -p -e "SELECT 1"

# Reset database (WARNING: destructive)
docker-compose down -v
docker-compose up
```

#### 2. Payment Gateway Errors
```bash
# Check credentials in .env
docker-compose exec commerce printenv | grep -i stripe

# Test Stripe connection
curl -u YOUR_STRIPE_SECRET_KEY: https://api.stripe.com/v1/balance
```

#### 3. High Memory Usage
```bash
# Check memory consumption
docker stats

# Reduce Prometheus retention
# Edit docker-compose.yml, update Prometheus command:
# - '--storage.tsdb.retention.time=7d'

docker-compose up -d prometheus
```

#### 4. Slow API Responses
```bash
# Check backend logs
docker-compose logs backend | grep "ERROR\|WARNING"

# Monitor circuit breaker state
curl http://localhost:9090/api/v1/query?query=circuit_breaker_state
```

---

## Backup & Disaster Recovery

### 1. Database Backup
```bash
# Manual backup
docker-compose exec mysql mysqldump -u root -p traveease_commerce > backup_$(date +%Y%m%d).sql

# Automated backup (add to cron)
0 2 * * * /path/to/backup-script.sh
```

### 2. Restore from Backup
```bash
# Restore database
docker-compose exec -T mysql mysql -u root -p < backup_20260201.sql
```

### 3. Volume Backups
```bash
# Backup volumes
docker run --rm -v traveease_ai_mysql_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup.tar.gz /data

# Restore volumes
docker run --rm -v traveease_ai_mysql_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_backup.tar.gz
```

---

## Security Hardening

### 1. Firewall Rules
```bash
# Allow only necessary ports
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 80/tcp   # HTTP (redirect only)
sudo ufw allow 22/tcp   # SSH (restrict to known IPs)
```

### 2. SSL/TLS Certificates
```bash
# Generate with Let's Encrypt (via Certbot)
sudo certbot certonly --standalone -d your-domain.com

# Mount certificates in docker-compose.yml
volumes:
  - /etc/letsencrypt/live/your-domain.com:/certs
```

### 3. Secrets Rotation
```bash
# Update secrets in .env
# Re-deploy services
docker-compose up -d --force-recreate
```

### 4. API Rate Limiting
Configured in NestJS and FastAPI:
- Global: 100 req/min
- Payment endpoints: 10 req/min per user
- Authentication: 5 req/min per IP

---

## Production Deployment (Cloud)

### AWS ECS Deployment
```bash
# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag traveease_backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/traveease:backend-latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/traveease:backend-latest

# Deploy via ECS task definition (provide separate CloudFormation/Terraform config)
```

### Google Cloud Run
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/traveease-backend ./backend

# Deploy
gcloud run deploy traveease-backend \
  --image gcr.io/PROJECT_ID/traveease-backend \
  --platform managed \
  --region us-central1
```

---

## Rollback Procedure

### 1. Revert to Previous Version
```bash
# Check deployment history
git log --oneline

# Revert to previous commit
git revert COMMIT_HASH
git push

# CI/CD automatically deploys previous version
```

### 2. Manual Rollback
```bash
# Stop current services
docker-compose down

# Checkout previous version
git checkout PREVIOUS_VERSION

# Rebuild and restart
docker-compose up -d
```

---

## Support & Documentation

- **API Documentation**: http://localhost:8000/docs (Swagger)
- **Monitoring Dashboards**: http://localhost:3002 (Grafana)
- **Logs**: `./logs/` and `docker-compose logs`
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@traveease.com

---

## Appendix: Useful Commands

```bash
# View all services
docker-compose ps

# View service logs
docker-compose logs -f SERVICE_NAME

# Execute command in service
docker-compose exec SERVICE_NAME COMMAND

# Rebuild specific service
docker-compose build --no-cache SERVICE_NAME

# Stop all services
docker-compose stop

# Remove all services and volumes
docker-compose down -v

# Prune unused Docker resources
docker system prune -a --volumes

# Check network connectivity
docker-compose exec backend ping commerce

# Monitor resource usage
docker stats

# View service environment variables
docker-compose exec SERVICE_NAME env
```
