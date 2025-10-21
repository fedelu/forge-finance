// Demo Configuration for Investor Presentation
export const DEMO_CONFIG = {
  // Fogo Testnet Configuration
  RPC_URL: 'https://testnet.fogo.io',
  NETWORK: 'fogo-testnet',
  COMMITMENT: 'confirmed' as const,
  PAYMASTER_URL: 'https://paymaster.testnet.fogo.io',
  
  // Demo Mode Settings
  DEMO_MODE: true,
  MOCK_BALANCES: true,
  MOCK_TRANSACTIONS: true,
  
  // Mock Token Addresses for Demo
  TOKEN_ADDRESSES: {
    FOGO: 'FogoToken1111111111111111111111111111111111111', // Mock FOGO token
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC testnet
    SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  },
  
  // Demo Balances (will be shown in UI)
  DEMO_BALANCES: {
    fogo: 1000.0,
    usdc: 500.0,
    sol: 2.5,
  },
  
  // Demo Session Wallet Address (mock) - using a valid base58 public key
  DEMO_SESSION_WALLET: '11111111111111111111111111111112',
  
  // Demo Transaction IDs (mock)
  DEMO_TRANSACTION_IDS: [
    'demo_tx_1_abc123def456',
    'demo_tx_2_xyz789uvw012',
    'demo_tx_3_mno345pqr678',
  ],
};
