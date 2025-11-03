import React from 'react'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, { ssr: false })
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { FogoSessionsButton } from './FogoSessions'

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-black via-fogo-secondary/80 to-black border-b border-fogo-primary/30 shadow-2xl backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand - Enhanced */}
          <div className="flex items-center space-x-3 group">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fogo-primary/20 to-fogo-primary/10 flex items-center justify-center border border-fogo-primary/20 group-hover:border-fogo-primary/40 transition-all duration-300">
                <img 
                  src="/forgo logo straight.png" 
                  alt="Forge Logo" 
                  className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-inter-bold bg-gradient-to-r from-fogo-gray-50 via-fogo-primary-light to-fogo-gray-50 bg-clip-text text-transparent group-hover:from-fogo-primary group-hover:via-fogo-primary-light group-hover:to-fogo-primary transition-all duration-300">
                Forge Protocol
              </h1>
            </div>
          </div>
          
          {/* Navigation - Enhanced */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/demo" className="text-fogo-gray-300 hover:text-fogo-primary transition-all duration-200 font-inter font-medium px-3 py-2 rounded-lg hover:bg-fogo-primary/10 relative group">
              Demo
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fogo-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="/lending" className="text-fogo-gray-300 hover:text-fogo-primary transition-all duration-200 font-inter font-medium px-3 py-2 rounded-lg hover:bg-fogo-primary/10 relative group">
              Lending
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fogo-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-fogo-primary font-inter font-semibold px-3 py-2 rounded-lg bg-fogo-primary/10 relative group">
              Crucibles
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-fogo-primary"></span>
            </a>
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-all duration-200 font-inter font-medium px-3 py-2 rounded-lg hover:bg-fogo-primary/10 relative group">
              Heat
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fogo-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-all duration-200 font-inter font-medium px-3 py-2 rounded-lg hover:bg-fogo-primary/10 relative group">
              Sparks
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fogo-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-fogo-gray-300 hover:text-fogo-primary transition-all duration-200 font-inter font-medium px-3 py-2 rounded-lg hover:bg-fogo-primary/10 relative group">
              Governance
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fogo-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          {/* Wallet Connection - Enhanced */}
          <div className="flex items-center space-x-3">
            <FogoSessionsButton />
            <WalletMultiButton className="!bg-gradient-to-r !from-fogo-primary !to-fogo-primary-light hover:!from-fogo-primary-dark hover:!to-fogo-primary !text-white !font-semibold !px-5 !py-2.5 !rounded-xl !transition-all !transform hover:!scale-105 !shadow-lg hover:!shadow-fogo-lg !border !border-fogo-primary/20" />
          </div>
        </div>
      </div>
    </header>
  )
}
