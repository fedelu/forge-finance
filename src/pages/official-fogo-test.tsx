import React, { useState } from 'react';
import { createFogoSessionSmart, createOfficialFogoSession, createFogoSessionDirectAPI } from '../utils/officialFogoSessions';

export default function OfficialFogoTest() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (method: string, result: any) => {
    setResults(prev => [...prev, { method, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testOfficialSDK = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Official SDK method...');
      const result = await createOfficialFogoSession({
        network: "fogo-testnet",
        domain: window.location.origin
      });
      addResult('Official SDK', result);
    } catch (error: any) {
      addResult('Official SDK', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Direct API method...');
      const result = await createFogoSessionDirectAPI({
        network: "fogo-testnet",
        domain: window.location.origin
      });
      addResult('Direct API', result);
    } catch (error: any) {
      addResult('Direct API', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testSmartMethod = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Smart Method...');
      const result = await createFogoSessionSmart({
        network: "fogo-testnet",
        domain: window.location.origin
      });
      addResult('Smart Method', result);
    } catch (error: any) {
      addResult('Smart Method', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔥 Official FOGO Sessions Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testOfficialSDK}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test Official SDK
            </button>
            <button
              onClick={testDirectAPI}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test Direct API
            </button>
            <button
              onClick={testSmartMethod}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Test Smart Method
            </button>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-400">Testing FOGO Sessions...</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-orange-400">
                  {item.method} - {item.timestamp}
                </h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.result.error ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  {item.result.error ? 'Failed' : 'Success'}
                </span>
              </div>
              
              <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  {JSON.stringify(item.result, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-400">
            <p>No test results yet. Click a test method above to start testing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
