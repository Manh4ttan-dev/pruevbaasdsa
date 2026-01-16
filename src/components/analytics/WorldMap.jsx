import { useState, useMemo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'

// TopoJSON world map (110m resolution for faster loading)
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Country code to name mapping for tooltips
const countryNames = {
  PE: 'Perú',
  CO: 'Colombia',
  EC: 'Ecuador',
  BO: 'Bolivia',
  CL: 'Chile',
  AR: 'Argentina',
  BR: 'Brasil',
  MX: 'México',
  US: 'Estados Unidos',
  ES: 'España',
  // Add more as needed
}

/**
 * WorldMap - Interactive choropleth world map
 * Shows geographic distribution of users/events
 */
export default function WorldMap({
  data = [],
  valueKey = 'users',
  title,
  className = '',
}) {
  const [tooltipContent, setTooltipContent] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Create a map from country code to value
  const dataMap = useMemo(() => {
    const map = {}
    data.forEach((item) => {
      const key = item.country || item.location
      if (key) {
        map[key.toUpperCase()] = item[valueKey] || item.users || item.events || 0
      }
    })
    return map
  }, [data, valueKey])

  // Calculate color scale
  const maxValue = useMemo(() => {
    const values = Object.values(dataMap)
    return values.length > 0 ? Math.max(...values) : 0
  }, [dataMap])

  const getColor = (value) => {
    if (!value || value === 0) return '#E5E7EB' // gray-200

    const intensity = maxValue > 0 ? value / maxValue : 0

    // Color scale from light blue to dark blue
    if (intensity > 0.8) return '#1E40AF' // blue-800
    if (intensity > 0.6) return '#1D4ED8' // blue-700
    if (intensity > 0.4) return '#2563EB' // blue-600
    if (intensity > 0.2) return '#3B82F6' // blue-500
    if (intensity > 0.1) return '#60A5FA' // blue-400
    return '#93C5FD' // blue-300
  }

  const handleMouseEnter = (geo, evt) => {
    const { NAME, ISO_A2, ISO_A3 } = geo.properties
    const code = ISO_A2 || ISO_A3
    const value = dataMap[code] || dataMap[ISO_A3] || 0

    setTooltipContent({
      name: countryNames[code] || NAME,
      value,
    })
    setTooltipPosition({ x: evt.clientX, y: evt.clientY })
  }

  const handleMouseLeave = () => {
    setTooltipContent(null)
  }

  return (
    <div className={`card p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

      <div className="relative aspect-[2/1] bg-gray-50 rounded-lg overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [-60, -10], // Center on South America by default
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const { ISO_A2, ISO_A3 } = geo.properties
                  const code = ISO_A2 || ISO_A3
                  const value = dataMap[code] || dataMap[ISO_A3] || 0

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(value)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#1E40AF', outline: 'none', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltipContent && (
          <div
            className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
            }}
          >
            <p className="font-medium">{tooltipContent.name}</p>
            <p className="text-gray-300">
              {new Intl.NumberFormat('es-PE').format(tooltipContent.value)} {valueKey}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Menos</span>
          <div className="flex">
            {['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'].map((color) => (
              <div
                key={color}
                className="w-6 h-3"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">Más</span>
        </div>

        <div className="text-sm text-gray-600">
          {data.length} países con datos
        </div>
      </div>

      {/* Top Countries List */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Top países</p>
          <div className="space-y-2">
            {data.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {countryNames[item.country] || item.country}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('es-PE').format(item[valueKey] || item.users || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
