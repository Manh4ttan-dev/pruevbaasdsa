import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * DateRangePicker - Date range selector with presets
 * Used for filtering analytics data by date range
 */
export default function DateRangePicker({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const presets = [
    { label: 'Hoy', getValue: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Ayer', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 1)), endDate: endOfDay(subDays(new Date(), 1)) }) },
    { label: 'Últimos 7 días', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 6)), endDate: endOfDay(new Date()) }) },
    { label: 'Últimos 14 días', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 13)), endDate: endOfDay(new Date()) }) },
    { label: 'Últimos 30 días', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 29)), endDate: endOfDay(new Date()) }) },
    { label: 'Esta semana', getValue: () => ({ startDate: startOfDay(subWeeks(new Date(), 0)), endDate: endOfDay(new Date()) }) },
    { label: 'Última semana', getValue: () => ({ startDate: startOfDay(subWeeks(new Date(), 1)), endDate: endOfDay(subWeeks(new Date(), 0)) }) },
    { label: 'Este mes', getValue: () => ({ startDate: startOfDay(subMonths(new Date(), 0)), endDate: endOfDay(new Date()) }) },
    { label: 'Último mes', getValue: () => ({ startDate: startOfDay(subMonths(new Date(), 1)), endDate: endOfDay(subMonths(new Date(), 0)) }) },
    { label: 'Últimos 3 meses', getValue: () => ({ startDate: startOfDay(subMonths(new Date(), 3)), endDate: endOfDay(new Date()) }) },
  ]

  const handlePresetClick = (preset) => {
    const range = preset.getValue()
    onChange({
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      label: preset.label,
    })
    setIsOpen(false)
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({
        startDate: startOfDay(new Date(customStart)).toISOString(),
        endDate: endOfDay(new Date(customEnd)).toISOString(),
        label: 'Personalizado',
      })
      setIsOpen(false)
    }
  }

  const formatDateRange = () => {
    if (!value?.startDate || !value?.endDate) {
      return 'Seleccionar fechas'
    }

    if (value.label && value.label !== 'Personalizado') {
      return value.label
    }

    const start = new Date(value.startDate)
    const end = new Date(value.endDate)

    return `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM yyyy', { locale: es })}`
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{formatDateRange()}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Presets */}
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Rangos predefinidos
              </p>
              <div className="grid grid-cols-2 gap-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors text-left ${
                      value?.label === preset.label
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Rango personalizado
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
                className="w-full px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
