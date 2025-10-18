import React, { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface NotificationProps {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: () => void
  className?: string
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-forge-success/10',
      borderColor: 'border-forge-success/30',
      iconColor: 'text-forge-success',
      titleColor: 'text-forge-success'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-forge-warning/10',
      borderColor: 'border-forge-warning/30',
      iconColor: 'text-forge-warning',
      titleColor: 'text-forge-warning'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-forge-error/10',
      borderColor: 'border-forge-error/30',
      iconColor: 'text-forge-error',
      titleColor: 'text-forge-error'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-forge-info/10',
      borderColor: 'border-forge-info/30',
      iconColor: 'text-forge-info',
      titleColor: 'text-forge-info'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        ${config.bgColor} ${config.borderColor}
        border rounded-xl p-4 backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {title}
          </h4>
          {message && (
            <p className="mt-1 text-sm text-forge-gray-300">
              {message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-forge-gray-400 hover:text-forge-gray-200 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Notification
