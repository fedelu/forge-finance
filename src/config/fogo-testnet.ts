export const FOGO_TESTNET_CONFIG = {
  // Fogo Testnet RPC endpoints (official FOGO testnet)
  RPC_URL: 'https://testnet.fogo.io',
  WS_URL: 'wss://testnet.fogo.io',
  NETWORK: 'fogo-testnet',
  CHAIN_ID: 'fogo-testnet',
  
  // Alternative RPC endpoints to try
  ALTERNATIVE_RPCS: [
    'https://testnet.fogo.io',
    'https://api.testnet.fogo.io',
    'https://rpc.testnet.fogo.io'
  ],
  
  // Fogo-specific program IDs (to be updated after deployment)
  PROGRAM_IDS: {
    FORGE_CORE: 'DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU',
    FORGE_CRUCIBLES: 'Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2',
    FORGE_SPARKS: 'FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf',
    FORGE_SMELTERS: 'B4HQzxJXq2ynfSJYBC7irwoYWwCL2',
    FORGE_HEAT: 'Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJhHSPaHs8qfxmb7',
    FORGE_REACTORS: 'HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc',
    FORGE_FIREWALL: '6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS',
    FORGE_ENGINEERS: '99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68',
  },
  
  // Fogo token addresses (testnet)
  TOKEN_ADDRESSES: {
    SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    FOGO: 'FogoToken1111111111111111111111111111111111111', // FOGO token (placeholder - update with real address)
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC testnet
    ETH: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk', // Mock ETH token
    BTC: '9n4nbM75f5Ui33ZdvPYWZKU6efXy2HKhmaKkDVcnNYKE', // Mock BTC token
  },
  
  // APY configuration
  APY_CONFIG: {
    SOL_CRUCIBLE: 0.08,    // 8% APY
    ETH_CRUCIBLE: 0.12,     // 12% APY  
    USDC_CRUCIBLE: 0.06,    // 6% APY
    BTC_CRUCIBLE: 0.10,     // 10% APY
  },
  
  // Network settings
  COMMITMENT: 'confirmed' as const,
  TIMEOUT: 60000,
  MAX_RETRIES: 3,
}
