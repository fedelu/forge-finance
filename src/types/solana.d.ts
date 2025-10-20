// TypeScript declarations for Solana wallet integration

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: PublicKey }>;
      signMessage(message: Uint8Array): Promise<Uint8Array>;
      signTransaction<T extends any>(transaction: T): Promise<T>;
      publicKey?: PublicKey;
      isConnected?: boolean;
    };
  }
}

export {};
