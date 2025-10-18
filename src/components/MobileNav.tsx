import React, { useState } from 'react'
import { 
  FireIcon, 
  BoltIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'crucibles', label: 'Crucibles', icon: BanknotesIcon },
    { id: 'governance', label: 'Governance', icon: UserGroupIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg bg-forge-gray border border-gray-700 hover:border-forge-primary transition-colors"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-forge-gray border-r border-gray-700">
            <div className="p-6">
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="flex items-center space-x-2">
                  <FireIcon className="h-8 w-8 text-forge-primary" />
                  <BoltIcon className="h-6 w-6 text-forge-accent" />
                </div>
                <h1 className="text-xl font-bold text-white">Forge Protocol</h1>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-forge-primary text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
