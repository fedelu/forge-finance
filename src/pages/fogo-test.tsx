import React, { useState, useEffect } from 'react';
import { createFogoSessionLocal } from '../utils/fogoSessionsProper';
import { diagnoseFogoSessions } from '../utils/fogoDiagnostics';

// Simple test component for FOGO Sessions
export default function FogoTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    // Run diagnostics on page load
    const diag = diagnoseFogoSessions();
    setDiagnostics(diag);
  }, []);

  const testFogoSession = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing proper FOGO Session...');
      
      const testResult = await createFogoSessionLocal();
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 FOGO Sessions Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test FOGO Session Creation</h2>
          <p className="text-gray-300 mb-4">
            This test will verify that Phantom wallet can sign FOGO Session messages correctly.
          </p>
          
          <button
            onClick={testFogoSession}
            disabled={isLoading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Testing...</span>
              </div>
            ) : (
              '🧪 Test FOGO Session'
            )}
          </button>
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
              <p><strong>Public Key:</strong> {result.publicKey}</p>
              <p><strong>Signature:</strong> {result.signature.slice(0, 20)}...</p>
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
          <h3 className="text-blue-400 font-semibold mb-2">🔍 Diagnostic Information</h3>
          {diagnostics && (
            <div className="text-blue-300 text-sm space-y-2">
              <div>
                <strong>Environment:</strong> {diagnostics.environment.platform} | {diagnostics.environment.userAgent.split(' ').slice(-2).join(' ')}
              </div>
              <div>
                <strong>Phantom:</strong> {diagnostics.phantom.available ? '✅ Available' : '❌ Not available'} | 
                {diagnostics.phantom.isPhantom ? '✅ Phantom' : '❌ Not Phantom'} | 
                {diagnostics.phantom.hasSignMessage ? '✅ signMessage' : '❌ No signMessage'}
              </div>
              <div>
                <strong>TextEncoder:</strong> {diagnostics.textEncoder.available ? '✅ Available' : '❌ Not available'}
              </div>
              <div>
                <strong>Buffer:</strong> {diagnostics.buffer.available ? '✅ Available' : '❌ Not available'}
              </div>
              <div>
                <strong>Crypto:</strong> {diagnostics.crypto.available ? '✅ Available' : '❌ Not available'} | 
                {diagnostics.crypto.hasRandomUUID ? '✅ randomUUID' : '❌ No randomUUID'}
              </div>
              <div>
                <strong>Domain:</strong> {diagnostics.window.origin}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
