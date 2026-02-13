# ---------- Build Stage ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency manifests first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code and config files
COPY . .

# Build Next.js app
RUN npm run build -- --no-lint
# RUN npm run build

# ---------- Runtime Stage ----------
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy build from builder stage
COPY --from=builder /app ./

# Expose port Next.js will run on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
