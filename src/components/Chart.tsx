import React from 'react'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface ChartProps {
  data: ChartData[]
  type?: 'bar' | 'line' | 'pie' | 'donut'
  height?: number
  showValues?: boolean
  animated?: boolean
  className?: string
}

const Chart: React.FC<ChartProps> = ({
  data,
  type = 'bar',
  height = 200,
  showValues = true,
  animated = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const totalValue = data.reduce((sum, d) => sum + d.value, 0)

  const defaultColors = [
    '#FF6B35',
    '#F7931E',
    '#FFD23F',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EF4444',
    '#F59E0B'
  ]

  const getColor = (index: number, customColor?: string) => {
    return customColor || defaultColors[index % defaultColors.length]
  }

  const renderBarChart = () => (
    <div className="flex items-end space-x-2 h-full">
      {data.map((item, index) => (
        <div key={item.label} className="flex-1 flex flex-col items-center">
          <div className="relative w-full">
            <div
              className={`w-full rounded-t-lg transition-all duration-1000 ${
                animated ? 'animate-slide-up' : ''
              }`}
              style={{
                height: `${(item.value / maxValue) * height}px`,
                backgroundColor: getColor(index, item.color),
                animationDelay: `${index * 100}ms`
              }}
            />
            {showValues && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-forge-gray-200">
                {item.value.toLocaleString()}
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-forge-gray-400 text-center truncate w-full">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => {
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - (item.value / maxValue) * 100
    }))

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    return (
      <div className="relative w-full h-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {data.map((item, index) => (
                <stop
                  key={index}
                  offset={`${(index / (data.length - 1)) * 100}%`}
                  stopColor={getColor(index, item.color)}
                />
              ))}
            </linearGradient>
          </defs>
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            className={animated ? 'animate-draw-line' : ''}
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={points[index].x}
              cy={points[index].y}
              r="3"
              fill={getColor(index, item.color)}
              className={animated ? 'animate-scale-in' : ''}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </svg>
        {showValues && (
          <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-forge-gray-400">
            {data.map((item, index) => (
              <span key={index} className="text-center">
                {item.value.toLocaleString()}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderPieChart = () => {
    let currentAngle = 0
    const radius = 80
    const centerX = 100
    const centerY = 100

    return (
      <div className="relative w-full h-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 200"
        >
          {data.map((item, index) => {
            const percentage = item.value / totalValue
            const angle = percentage * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle

            const x1 = centerX + radius * Math.cos((startAngle - 90) * (Math.PI / 180))
            const y1 = centerY + radius * Math.sin((startAngle - 90) * (Math.PI / 180))
            const x2 = centerX + radius * Math.cos((endAngle - 90) * (Math.PI / 180))
            const y2 = centerY + radius * Math.sin((endAngle - 90) * (Math.PI / 180))

            const largeArcFlag = angle > 180 ? 1 : 0

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')

            currentAngle += angle

            return (
              <path
                key={item.label}
                d={pathData}
                fill={getColor(index, item.color)}
                className={animated ? 'animate-scale-in' : ''}
                style={{ animationDelay: `${index * 100}ms` }}
              />
            )
          })}
        </svg>
        {showValues && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-forge-gray-200">
                {totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-forge-gray-400">Total</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart()
      case 'line':
        return renderLineChart()
      case 'pie':
      case 'donut':
        return renderPieChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  )
}

export default Chart
