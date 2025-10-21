import React from 'react';
import Head from 'next/head';

export default function TestBranding() {
  return (
    <div className="min-h-screen bg-black p-8">
      <Head>
        <title>Branding Test - Forge Finance</title>
      </Head>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-satoshi-bold text-white mb-8">Branding Test Page</h1>
        
        {/* Color Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-fogo-primary p-6 rounded-lg">
            <h2 className="text-2xl font-satoshi-bold text-white mb-4">Forge Orange (#E85102)</h2>
            <p className="font-satoshi-light text-white">This should be the primary brand color</p>
          </div>
          
          <div className="bg-fogo-secondary p-6 rounded-lg">
            <h2 className="text-2xl font-satoshi-bold text-white mb-4">Midnight Alloy (#000036)</h2>
            <p className="font-satoshi-light text-white">This should be the secondary brand color</p>
          </div>
          
          <div className="bg-fogo-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-satoshi-bold text-black mb-4">Pure White (#F9F9F9)</h2>
            <p className="font-satoshi-light text-black">This should be the text color</p>
          </div>
          
          <div className="bg-black border-2 border-fogo-primary p-6 rounded-lg">
            <h2 className="text-2xl font-satoshi-bold text-fogo-gray-50 mb-4">Black (#000000)</h2>
            <p className="font-satoshi-light text-fogo-gray-50">This should be the background color</p>
          </div>
        </div>
        
        {/* Font Tests */}
        <div className="bg-fogo-gray-900 p-8 rounded-lg">
          <h2 className="text-3xl font-satoshi-bold text-white mb-6">Typography Test</h2>
          <p className="text-xl font-satoshi text-fogo-gray-300 mb-4">This is Satoshi Regular (400)</p>
          <p className="text-xl font-satoshi-light text-fogo-gray-300 mb-4">This is Satoshi Light (300)</p>
          <p className="text-xl font-satoshi-bold text-fogo-gray-300 mb-4">This is Satoshi Bold (700)</p>
          <p className="text-xl font-satoshi-black text-fogo-gray-300 mb-4">This is Satoshi Black (900)</p>
        </div>
        
        {/* Gradient Tests */}
        <div className="bg-gradient-to-r from-fogo-primary to-fogo-secondary p-8 rounded-lg">
          <h2 className="text-3xl font-satoshi-bold text-white mb-4">Gradient Test</h2>
          <p className="font-satoshi-light text-white">This should show a gradient from Forge Orange to Midnight Alloy</p>
        </div>
        
        <div className="text-center">
          <p className="font-satoshi-light text-fogo-gray-400">
            If you can see the colors and fonts correctly, the branding is working! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
