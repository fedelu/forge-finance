import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { FireIcon, BoltIcon } from '@heroicons/react/24/outline'

export const Header: React.FC = () => {
  return (
    <header className="bg-forge-gray border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FireIcon className="h-8 w-8 text-forge-primary" />
              <BoltIcon className="h-6 w-6 text-forge-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forge Protocol</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Crucibles
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Heat
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Sparks
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Governance
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletMultiButton className="!bg-forge-primary hover:!bg-forge-secondary !text-white !font-semibold !px-6 !py-2 !rounded-lg !transition-colors" />
          </div>
        </div>
      </div>
    </header>
  )
}
