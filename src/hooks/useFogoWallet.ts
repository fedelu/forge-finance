// src/hooks/useFogoWallet.ts
import { useEffect, useState } from "react";

export function useFogoWallet() {
  const [provider, setProvider] = useState<any | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    console.log('🔍 Detecting wallet provider...');
    const p = (window as any).phantom?.solana ?? (window as any).solflare?.solana ?? null;
    
    if (p?.isPhantom) {
      console.log('✅ Phantom wallet detected');
      setProvider(p);
      
      // Check if already connected
      if (p.isConnected && p.publicKey) {
        setPublicKey(p.publicKey.toString());
        setConnected(true);
        console.log('✅ Wallet already connected:', p.publicKey.toString());
      }
    } else {
      console.warn('⚠️ No supported wallet found');
    }
  }, []);

  async function connect() {
    setError(null);
    if (!provider) {
      const errorMsg = "Phantom not found. Install Phantom and try again.";
      setError(errorMsg);
      console.error('❌', errorMsg);
      return;
    }
    
    try {
      console.log('🔌 Connecting to wallet...');
      const resp = await provider.connect();
      const pubKey = resp.publicKey?.toString?.() ?? null;
      
      setPublicKey(pubKey);
      setConnected(true);
      console.log('✅ Wallet connected successfully:', pubKey);
      
      return resp;
    } catch (e: any) {
      const errorMsg = e?.message ?? "Failed to connect wallet";
      setError(errorMsg);
      console.error("❌ Wallet connect error:", e);
      throw e;
    }
  }

  async function disconnect() {
    if (!provider) return;
    
    try {
      console.log('🔌 Disconnecting wallet...');
      await provider.disconnect();
      setPublicKey(null);
      setConnected(false);
      console.log('✅ Wallet disconnected');
    } catch (e: any) {
      console.error('❌ Wallet disconnect error:', e);
      throw e;
    }
  }

  async function signMessage(message: string | Uint8Array) {
    if (!provider) throw new Error("No wallet provider");
    if (!connected) throw new Error("Wallet not connected");
    
    try {
      console.log('✍️ Signing message...');
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      
      // Phantom signMessage API:
      const sig = await provider.signMessage(msgBytes, 'utf8');
      console.log('✅ Message signed successfully');
      return sig;
    } catch (e: any) {
      console.error('❌ Sign message error:', e);
      throw e;
    }
  }

  return {
    provider,
    publicKey,
    connected,
    connect,
    disconnect,
    signMessage,
    error,
  };
}
