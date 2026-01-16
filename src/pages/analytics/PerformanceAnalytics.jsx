import { useState, useEffect, useCallback } from 'react'
import {
  Zap,
  AlertTriangle,
  XOctagon,
  Clock,
  Server,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { subDays } from 'date-fns'

import MetricCard from '../../components/analytics/MetricCard'
import DateRangePicker from '../../components/analytics/DateRangePicker'
import { dashboardService } from '../../services/analyticsApi'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const ERROR_COLORS = {
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
  'network': '#8b5cf6',
  'timeout': '#6366f1',
  'other': '#94a3b8',
}

export default function PerformanceAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })
  const [platform, setPlatform] = useState('all')

  const [performanceData, setPerformanceData] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        platform: platform !== 'all' ? platform : undefined,
      }

      const response = await dashboardService.getPerformance(params)
      setPerformanceData(response.data)
    } catch (error) {
      console.error('Error loading performance data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, platform])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Format milliseconds to readable time
  const formatDuration = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Performance timeline
  const performanceTimeline = performanceData?.timeline || []

  // Error distribution
  const errorDistribution = performanceData?.errorsByType || []

  // Top slow endpoints
  const slowEndpoints = performanceData?.slowEndpoints || []

  // Crash rate status
  const crashRate = performanceData?.crashRate || 0
  const crashRateStatus = crashRate < 0.1 ? 'success' : crashRate < 1 ? 'warning' : 'danger'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendimiento & Errores</h1>
          <p className="text-gray-500 mt-1">
            Métricas de rendimiento, tiempos de carga y errores del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todas las Plataformas</option>
            <option value="web">Web</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
          </select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Health Status Banner */}
      <div className={`card p-4 ${
        performanceData?.healthScore >= 90
          ? 'bg-green-50 border border-green-200'
          : performanceData?.healthScore >= 70
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className={`h-6 w-6 ${
              performanceData?.healthScore >= 90
                ? 'text-green-600'
                : performanceData?.healthScore >= 70
                ? 'text-yellow-600'
                : 'text-red-600'
            }`} />
            <div>
              <h4 className={`font-medium ${
                performanceData?.healthScore >= 90
                  ? 'text-green-800'
                  : performanceData?.healthScore >= 70
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                Índice de Salud del Sistema
              </h4>
              <p className={`text-sm ${
                performanceData?.healthScore >= 90
                  ? 'text-green-700'
                  : performanceData?.healthScore >= 70
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                Basado en tiempos de respuesta, tasa de errores y disponibilidad
              </p>
            </div>
          </div>
          <div className={`text-3xl font-bold ${
            performanceData?.healthScore >= 90
              ? 'text-green-600'
              : performanceData?.healthScore >= 70
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}>
            {performanceData?.healthScore || 0}%
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tiempo de Carga Promedio"
          value={performanceData?.avgLoadTime || 0}
          format="duration"
          icon={Clock}
          color={performanceData?.avgLoadTime < 2000 ? 'success' : 'warning'}
          loading={loading}
        />
        <MetricCard
          title="Tiempo de API Promedio"
          value={performanceData?.avgApiResponseTime || 0}
          format="duration"
          icon={Server}
          color={performanceData?.avgApiResponseTime < 500 ? 'success' : 'warning'}
          loading={loading}
        />
        <MetricCard
          title="Errores Totales"
          value={performanceData?.totalErrors || 0}
          icon={AlertTriangle}
          color="danger"
          loading={loading}
        />
        <MetricCard
          title="Tasa de Crash"
          value={crashRate}
          format="percentage"
          icon={XOctagon}
          color={crashRateStatus}
          loading={loading}
        />
      </div>

      {/* Performance Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Cargas Rápidas (&lt;1s)</h4>
            <span className="text-2xl font-bold text-green-600">
              {performanceData?.fastLoads || 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${performanceData?.fastLoads || 0}%` }}
            />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Cargas Moderadas (1-3s)</h4>
            <span className="text-2xl font-bold text-yellow-600">
              {performanceData?.moderateLoads || 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${performanceData?.moderateLoads || 0}%` }}
            />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Cargas Lentas (&gt;3s)</h4>
            <span className="text-2xl font-bold text-red-600">
              {performanceData?.slowLoads || 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${performanceData?.slowLoads || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Over Time */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento en el Tiempo
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}ms`}
            />
            <Tooltip
              formatter={(value, name) => [
                formatDuration(value),
                name === 'avgLoadTime' ? 'Tiempo de Carga' : 'Tiempo de API',
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="avgLoadTime"
              name="Tiempo de Carga"
              stroke="#2c3b95"
              fill="#2c3b95"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="avgApiTime"
              name="Tiempo de API"
              stroke="#30bce1"
              fill="#30bce1"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Errors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Errores
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="type"
              >
                {errorDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={ERROR_COLORS[entry.type] || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('es-PE').format(value)}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {errorDistribution.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ERROR_COLORS[entry.type] || COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">
                  {entry.type}: {new Intl.NumberFormat('es-PE').format(entry.count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Timeline */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Errores en el Tiempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="errors" name="Errores" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="crashes" name="Crashes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Slow Endpoints Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Endpoints Más Lentos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Llamadas
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Tiempo Promedio
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  P95
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Tasa de Error
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {slowEndpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        endpoint.method === 'GET'
                          ? 'bg-green-100 text-green-700'
                          : endpoint.method === 'POST'
                          ? 'bg-blue-100 text-blue-700'
                          : endpoint.method === 'PUT'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {endpoint.method || 'GET'}
                      </span>
                      <span className="font-mono text-sm text-gray-900">
                        {endpoint.path}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {new Intl.NumberFormat('es-PE').format(endpoint.calls || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      endpoint.avgTime < 500
                        ? 'text-green-600'
                        : endpoint.avgTime < 1000
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {formatDuration(endpoint.avgTime || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      endpoint.p95 < 1000
                        ? 'text-green-600'
                        : endpoint.p95 < 3000
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {formatDuration(endpoint.p95 || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      endpoint.errorRate < 1
                        ? 'text-green-600'
                        : endpoint.errorRate < 5
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {(endpoint.errorRate || 0).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
              {slowEndpoints.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay datos de endpoints disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Performance Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento por Plataforma
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData?.platformComparison || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}ms`}
            />
            <Tooltip
              formatter={(value, name) => [
                formatDuration(value),
                name === 'avgLoadTime' ? 'Carga' : 'API',
              ]}
            />
            <Legend />
            <Bar dataKey="avgLoadTime" name="Tiempo de Carga" fill="#2c3b95" />
            <Bar dataKey="avgApiTime" name="Tiempo de API" fill="#30bce1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
