import { useState, useEffect, useCallback } from 'react'
import { Globe, MapPin, Users, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { subDays } from 'date-fns'

import MetricCard from '../../components/analytics/MetricCard'
import DateRangePicker from '../../components/analytics/DateRangePicker'
import WorldMap from '../../components/analytics/WorldMap'
import { dashboardService } from '../../services/analyticsApi'

export default function GeoAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })
  const [groupBy, setGroupBy] = useState('country')

  const [geoData, setGeoData] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy,
      }

      const response = await dashboardService.getGeo(params)
      setGeoData(response.data)
    } catch (error) {
      console.error('Error loading geo data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, groupBy])

  useEffect(() => {
    loadData()
  }, [loadData])

  const locations = geoData?.locations || []
  const totalLocations = geoData?.totalLocations || 0

  // Calculate totals
  const totalUsers = locations.reduce((sum, loc) => sum + (loc.users || 0), 0)
  const totalEvents = locations.reduce((sum, loc) => sum + (loc.events || 0), 0)

  // Top 10 for bar chart
  const topLocations = locations.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis Geográfico</h1>
          <p className="text-gray-500 mt-1">
            Distribución de usuarios y eventos por ubicación geográfica
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="country">Por País</option>
            <option value="region">Por Región</option>
            <option value="city">Por Ciudad</option>
          </select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Ubicaciones Únicas"
          value={totalLocations}
          icon={MapPin}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Usuarios por Ubicación"
          value={totalUsers}
          icon={Users}
          color="secondary"
          loading={loading}
        />
        <MetricCard
          title="Eventos por Ubicación"
          value={totalEvents}
          icon={Activity}
          color="info"
          loading={loading}
        />
      </div>

      {/* World Map */}
      {groupBy === 'country' && (
        <WorldMap
          data={locations}
          valueKey="users"
          title="Distribución de Usuarios por País"
        />
      )}

      {/* Top Locations Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 {groupBy === 'country' ? 'Países' : groupBy === 'region' ? 'Regiones' : 'Ciudades'}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topLocations} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey={groupBy}
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                new Intl.NumberFormat('es-PE').format(value),
                name === 'users' ? 'Usuarios' : 'Eventos',
              ]}
            />
            <Bar dataKey="users" name="Usuarios" fill="#2c3b95" />
            <Bar dataKey="events" name="Eventos" fill="#30bce1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Locations Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Todas las Ubicaciones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  {groupBy === 'country' ? 'País' : groupBy === 'region' ? 'Región' : 'Ciudad'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Eventos
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  % Usuarios
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.map((location, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {location[groupBy]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {new Intl.NumberFormat('es-PE').format(location.users || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {new Intl.NumberFormat('es-PE').format(location.events || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${totalUsers > 0 ? ((location.users || 0) / totalUsers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {totalUsers > 0
                          ? (((location.users || 0) / totalUsers) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
