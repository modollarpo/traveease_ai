# Traveease Security Policy

## Overview
This document outlines the security measures, policies, and best practices for the Traveease platform.

---

## 1. API Security Headers

### Content Security Policy (CSP)
Prevents XSS attacks by restricting the sources from which content can be loaded.

```typescript
// commerce/src/main.ts (NestJS)
import helmet from '@nestjs/helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    scriptSrc: ["'self'", "https://cdn.stripe.com", "https://js.paypal.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: ["'self'", 
      "https://api.stripe.com",
      "https://api.paypal.com",
      "https://api.amadeus.com",
      "https://api.flutterwave.com"
    ],
    frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
  },
}));
```

### HSTS (HTTP Strict-Transport-Security)
Forces HTTPS-only connections for 1 year.

```typescript
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true,
}));
```

### X-Frame-Options
Prevents clickjacking attacks.

```typescript
app.use(helmet.frameguard({
  action: 'deny', // Block in iframe
}));
```

### X-Content-Type-Options
Prevents MIME type sniffing.

```typescript
app.use(helmet.noSniff());
```

### X-XSS-Protection
Legacy XSS protection (modern browsers ignore this).

```typescript
app.use(helmet.xssFilter());
```

### Referrer-Policy
Controls referrer information.

```typescript
app.use(helmet.referrerPolicy({
  policy: 'strict-origin-when-cross-origin',
}));
```

### Full Helmet Configuration
```typescript
// commerce/src/main.ts
import helmet from '@nestjs/helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply all helmet security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://cdn.stripe.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.paypal.com"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  await app.listen(3001);
}

bootstrap();
```

---

## 2. CORS Configuration

### Development (localhost)
```typescript
// commerce/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 3600,
});
```

### Staging
```typescript
app.enableCors({
  origin: [
    'https://staging.traveease.com',
    'https://api-staging.traveease.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 3600,
});
```

### Production
```typescript
app.enableCors({
  origin: [
    'https://traveease.com',
    'https://www.traveease.com',
    'https://app.traveease.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200,
});
```

### CORS Best Practices
✅ **DO:**
- Whitelist specific domains only
- Use HTTPS in production
- Set `credentials: true` only when needed
- Limit `allowedHeaders` to necessary ones
- Use `maxAge` for preflight caching

❌ **DON'T:**
- Allow `origin: '*'` in production
- Set `allowedMethods: '*'`
- Expose sensitive headers
- Cache preflight responses too long

---

## 3. Authentication & Authorization

### JWT Bearer Tokens
All API endpoints require Bearer tokens:

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  https://api.traveease.com/api/v1/bookings
```

### Token Structure
```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1707000000,
  "exp": 1707086400,
  "aud": "https://api.traveease.com"
}
```

### Role-Based Access Control (RBAC)
```typescript
// commerce/src/guards/roles.guard.ts
import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private rolesService: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    
    const requiredRole = Reflect.getMetadata('role', context.getHandler());
    if (!requiredRole) return true; // No role requirement
    
    if (!user.roles.includes(requiredRole)) {
      throw new ForbiddenException(`Role ${requiredRole} required`);
    }
    
    return true;
  }
}
```

### Usage
```typescript
@Controller('bookings')
export class BookingsController {
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @SetMetadata('role', 'USER')
  getBookings(@Request() req) {
    return this.bookingsService.findByUser(req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @SetMetadata('role', 'ADMIN')
  deleteBooking(@Param('id') id: string) {
    return this.bookingsService.delete(id);
  }
}
```

---

## 4. Data Protection & Privacy

### GDPR Compliance
- ✅ PII is masked in logs (see [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md))
- ✅ Data encryption at rest (TLS 1.3)
- ✅ Data encryption in transit (HTTPS)
- ✅ Right to deletion implemented
- ✅ Data export functionality available

### PII Masking in Logs
```typescript
// commerce/src/common/logger.middleware.ts
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const maskedBody = this.maskPII(req.body);
    console.log(`[${req.method}] ${req.path}`, maskedBody);
    next();
  }

  private maskPII(data: any): any {
    const patterns = {
      email: /[\w\.-]+@[\w\.-]+\.\w+/g,
      phone: /\+?[\d\s\-\(\)]{10,}/g,
      creditCard: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
      passport: /[A-Z]{1,2}\d{6,9}/g,
    };

    let masked = JSON.stringify(data);
    for (const [key, pattern] of Object.entries(patterns)) {
      masked = masked.replace(pattern, `[${key.toUpperCase()}]`);
    }
    return JSON.parse(masked);
  }
}
```

### Sensitive Data Fields
```typescript
// Exclude from serialization
class User {
  id: string;
  email: string;
  
