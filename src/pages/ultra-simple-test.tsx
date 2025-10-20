/**
 * Ultra-Simple FOGO Sessions Test
 * This completely bypasses all complex logic to isolate the exact error
 */

import React, { useState } from 'react';

export default function UltraSimpleFogoTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectSignMessage = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing DIRECT Phantom signMessage (no FOGO Sessions)...');
      
      // Step 1: Check Phantom
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not found');
      }
      
      console.log('✅ Phantom detected');
      
      // Step 2: Connect
      let publicKey;
      if (window.solana.isConnected && window.solana.publicKey) {
        publicKey = window.solana.publicKey;
      } else {
        const response = await window.solana.connect();
        publicKey = response.publicKey;
      }
      
      console.log('✅ Connected to:', publicKey.toString());
      
      // Step 3: Create the simplest possible message
      const simpleMessage = "Test message for FOGO Sessions";
      console.log('📄 Simple message:', simpleMessage);
      
      // Step 4: Encode with TextEncoder
      const encodedMessage = new TextEncoder().encode(simpleMessage);
      console.log('📄 Encoded message:', {
        type: typeof encodedMessage,
        constructor: encodedMessage.constructor.name,
        isUint8Array: encodedMessage instanceof Uint8Array,
        length: encodedMessage.length,
        firstFewBytes: Array.from(encodedMessage.slice(0, 5))
      });
      
      // Step 5: Sign with Phantom (DIRECT CALL)
      console.log('✍️ Calling window.solana.signMessage DIRECTLY...');
      console.log('🔍 About to call signMessage with:', encodedMessage);
      
      const signature = await window.solana.signMessage(encodedMessage);
      
      console.log('✅ Signature received:', {
        type: typeof signature,
        constructor: signature.constructor.name,
        isUint8Array: signature instanceof Uint8Array,
        length: signature.length
      });
      
      // Step 6: Convert to base64 correctly (handle non-iterable case)
      let signatureBase64: string;
      try {
        // Try the spread syntax first
        signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));
      } catch (error) {
        console.log('⚠️ Spread syntax failed, trying Array.from method');
        // Fallback: convert to array first, then to base64
        const signatureArray = Array.from(signature);
        signatureBase64 = btoa(String.fromCharCode(...signatureArray));
      }
      console.log('📄 Signature (base64):', signatureBase64);
      
      const testResult = {
        success: true,
        publicKey: publicKey.toString(),
        message: simpleMessage,
        signature: signatureBase64,
        timestamp: new Date().toISOString(),
        testType: 'Direct Phantom signMessage'
      };
      
      console.log('🎉 Direct test completed successfully!');
      setResult(testResult);
      
    } catch (error: any) {
      console.error('❌ Direct test failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testFogoSessionsCall = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing FOGO Sessions call...');
      
      // Import the function dynamically to avoid any import issues
      const { createFogoSession } = await import('../utils/fogoSessionsWithPrivateKey');
      
      // Test with null wallet (should trigger Phantom fallback)
      const config = {
        wallet: null as any,
        network: "fogo-testnet"
      };
      
      console.log('🔍 Calling createFogoSession with config:', config);
      
      const testResult = await createFogoSession(config);
      
      console.log('✅ FOGO Sessions test completed successfully!');
      setResult({
        ...testResult,
        testType: 'FOGO Sessions call'
      });
      
    } catch (error: any) {
      console.error('❌ FOGO Sessions test failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithPrivateKey = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing with mock private key...');
      
      // Create a mock private key (64 hex characters)
      const mockPrivateKey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      
      // Import the function dynamically
      const { createFogoSession } = await import('../utils/fogoSessionsWithPrivateKey');
      
      // Test with private key string
      const config = {
        wallet: mockPrivateKey,
        network: "fogo-testnet"
      };
      
      console.log('🔍 Calling createFogoSession with private key:', config);
      
      const testResult = await createFogoSession(config);
      
      console.log('✅ Private key test completed successfully!');
      setResult({
        ...testResult,
        testType: 'Private key test'
      });
      
    } catch (error: any) {
      console.error('❌ Private key test failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Ultra-Simple FOGO Sessions Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Isolated Tests</h2>
          <p className="text-gray-300 mb-4">
            These tests bypass all complex logic to isolate the exact error source.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={testDirectSignMessage}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : '🧪 Test Direct Phantom signMessage'}
            </button>
            
            <button
              onClick={testFogoSessionsCall}
              disabled={isLoading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : '🧪 Test FOGO Sessions Call'}
            </button>
            
            <button
              onClick={testWithPrivateKey}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : '🧪 Test with Mock Private Key'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-300">{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-red-400 text-sm">View Error Details</summary>
              <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify({ error: error }, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        {result && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">✅ Success</h3>
            <div className="text-green-300">
              <p><strong>Test Type:</strong> {result.testType}</p>
              <p><strong>Public Key:</strong> {result.publicKey || result.user_public_key}</p>
              <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
              <p><strong>Timestamp:</strong> {result.timestamp}</p>
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
          <h3 className="text-blue-400 font-semibold mb-2">🔍 Debug Information</h3>
          <div className="text-blue-300 text-sm space-y-2">
            <div>
              <strong>Window.solana:</strong> {typeof window !== 'undefined' && window.solana ? '✅ Available' : '❌ Not available'}
            </div>
            <div>
              <strong>Phantom:</strong> {typeof window !== 'undefined' && window.solana?.isPhantom ? '✅ Detected' : '❌ Not detected'}
            </div>
            <div>
              <strong>Connected:</strong> {typeof window !== 'undefined' && window.solana?.isConnected ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Public Key:</strong> {typeof window !== 'undefined' && window.solana?.publicKey?.toString() || 'None'}
            </div>
            <div>
              <strong>Domain:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
