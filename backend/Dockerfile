# Build stage
FROM rust:1.75-slim as builder

# Install OpenSSL and pkg-config which are required for some Rust dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy over manifests
COPY Cargo.toml Cargo.lock ./

# Create a dummy src/main.rs to cache dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -Rvf src

# Copy actual source code
COPY src ./src

# Build for release
# We touch main.rs to ensure Cargo rebuilds it
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install OpenSSL (required for runtime) and ca-certificates (for HTTPS requests to Solana RPC)
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R 1000:1000 /app/data

# Copy the compiled binary from builder
COPY --from=builder /usr/src/app/target/release/validator-identity-transfer /usr/local/bin/

# Expose the default port
EXPOSE 8080

# Run as non-root user for security
USER 1000:1000

# Set required environment variables (can be overridden by deployment platform)
ENV HOST=0.0.0.0
ENV PORT=8080
ENV DATABASE_URL="sqlite:///app/data/transfers.db?mode=rwc"

# Run the binary
CMD ["validator-identity-transfer"]
