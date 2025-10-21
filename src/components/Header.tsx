import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { FogoSessionsButton } from './FogoSessions'

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-black via-fogo-secondary to-black border-b border-fogo-primary/20 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="12" cy="12" r="10" stroke="#E85102" strokeWidth="2" fill="none"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z" fill="#E85102"/>
                  <circle cx="12" cy="12" r="3" fill="#E85102"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-inter-bold text-fogo-gray-50">Forge Protocol</h1>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-colors font-inter font-medium">
              Crucibles
            </a>
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-colors font-inter font-medium">
              Heat
            </a>
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-colors font-inter font-medium">
              Sparks
            </a>
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-colors font-inter font-medium">
              Governance
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            <FogoSessionsButton />
            <WalletMultiButton className="!bg-fogo-primary hover:!bg-fogo-primary-dark !text-fogo-gray-50 !font-semibold !px-4 !py-2 !rounded-lg !transition-all !transform hover:!scale-105 !shadow-lg" />
          </div>
        </div>
      </div>
    </header>
  )
}
