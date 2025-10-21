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
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path 
                    d="M6 2h4l-2 4h4l-2 4h4l-2 4h4l-2 4H6l2-4H4l2-4H2l2-4H0l2-4z" 
                    fill="url(#forgeGradient)"
                    className="rounded-sm"
                  />
                  <defs>
                    <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#FF6B35" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-inter-bold text-fogo-gray-50">Forge Protocol</h1>
              <p className="text-xs font-inter-light text-fogo-gray-400">Decentralized Finance on Fogo</p>
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
