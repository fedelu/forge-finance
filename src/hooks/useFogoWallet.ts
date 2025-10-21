// src/hooks/useFogoWallet.ts
import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

// Define a type for the Phantom/Solflare provider
interface WalletProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, format?: "utf8") => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback: (args: any) => void) => void;
}

interface UseFogoWalletReturn {
  provider: WalletProvider | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  isInstalled: boolean;
  isUnlocked: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string | Uint8Array) => Promise<Uint8Array | null>;
  clearError: () => void;
}

export function useFogoWallet(): UseFogoWalletReturn {
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  // Wallet detection and event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectAndSetProvider = () => {
      const phantom = (window as any).phantom?.solana;
      const solflare = (window as any).solflare?.solana;

      if (phantom?.isPhantom) {
        setProvider(phantom);
        setIsInstalled(true);
        console.log("🔍 Phantom wallet detected.");
        return true;
      } else if (solflare?.isSolflare) {
        setProvider(solflare);
        setIsInstalled(true);
        console.log("🔍 Solflare wallet detected.");
        return true;
      }
      return false;
    };

    // Initial detection
    if (detectAndSetProvider()) {
      return;
    }

    // Set up interval for detection
    const detectionInterval = setInterval(() => {
      if (detectAndSetProvider()) {
        clearInterval(detectionInterval);
      }
    }, 500);

    // Set up timeout if wallet is never detected
    const detectionTimeout = setTimeout(() => {
      clearInterval(detectionInterval);
      if (!provider) {
        setIsInstalled(false);
        setError("Phantom or Solflare wallet not found. Please install a Solana wallet extension.");
        console.warn("⚠️ Wallet detection timed out. Provider not found.");
      }
    }, 5000);

    return () => {
      clearInterval(detectionInterval);
      clearTimeout(detectionTimeout);
    };
  }, [provider]);

  // Handle provider events (connect, disconnect, accountChange)
  useEffect(() => {
    if (!provider) return;

    const onConnect = (newPublicKey: PublicKey) => {
      setPublicKey(newPublicKey);
      setConnected(true);
      setIsUnlocked(true);
      setError(null);
      console.log("✅ Wallet connected:", newPublicKey.toString());
    };

    const onDisconnect = () => {
      setPublicKey(null);
      setConnected(false);
      setIsUnlocked(false);
      setError(null);
      console.log("🔌 Wallet disconnected.");
    };

    const onAccountChange = (newPublicKey: PublicKey | null) => {
      if (newPublicKey) {
        setPublicKey(newPublicKey);
        setConnected(true);
        setIsUnlocked(true);
        setError(null);
        console.log("🔄 Wallet account changed to:", newPublicKey.toString());
      } else {
        onDisconnect();
      }
    };

    // Initial status check
    if (provider.isConnected && provider.publicKey) {
      onConnect(provider.publicKey);
    } else {
      setIsUnlocked(!!provider.publicKey);
      setConnected(false);
    }

    provider.on("connect", onConnect);
    provider.on("disconnect", onDisconnect);
    if (provider.isPhantom) {
      provider.on("accountChanged", onAccountChange);
    }

    return () => {
      provider.removeListener("connect", onConnect);
      provider.removeListener("disconnect", onDisconnect);
      if (provider.isPhantom) {
        provider.removeListener("accountChanged", onAccountChange);
      }
    };
  }, [provider]);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);

    if (!provider) {
      const msg = "Wallet provider not found. Please install Phantom or Solflare.";
      setError(msg);
      console.error("❌ Connect error:", msg);
      setConnecting(false);
      throw new Error(msg);
    }

    try {
      console.log("🔌 Attempting to connect wallet...");
      const resp = await provider.connect();
      if (resp.publicKey) {
        setPublicKey(resp.publicKey);
        setConnected(true);
        setIsUnlocked(true);
        console.log("✅ Wallet connected successfully:", resp.publicKey.toString());
      } else {
        throw new Error("Connection successful, but no public key returned.");
      }
    } catch (e: any) {
      const msg = e?.message ?? "Failed to connect wallet.";
      setError(msg);
      console.error("❌ Wallet connect error:", e);
      throw e;
    } finally {
      setConnecting(false);
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    if (!provider || !connected) {
      console.log("ℹ️ Not connected, skipping disconnect.");
      return;
    }
    try {
      console.log("🔌 Attempting to disconnect wallet...");
      await provider.disconnect();
      setPublicKey(null);
      setConnected(false);
      setIsUnlocked(false);
      setError(null);
      console.log("✅ Wallet disconnected successfully.");
    } catch (e: any) {
      const msg = e?.message ?? "Failed to disconnect wallet.";
      setError(msg);
      console.error("❌ Wallet disconnect error:", e);
      throw e;
    }
  }, [provider, connected]);

  const signMessage = useCallback(async (message: string | Uint8Array): Promise<Uint8Array | null> => {
    if (!provider || !publicKey || !connected) {
      setError("Wallet not connected. Cannot sign message.");
      console.error("❌ Sign message error: Wallet not connected.");
      return null;
    }
    try {
      console.log("✍️ Attempting to sign message...");
      const msgBytes = typeof message === "string" ? new TextEncoder().encode(message) : message;
      const { signature } = await provider.signMessage(msgBytes, "utf8");
      console.log("✅ Message signed successfully.");
      return signature;
    } catch (e: any) {
      const msg = e?.message ?? "Failed to sign message.";
      setError(msg);
      console.error("❌ Sign message error:", e);
      throw e;
    }
  }, [provider, publicKey, connected]);

  return {
    provider,
    publicKey,
    connected,
    connecting,
    error,
    isInstalled,
    isUnlocked,
    connect,
    disconnect,
    signMessage,
    clearError,
  };
}
