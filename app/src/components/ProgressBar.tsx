import React from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  showPercentage?: boolean
  animated?: boolean
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses = {
    primary: 'bg-gradient-to-r from-forge-primary to-forge-secondary',
    success: 'bg-gradient-to-r from-forge-success to-green-400',
    warning: 'bg-gradient-to-r from-forge-warning to-yellow-400',
    error: 'bg-gradient-to-r from-forge-error to-red-400',
    info: 'bg-gradient-to-r from-forge-info to-blue-400'
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${sizeClasses[size]} bg-forge-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} ${animated ? 'transition-all duration-500 ease-out' : ''} ${
            animated ? 'animate-pulse-glow' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-forge-gray-400">Progress</span>
          <span className="text-sm font-semibold text-forge-gray-200">
            {clampedProgress.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
