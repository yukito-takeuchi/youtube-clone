# Development stage
FROM golang:alpine AS development

WORKDIR /app

# Install air for hot reload
RUN go install github.com/air-verse/air@latest

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Run with air for hot reload
CMD ["air", "-c", ".air.toml"]

# Production stage
FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

FROM alpine:latest AS production

WORKDIR /root/

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
