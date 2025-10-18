import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Head from 'next/head'

export default function TestWallet() {
  const { publicKey, connected, connecting, disconnecting, wallet, connect, disconnect, wallets } = useWallet()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog(`Wallets available: ${wallets.length}`)
    addLog(`Connected: ${connected}`)
    addLog(`Public Key: ${publicKey?.toString() || 'None'}`)
    addLog(`Wallet: ${wallet?.adapter.name || 'None'}`)
  }, [wallets.length, connected, publicKey, wallet])

  const handleConnect = async () => {
    try {
      addLog('Attempting to connect wallet...')
      if (connect) {
        await connect()
        addLog('Wallet connected successfully!')
      } else {
        addLog('Connect function not available')
      }
    } catch (error) {
      addLog(`Connect error: ${error}`)
    }
  }

  const handleDisconnect = async () => {
    try {
      addLog('Attempting to disconnect wallet...')
      if (disconnect) {
        await disconnect()
        addLog('Wallet disconnected successfully!')
      } else {
        addLog('Disconnect function not available')
      }
    } catch (error) {
      addLog(`Disconnect error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-forge-dark p-8">
      <Head>
        <title>Wallet Test - Forge Protocol</title>
        <meta name="description" content="Wallet Connection Test" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Wallet Connection Test</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Connection Status</h3>
            <p className={`text-2xl font-bold ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Available Wallets</h3>
            <p className="text-2xl font-bold text-blue-400">{wallets.length}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Current Wallet</h3>
            <p className="text-lg text-gray-300">{wallet?.adapter.name || 'None'}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Public Key</h3>
            <p className="text-sm text-gray-300 break-all">
              {publicKey?.toString() || 'None'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Wallet Controls</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              disabled={connected || connecting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!connected || disconnecting}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>

        {/* Available Wallets List */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Available Wallets</h2>
          {wallets.length > 0 ? (
            <div className="space-y-2">
              {wallets.map((w, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-forge-gray rounded-lg">
                  <img src={w.adapter.icon} alt={w.adapter.name} className="w-6 h-6" />
                  <div>
                    <p className="text-white font-medium">{w.adapter.name}</p>
                    <p className="text-gray-400 text-sm">Status: {w.adapter.readyState}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No wallets detected. Make sure you have a Solana wallet installed.</p>
          )}
        </div>

        {/* Debug Logs */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Logs</h2>
          <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-green-400 text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-4 btn-secondary"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  )
}
