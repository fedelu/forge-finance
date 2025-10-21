import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { FogoSessionsButton } from './FogoSessions'

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <BanknotesIcon className="h-8 w-8 text-fogo-primary" />
                <CurrencyDollarIcon className="h-4 w-4 text-fogo-accent absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Forge Protocol</h1>
              <p className="text-xs text-gray-400">Decentralized Finance on Fogo</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
              Crucibles
            </a>
            <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
              Heat
            </a>
            <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
              Sparks
            </a>
            <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
              Governance
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            <FogoSessionsButton />
            <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 !text-white !font-semibold !px-4 !py-2 !rounded-lg !transition-all !transform hover:!scale-105 !shadow-lg" />
          </div>
        </div>
      </div>
    </header>
  )
}
