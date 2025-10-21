/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: 'fogo-testnet',
    NEXT_PUBLIC_RPC_URL: 'https://testnet.fogo.io',
    NEXT_PUBLIC_EXPLORER_URL: 'https://explorer.solana.com',
    NEXT_PUBLIC_COMMITMENT: 'confirmed',
    NEXT_PUBLIC_PAYMASTER_URL: undefined,
    NEXT_PUBLIC_APP_DOMAIN: 'http://localhost:3000',
  }
}

module.exports = nextConfig
