# -------------------------
# 1️⃣ Build Stage
# -------------------------
FROM node:20.11.1-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (build deps included)
RUN npm install 

# Copy source code
COPY . .

# Generate Prisma client for build
RUN npx prisma generate

# Build the NestJS app (output: dist/)
RUN npm run build


# -------------------------
# Production Stage
# -------------------------
FROM node:20.11.1-alpine AS production

WORKDIR /app

# Copy only package.json + node_modules first
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built code
COPY --from=builder /app/dist ./dist

# ✅ Copy Prisma schema folder
COPY --from=builder /app/prisma ./prisma

# Create uploads folder
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Run migrations + start
CMD ["npm", "run", "start:migrate:prod"]
