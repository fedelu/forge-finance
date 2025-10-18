# Forge Protocol - Docker Build Environment
FROM rust:1.75-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install 0.30.1
RUN avm use 0.30.1

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . .

# Build the project
RUN anchor build

# Default command
CMD ["anchor", "build"]
