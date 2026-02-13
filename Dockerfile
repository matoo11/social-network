# ---------- Build Stage ----------
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /app

# Install git (needed for some dependencies)
RUN apk add --no-cache git

# Copy go modules first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app

# ---------- Runtime Stage ----------
FROM alpine:latest

# Set working directory
WORKDIR /app

# Install certificates (needed for HTTPS requests)
RUN apk add --no-cache ca-certificates

# Copy binary from builder stage
COPY --from=builder /app/app .

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./app"]
