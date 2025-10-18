import React from 'react'
import { 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  FireIcon 
} from '@heroicons/react/24/outline'

interface ProtocolStats {
  totalCrucibles: number
  totalTVL: number
  totalUsers: number
  averageAPR: number
}

interface StatsProps {
  stats: ProtocolStats | null
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(0)
  }

  const statItems = [
    {
      title: 'Total Crucibles',
      value: stats.totalCrucibles,
      icon: FireIcon,
      color: 'text-forge-primary',
    },
    {
      title: 'Total TVL',
      value: `$${formatNumber(stats.totalTVL)}`,
      icon: BanknotesIcon,
      color: 'text-forge-accent',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'text-green-400',
    },
    {
      title: 'Average APR',
      value: `${stats.averageAPR.toFixed(2)}%`,
      icon: ChartBarIcon,
      color: 'text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{item.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
            </div>
            <item.icon className={`h-8 w-8 ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
