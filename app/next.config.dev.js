/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: 'devnet',
    NEXT_PUBLIC_RPC_URL: 'https://api.devnet.solana.com',
    NEXT_PUBLIC_EXPLORER_URL: 'https://explorer.solana.com',
    NEXT_PUBLIC_COMMITMENT: 'confirmed',
  }
}

module.exports = nextConfig
