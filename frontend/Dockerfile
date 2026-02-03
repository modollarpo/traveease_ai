# Traveease Frontend - Next.js
# Multi-stage build: dependencies → build → production

FROM node:20-alpine as deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .

# Build Next.js with all optimization
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine as runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1000 traveease && adduser -D -u 1000 -G traveease traveease

# Copy only what's needed from builder
COPY --from=builder --chown=traveease:traveease /app/public ./public
COPY --from=builder --chown=traveease:traveease /app/.next/standalone ./
COPY --from=builder --chown=traveease:traveease /app/.next/static ./.next/static

USER traveease

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start Next.js in standalone mode
CMD ["node", "server.js"]
