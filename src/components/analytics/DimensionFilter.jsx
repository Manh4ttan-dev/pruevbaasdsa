import { useState } from 'react'
import { ChevronDown, X, Filter } from 'lucide-react'

/**
 * DimensionFilter - Multi-dimensional filter component
 * Used for filtering analytics by institution, role, platform, country
 */
export default function DimensionFilter({ filters, value, onChange, className = '' }) {
  const [activeDropdown, setActiveDropdown] = useState(null)

  const handleFilterChange = (filterName, filterValue) => {
    onChange({
      ...value,
      [filterName]: filterValue === value[filterName] ? undefined : filterValue,
    })
    setActiveDropdown(null)
  }

  const clearFilter = (filterName) => {
    const newValue = { ...value }
    delete newValue[filterName]
    onChange(newValue)
  }

  const clearAllFilters = () => {
    onChange({})
  }

  const activeFiltersCount = Object.values(value || {}).filter(Boolean).length

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Filter Button with count */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-bold rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filters.map((filter) => {
        const selectedValue = value?.[filter.name]
        const selectedOption = filter.options?.find((opt) => opt.value === selectedValue)

        return (
          <div key={filter.name} className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === filter.name ? null : filter.name)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                selectedValue
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {filter.icon && <filter.icon className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {selectedOption?.label || filter.label}
              </span>
              {selectedValue ? (
                <X
                  className="h-4 w-4 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFilter(filter.name)
                  }}
                />
              ) : (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    activeDropdown === filter.name ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Dropdown */}
            {activeDropdown === filter.name && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setActiveDropdown(null)}
                />
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {filter.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(filter.name, option.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedValue === option.value
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {option.icon && <option.icon className="h-4 w-4" />}
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <span className="ml-auto text-xs opacity-60">
                            {option.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}

      {/* Clear All */}
      {activeFiltersCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
