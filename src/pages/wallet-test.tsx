import React, { useState } from 'react'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletProvider } from '../contexts/WalletContext'

function WalletTestContent() {
  const { 
    publicKey, 
    connected, 
    connecting, 
    disconnecting, 
    connect, 
    disconnect, 
    wallet,
    wallets,
    select
  } = useWallet()
  
  const [selectedWallet, setSelectedWallet] = useState<string>('')

  const handleConnect = async () => {
    try {
      console.log('Attempting to connect wallet...')
      console.log('Available wallets:', wallets.map(w => w.adapter.name))
      console.log('Selected wallet:', selectedWallet)
      
      if (selectedWallet) {
        select(selectedWallet as any)
      }
      
      if (connect) {
        await connect()
        console.log('Wallet connected successfully!')
      } else {
        console.log('No connect function available')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (disconnect) {
        await disconnect()
        console.log('Wallet disconnected successfully!')
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return (
    <>
      <Head>
        <title>Wallet Test - Forge Protocol</title>
        <meta name="description" content="Wallet Connection Test" />
      </Head>

      <div className="min-h-screen bg-forge-dark p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Wallet Connection Test</h1>
          
          {/* Wallet Status */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Wallet Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-400">Connected:</span>
                <span className={`ml-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Connecting:</span>
                <span className={`ml-2 ${connecting ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {connecting ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Disconnecting:</span>
                <span className={`ml-2 ${disconnecting ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {disconnecting ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Public Key:</span>
                <span className="ml-2 text-blue-400 text-sm">
                  {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Available Wallets */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Available Wallets</h2>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div key={wallet.adapter.name} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div>
                    <span className="text-white font-medium">{wallet.adapter.name}</span>
                    <span className="text-gray-400 ml-2">({wallet.adapter.url})</span>
                  </div>
                  <button
                    onClick={() => setSelectedWallet(wallet.adapter.name)}
                    className={`px-4 py-2 rounded ${
                      selectedWallet === wallet.adapter.name
                        ? 'bg-forge-primary text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Controls */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Connection Controls</h2>
            <div className="flex space-x-4">
              <button
                onClick={handleConnect}
                disabled={connecting || connected}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
              
              <button
                onClick={handleDisconnect}
                disabled={disconnecting || !connected}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>

          {/* Debug Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Connect Function:</span>
                <span className={`ml-2 ${connect ? 'text-green-400' : 'text-red-400'}`}>
                  {connect ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Disconnect Function:</span>
                <span className={`ml-2 ${disconnect ? 'text-green-400' : 'text-red-400'}`}>
                  {disconnect ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Wallet Count:</span>
                <span className="ml-2 text-blue-400">{wallets.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Selected Wallet:</span>
                <span className="ml-2 text-blue-400">{selectedWallet || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function WalletTest() {
  return (
    <WalletProvider>
      <WalletTestContent />
    </WalletProvider>
  )
}