  @Exclude()
  passwordHash: string;
  
  @Exclude()
  twoFactorSecret: string;
}
```

---

## 5. Rate Limiting

### API Rate Limits
```typescript
// commerce/src/guards/rate-limit.guard.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,      // 1 minute
        limit: 100,      // 100 requests per minute
      },
      {
        ttl: 3600000,    // 1 hour
        limit: 10000,    // 10,000 requests per hour
      },
    ]),
  ],
})
export class AppModule {}
```

### Per-Endpoint Limits
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 per 15 mins
  login(@Body() credentials) {
    // Login logic
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  register(@Body() userData) {
    // Registration logic
  }
}
```

---

## 6. Input Validation & Sanitization

### DTO Validation
```typescript
// commerce/src/dtos/create-booking.dto.ts
import { IsEmail, IsNotEmpty, IsUUID, Min, Max } from 'class-validator';

export class CreateBookingDTO {
  @IsUUID()
  @IsNotEmpty()
  flightOfferId: string;

  @IsEmail()
  @IsNotEmpty()
  passengerEmail: string;

  @Min(0)
  @Max(999999)
  amount: number;
}
```

### Request Validation Pipe
```typescript
@Controller('bookings')
export class BookingsController {
  @Post()
  createBooking(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createBookingDTO: CreateBookingDTO
  ) {
    return this.bookingsService.create(createBookingDTO);
  }
}
```

---

## 7. SQL Injection Prevention

### Parameterized Queries (Prisma)
✅ **SAFE** - Prisma auto-escapes:
```typescript
const booking = await prisma.flightBooking.findUnique({
  where: { id: bookingId }, // Automatically parameterized
});
```

❌ **UNSAFE** - Raw queries (avoid):
```typescript
// DO NOT USE
const booking = await prisma.$queryRaw(`
  SELECT * FROM FlightBooking WHERE id = '${bookingId}'
`);
```

✅ **SAFE** - Raw queries with parameters:
```typescript
const booking = await prisma.$queryRaw`
  SELECT * FROM FlightBooking WHERE id = ${bookingId}
`;
```

---

## 8. Dependency Vulnerabilities

### Weekly Scans
- Trivy (container images)
- pip-audit (Python)
- npm audit (Node)
- OWASP Dependency Check

Run manually:
```bash
# Python
pip-audit

# Node
npm audit

# Container
trivy image traveease-backend:latest
```

### Automatic Updates
```bash
# Python
pip install --upgrade pip
pip install -U -r backend/requirements.txt

# Node
npm update
npm audit fix
```

---

## 9. Secrets Management

### Environment Variables (Never Commit)
```bash
# ✅ DO: Use .env.example template
DATABASE_URL=mysql://user:pass@localhost:3306/db
STRIPE_API_KEY=sk_test_...
JWT_SECRET=your-secret-key

# ❌ DON'T: Commit actual secrets
```

### Vault Integration (Production)
```typescript
// commerce/src/config/vault.service.ts
import * as vault from 'node-vault';

export class VaultService {
  private vaultClient: vault.client;

  constructor() {
    this.vaultClient = vault({
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN,
    });
  }

  async getSecret(path: string): Promise<any> {
    const secret = await this.vaultClient.read(path);
    return secret.data.data;
  }
}
```

---

## 10. Incident Response

### Report Security Issues
**DO NOT** open public GitHub issues for vulnerabilities.

Email: `security@traveease.com`

### Disclosure Timeline
1. **Day 0:** Vulnerability reported
2. **Day 1:** Triage and assessment
3. **Day 3:** Security patch release
4. **Day 5:** Disclosure (coordinated)

---

## Compliance Checklist

- [ ] All endpoints use HTTPS (TLS 1.3+)
- [ ] JWT tokens expire after 1 hour
- [ ] Rate limits enforced (100 req/min per user)
- [ ] PII masked in all logs
- [ ] CORS whitelist configured
- [ ] Security headers deployed
- [ ] Dependencies scanned weekly
- [ ] Secrets never committed to git
- [ ] Database backups encrypted
- [ ] Audit logs retained for 2 years

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Helmet.js](https://helmetjs.github.io/)
- [GDPR Compliance](https://gdpr-info.eu/)
- [PCI DSS](https://www.pcisecuritystandards.org/)

---

**Last Updated:** February 3, 2026
**Policy Version:** 3.0
**Next Review:** May 3, 2026
