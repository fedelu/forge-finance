import React, { useState } from 'react';
import { createFogoSession, FogoSessionConfig, examples } from '../utils/fogoSessionsWithPrivateKey';

/**
 * Demo component showing proper FOGO Sessions creation with private keys
 */
export default function FogoSessionsPrivateKeyDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState('');

  const testWithPrivateKey = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing FOGO Session with private key...');
      
      if (!privateKey.trim()) {
        throw new Error('Please enter a private key');
      }
      
      const config: FogoSessionConfig = {
        wallet: privateKey.trim(),
        network: "fogo-testnet"
      };
      
      const testResult = await createFogoSession(config);
      setResult(testResult);
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithBuffer = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing FOGO Session with Buffer...');
      
      if (!privateKey.trim()) {
        throw new Error('Please enter a private key');
      }
      
      // Convert string to Buffer
      const cleanPrivateKey = privateKey.trim().replace(/^0x/, '');
      const privateKeyBuffer = Buffer.from(cleanPrivateKey, 'hex');
      
      const config: FogoSessionConfig = {
        wallet: privateKeyBuffer,
        network: "fogo-testnet"
      };
      
      const testResult = await createFogoSession(config);
      setResult(testResult);
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithWalletObject = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing FOGO Session with wallet object (YOUR EXACT PATTERN)...');
      
      if (!privateKey.trim()) {
        throw new Error('Please enter a private key');
      }
      
      // YOUR EXACT PATTERN
      const wallet = {
        address: "0x1234567890abcdef1234567890abcdef12345678", // Mock address
        privateKey: privateKey.trim() // ensure this is a string
      };
      
      // Convert private key to Buffer (YOUR EXACT PATTERN)
      const privateKeyBuffer = Buffer.from(wallet.privateKey.replace(/^0x/, ""), "hex");
      
      // Create Fogo session with Buffer
      const config: FogoSessionConfig = {
        wallet: privateKeyBuffer, // Always pass Buffer, never wallet object
        network: "fogo-testnet"
      };
      
      const testResult = await createFogoSession(config);
      setResult(testResult);
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithPhantomFallback = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing FOGO Session with Phantom fallback...');
      
      const config: FogoSessionConfig = {
        wallet: null as any, // This triggers Phantom fallback
        network: "fogo-testnet"
      };
      
      const testResult = await createFogoSession(config);
      setResult(testResult);
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔑 FOGO Sessions Private Key Demo
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Private Key Configuration</h2>
          <p className="text-gray-300 mb-4">
            Enter a private key to test FOGO Sessions creation. The implementation supports:
          </p>
          <ul className="text-gray-300 mb-4 list-disc list-inside">
            <li>Private key as string (with or without 0x prefix)</li>
            <li>Private key as Buffer</li>
            <li>Wallet object with privateKey property</li>
            <li>Phantom wallet fallback (when no private key available)</li>
          </ul>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Private Key:</label>
            <input
              type="text"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={testWithPrivateKey}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test with String'}
            </button>
            
            <button
              onClick={testWithBuffer}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test with Buffer'}
            </button>
            
            <button
              onClick={testWithWalletObject}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test with Wallet Object'}
            </button>
            
            <button
              onClick={testWithPhantomFallback}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test Phantom Fallback'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">✅ Success</h3>
            <div className="text-green-300">
              <p><strong>Session ID:</strong> {result.session_id}</p>
              <p><strong>Public Key:</strong> {result.user_public_key}</p>
              <p><strong>Expires:</strong> {result.expires_at}</p>
              <p><strong>Message:</strong> {result.message}</p>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-green-400">View Full Result</summary>
              <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        <div className="mt-8 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">📚 Usage Examples (YOUR EXACT PATTERN)</h3>
          <div className="text-blue-300 text-sm space-y-3">
            <div>
              <strong>✅ CORRECT - Wallet Object with Buffer Conversion:</strong>
              <pre className="mt-1 bg-gray-800 p-2 rounded text-xs overflow-x-auto">
{`const wallet = {
  address: "0xabc...",
  privateKey: "0x123abc..." // ensure this is a string
};

// Convert private key to Buffer (YOUR EXACT PATTERN)
const privateKeyBuffer = Buffer.from(wallet.privateKey.replace(/^0x/, ""), "hex");

// Create Fogo session with Buffer
const session = createFogoSession({
  wallet: privateKeyBuffer,
  network: "testnet"
});`}
              </pre>
            </div>
            <div>
              <strong>✅ CORRECT - Direct String to Buffer:</strong>
              <pre className="mt-1 bg-gray-800 p-2 rounded text-xs overflow-x-auto">
{`const privateKey = "0x123abc...";
const privateKeyBuffer = Buffer.from(privateKey.replace(/^0x/, ""), "hex");

const session = createFogoSession({
  wallet: privateKeyBuffer,
  network: "testnet"
});`}
              </pre>
            </div>
            <div>
              <strong>❌ WRONG - Passing Wallet Object:</strong>
              <pre className="mt-1 bg-red-900/30 p-2 rounded text-xs overflow-x-auto">
{`// DON'T DO THIS - Causes "Received type object" error
const session = createFogoSession({
  wallet: { address: "0x...", privateKey: "0x123..." }, // ❌ Wallet object
  network: "testnet"
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
