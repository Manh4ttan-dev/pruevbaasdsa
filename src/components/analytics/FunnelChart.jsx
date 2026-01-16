/**
 * FunnelChart - Horizontal funnel visualization
 * Used for displaying conversion funnels (e.g., procedure steps)
 */
export default function FunnelChart({ steps, title, className = '' }) {
  if (!steps || steps.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <p className="text-gray-500 text-center">No hay datos de funnel disponibles</p>
      </div>
    )
  }

  const maxValue = Math.max(...steps.map((s) => s.users || 0))

  // Colors for funnel steps (gradient from green to red)
  const getStepColor = (index, total) => {
    const colors = [
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
    ]
    const colorIndex = Math.min(Math.floor((index / (total - 1)) * (colors.length - 1)), colors.length - 1)
    return colors[colorIndex] || colors[0]
  }

  return (
    <div className={`card p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}

      <div className="space-y-4">
        {steps.map((step, index) => {
          const widthPercentage = maxValue > 0 ? (step.users / maxValue) * 100 : 0
          const conversionRate = step.conversionRate || 0
          const dropOffRate = step.dropOffRate || 0

          return (
            <div key={step.stepName || index} className="relative">
              {/* Step Label */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{step.stepName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('es-PE').format(step.users)} usuarios
                  </span>
                  {step.avgDuration && (
                    <span className="text-xs text-gray-500">
                      ~{step.avgDuration}s
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${getStepColor(index, steps.length)} transition-all duration-500 ease-out rounded-lg`}
                  style={{ width: `${widthPercentage}%` }}
                />

                {/* Conversion/Drop-off indicators */}
                {index > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-xs font-medium text-white bg-black/20 px-2 py-0.5 rounded">
                      {conversionRate.toFixed(1)}% conversión
                    </span>
                    {dropOffRate > 0 && (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        -{dropOffRate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Drop-off Arrow */}
              {index < steps.length - 1 && dropOffRate > 0 && (
                <div className="absolute -right-2 top-full mt-1 flex items-center text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Conversión total</p>
            <p className="text-2xl font-bold text-gray-900">
              {steps.length > 0 && steps[0].users > 0
                ? ((steps[steps.length - 1].users / steps[0].users) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Usuarios completaron</p>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('es-PE').format(steps[steps.length - 1]?.users || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
