import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { FogoWalletButton } from '../components/FogoWalletButton'
import { WalletProvider } from '../contexts/WalletContext'

function FogoTestContent() {
  const { publicKey, connected, connect, disconnect } = useWallet()
  const [connection, setConnection] = useState<Connection | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create connection to Fogo testnet
    const conn = new Connection('https://testnet.fogo.io', 'confirmed')
    setConnection(conn)
  }, [])

  const checkBalance = async () => {
    if (!publicKey || !connection) return

    setLoading(true)
    setError(null)

    try {
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / 1e9) // Convert lamports to SOL
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balance')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    if (!connection) return

    setLoading(true)
    setError(null)

    try {
      const version = await connection.getVersion()
      console.log('Fogo testnet version:', version)
      alert(`✅ Connected to Fogo testnet!\nVersion: ${version['solana-core']}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      alert(`❌ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-forge-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔥 Fogo Testnet Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Connection Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">Fogo Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RPC URL:</span>
                <span className="text-white text-sm">https://testnet.fogo.io</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wallet Connected:</span>
                <span className={connected ? 'text-green-400' : 'text-red-400'}>
                  {connected ? 'Yes' : 'No'}
                </span>
              </div>
              {publicKey && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Wallet Address:</span>
                  <span className="text-white text-sm font-mono">
                    {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Test Actions</h2>
            <div className="space-y-4">
              <FogoWalletButton />

              <button
                onClick={testConnection}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Testing...' : 'Test Fogo Connection'}
              </button>

              {connected && (
                <button
                  onClick={checkBalance}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Checking...' : 'Check Balance'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {(balance !== null || error) && (
          <div className="card mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Results</h2>
            {error ? (
              <div className="text-red-400">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="text-green-400">
                <p className="font-semibold">Balance:</p>
                <p className="text-2xl">{balance} SOL</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="card mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Instructions</h2>
          <div className="space-y-2 text-gray-300">
            <p>1. <strong>Connect Wallet:</strong> Click "Connect Wallet" to connect your Fogo-compatible wallet</p>
            <p>2. <strong>Test Connection:</strong> Click "Test Fogo Connection" to verify the RPC endpoint is working</p>
            <p>3. <strong>Check Balance:</strong> Click "Check Balance" to see your SOL balance on Fogo testnet</p>
            <p>4. <strong>Expected Result:</strong> You should see your wallet address and balance (100 SOL)</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a href="/demo" className="btn-primary mr-4">
            Back to Demo
          </a>
          <a href="/simple-demo" className="btn-secondary">
            Simple Demo
          </a>
        </div>
      </div>
    </div>
  )
}

export default function FogoTest() {
  return (
    <WalletProvider>
      <FogoTestContent />
    </WalletProvider>
  )
}
