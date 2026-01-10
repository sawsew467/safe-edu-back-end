# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy secure directory for JWT keys (will be created at runtime if not exists)
COPY --from=builder /app/secure ./secure

# Copy served static files if exists
COPY --from=builder /app/src/served ./src/served

# Set ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

# Use dumb-init to handle signals properly
CMD ["dumb-init", "node", "dist/main.js"]
