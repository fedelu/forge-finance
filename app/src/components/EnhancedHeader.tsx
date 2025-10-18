import React, { useState, useEffect } from 'react'
import { 
  FireIcon, 
  BoltIcon, 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedHeaderProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  loading: boolean
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  loading,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FireIcon },
    { id: 'crucibles', label: 'Crucibles', icon: BoltIcon },
    { id: 'governance', label: 'Governance', icon: UserCircleIcon },
    { id: 'analytics', label: 'Analytics', icon: Cog6ToothIcon },
  ]

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-forge-gray-900/95 backdrop-blur-md border-b border-forge-gray-700/50 shadow-forge-lg' 
          : 'bg-transparent'
        }
        ${className}
      `}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FireIcon className="h-8 w-8 text-forge-primary animate-pulse-glow" />
                <BoltIcon className="h-5 w-5 text-forge-accent absolute -top-1 -right-1 animate-bounce-gentle" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">
                Forge Protocol
              </h1>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                    ${activeTab === item.id
                      ? 'bg-forge-primary/20 text-forge-primary border border-forge-primary/30'
                      : 'text-forge-gray-300 hover:text-white hover:bg-forge-gray-800/50'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button
              className="p-2 text-forge-gray-400 hover:text-white hover:bg-forge-gray-800/50 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <BellIcon className="h-6 w-6" />
            </motion.button>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <motion.button
                  onClick={onDisconnect}
                  className="btn-secondary flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="status-online" />
                  <span>Disconnect</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={onConnect}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <div className="status-offline" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 text-forge-gray-400 hover:text-white hover:bg-forge-gray-800/50 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden mt-4 bg-forge-gray-800/50 backdrop-blur-sm rounded-xl border border-forge-gray-700/50 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                        ${activeTab === item.id
                          ? 'bg-forge-primary/20 text-forge-primary border border-forge-primary/30'
                          : 'text-forge-gray-300 hover:text-white hover:bg-forge-gray-700/50'
                        }
                      `}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default EnhancedHeader
