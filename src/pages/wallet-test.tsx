import React from 'react';
import Head from 'next/head';
import PhantomWalletButton from '../components/PhantomWalletButton';

export default function WalletTestPage() {
  return (
    <>
      <Head>
        <title>Phantom Wallet Test - Forge Finance</title>
        <meta name="description" content="Test Phantom wallet connection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Phantom Wallet Connection Test
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Instructions
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Make sure Phantom wallet is installed in your browser</li>
                <li>Click "Connect Phantom" button below</li>
                <li>Approve the connection in Phantom wallet</li>
                <li>Check the console for detailed logs</li>
                <li>Try the "Test Sign Message" button to verify signing works</li>
              </ol>
            </div>

            <PhantomWalletButton />

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Debug Information
              </h3>
              <p className="text-sm text-blue-800">
                Open your browser's developer console (F12) to see detailed logs of the connection process.
                All wallet operations are logged with clear success/error messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
