// Forge Protocol - Fogo Testnet Configuration
// Real deployment configuration

export const FOGO_TESTNET_PROGRAM_IDS = {
  FORGE_CORE: 'DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU',
  FORGE_CRUCIBLES: 'Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2',
  FORGE_SPARKS: 'FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf',
  FORGE_SMELTERS: 'B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg',
  FORGE_HEAT: 'Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7',
  FORGE_REACTORS: 'HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc',
  FORGE_FIREWALL: '6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS',
  FORGE_ENGINEERS: '99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68',
} as const

export const FOGO_TESTNET_CONFIG = {
  RPC_URL: 'https://testnet.fogo.io',
  WALLET_ADDRESS: '78bNPUUvdFLoCubco57mfXqEu1EU9UmRcodqUGNaZ7Pf',
  NETWORK: 'fogo-testnet',
  COMMITMENT: 'confirmed' as const,
  EXPLORER_URL: 'https://explorer.fogo.io',
} as const

// Fogo-specific configuration
export const FOGO_SESSIONS_CONFIG = {
  ENABLED: true,
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  AUTO_RENEW: true,
} as const
