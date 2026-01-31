# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install dependencies only when needed
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the Next.js application
# output: "standalone" in next.config.ts makes this optimized
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN adduser -D -s /bin/sh nextjs && \
    chown -R nextjs:nextjs /app

USER nextjs

# Copy only the necessary files from builder
# Standalone output includes everything needed to run
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

EXPOSE 3000

# Use standalone server (optimized by Next.js)
CMD ["node", "server.js"]