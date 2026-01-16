import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * MetricCard - Large KPI display card with trend indicator
 * Used for displaying key metrics on analytics dashboards
 */
export default function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  suffix = '',
  prefix = '',
  icon: Icon,
  color = 'primary',
  loading = false,
}) {
  // Calculate trend
  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return { percentage: 0, direction: 'neutral' }

    const change = ((value - previousValue) / previousValue) * 100
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    }
  }

  const trend = calculateTrend()

  // Format value based on type
  const formatValue = (val) => {
    if (loading) return '—'

    switch (format) {
      case 'number':
        return new Intl.NumberFormat('es-PE').format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'duration':
        // Convert seconds to readable format
        if (val >= 3600) {
          const hours = Math.floor(val / 3600)
          const mins = Math.floor((val % 3600) / 60)
          return `${hours}h ${mins}m`
        } else if (val >= 60) {
          const mins = Math.floor(val / 60)
          const secs = Math.floor(val % 60)
          return `${mins}m ${secs}s`
        }
        return `${val}s`
      case 'bytes':
        if (val >= 1073741824) return `${(val / 1073741824).toFixed(1)} GB`
        if (val >= 1048576) return `${(val / 1048576).toFixed(1)} MB`
        if (val >= 1024) return `${(val / 1024).toFixed(1)} KB`
        return `${val} B`
      default:
        return val
    }
  }

  // Color classes
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-400',
  }

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[trend.direction]

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {prefix}
              {formatValue(value)}
              {suffix}
            </span>
          </div>

          {previousValue !== undefined && (
            <div className={`mt-2 flex items-center text-sm ${trendColors[trend.direction]}`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span className="font-medium">{trend.percentage}%</span>
              <span className="ml-1 text-gray-500">vs anterior</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}
