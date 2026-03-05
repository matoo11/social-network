# ---------- Build Stage ----------
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /app

# Install git and build tools needed for CGO
RUN apk add --no-cache git gcc musl-dev

# Copy go modules first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go binary with CGO enabled (needed for go-sqlite3)
RUN GOOS=linux CGO_ENABLED=1 go build -o app

# ---------- Runtime Stage ----------
FROM alpine:latest

# Set working directory
WORKDIR /app

# Install certificates (needed for HTTPS requests)
RUN apk add --no-cache ca-certificates

# Create logs and database directories, make DB writable
RUN mkdir -p backend/pkg/logs backend/pkg/db && chmod -R 777 backend/pkg/db

# Copy binary from builder stage
COPY --from=builder /app/app .

# Copy migration files so the app can run migrations
COPY --from=builder /app/backend/pkg/db/migrations ./backend/pkg/db/migrations

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./app"]
