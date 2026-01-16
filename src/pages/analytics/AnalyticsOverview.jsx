import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Activity,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  Building2,
  Globe,
  Smartphone,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

import MetricCard from '../../components/analytics/MetricCard'
import DateRangePicker from '../../components/analytics/DateRangePicker'
import DimensionFilter from '../../components/analytics/DimensionFilter'
import { dashboardService, userAnalyticsService, timeSeriesService, filterService } from '../../services/analyticsApi'

const COLORS = ['#2c3b95', '#30bce1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const REFRESH_INTERVAL = 60000 // 1 minute

export default function AnalyticsOverview() {
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 6).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 7 días',
  })
  const [filters, setFilters] = useState({})
  const [filterOptions, setFilterOptions] = useState([])
  const [loadingFilters, setLoadingFilters] = useState(true)

  // Data
  const [overview, setOverview] = useState(null)
  const [activeUsers, setActiveUsers] = useState({ dau: 0, wau: 0, mau: 0 })
  const [timeSeries, setTimeSeries] = useState([])

  // Load filter options from backend
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await filterService.getFilterOptions()
        const data = response.data

        // Transform backend response to filter format
        const dynamicFilters = []

        if (data.systems && data.systems.length > 0) {
          dynamicFilters.push({
            name: 'systemId',
            label: 'Sistema',
            icon: Building2,
            options: data.systems.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            })),
          })
        }

        if (data.roles && data.roles.length > 0) {
          dynamicFilters.push({
            name: 'role',
            label: 'Rol',
            icon: Users,
            options: data.roles.map((r) => ({
              value: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
            })),
          })
        }

        if (data.platforms && data.platforms.length > 0) {
          dynamicFilters.push({
            name: 'platform',
            label: 'Plataforma',
            icon: Smartphone,
            options: data.platforms.map((p) => ({
              value: p,
              label: p.toUpperCase(),
            })),
          })
        }

        if (data.countries && data.countries.length > 0) {
          dynamicFilters.push({
            name: 'country',
            label: 'País',
            icon: Globe,
            options: data.countries.map((c) => ({
              value: c,
              label: c,
            })),
          })
        }

        setFilterOptions(dynamicFilters)
      } catch (error) {
        console.error('Error loading filter options:', error)
        setFilterOptions([])
      } finally {
        setLoadingFilters(false)
      }
    }

    loadFilterOptions()
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters,
      }

      const [overviewRes, dauRes, wauRes, mauRes, timeSeriesRes] = await Promise.all([
        dashboardService.getOverview(params),
        userAnalyticsService.getActiveUsers({ ...params, period: 'dau' }),
        userAnalyticsService.getActiveUsers({ ...params, period: 'wau' }),
        userAnalyticsService.getActiveUsers({ ...params, period: 'mau' }),
        timeSeriesService.getTimeSeries({ ...params, interval: 'day' }),
      ])

      setOverview(overviewRes.data)
      setActiveUsers({
        dau: dauRes.data.activeUsers || 0,
        wau: wauRes.data.activeUsers || 0,
        mau: mauRes.data.activeUsers || 0,
      })
      setTimeSeries(timeSeriesRes.data.timeline || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(loadData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [autoRefresh, loadData])

  // Prepare chart data
  const eventTypeData = overview?.eventTypeCounts
    ? Object.entries(overview.eventTypeCounts).map(([name, count]) => ({
        name: name.replace('_', ' '),
        value: count,
      }))
    : []

  const topEventsData = overview?.topEvents?.slice(0, 8) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-500 mt-1">
            Visión general del comportamiento de usuarios y eventos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      {loadingFilters ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Cargando filtros...
        </div>
      ) : filterOptions.length > 0 ? (
        <DimensionFilter
          filters={filterOptions}
          value={filters}
          onChange={setFilters}
        />
      ) : (
        <div className="text-sm text-gray-500">
          No hay filtros disponibles. Los filtros aparecerán cuando haya datos de eventos.
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Última actualización: {format(lastUpdated, 'HH:mm:ss', { locale: es })}
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Auto-actualizar cada minuto
          </label>
        </div>
      )}

      {/* Active Users Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Usuarios Activos Hoy (DAU)"
          value={activeUsers.dau}
          icon={Users}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Usuarios Activos Semana (WAU)"
          value={activeUsers.wau}
          icon={TrendingUp}
          color="secondary"
          loading={loading}
        />
        <MetricCard
          title="Usuarios Activos Mes (MAU)"
          value={activeUsers.mau}
          icon={BarChart3}
          color="info"
          loading={loading}
        />
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Eventos"
          value={overview?.totalEvents || 0}
          icon={Activity}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Usuarios Únicos"
          value={overview?.uniqueUsers || 0}
          icon={Users}
          color="secondary"
          loading={loading}
        />
        <MetricCard
          title="Sesiones"
          value={overview?.uniqueSessions || 0}
          icon={Zap}
          color="success"
          loading={loading}
        />
        <MetricCard
          title="Tiempo Promedio Sesión"
          value={overview?.avgSessionDuration || 0}
          format="duration"
          icon={Clock}
          color="info"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users & Events Over Time */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad en el Tiempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2c3b95" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2c3b95" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30bce1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#30bce1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  try {
                    return format(new Date(value), 'dd/MM', { locale: es })
                  } catch {
                    return value
                  }
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                formatter={(value, name) => [
                  new Intl.NumberFormat('es-PE').format(value),
                  name === 'users' ? 'Usuarios' : name === 'events' ? 'Eventos' : 'Sesiones',
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                name="Usuarios"
                stroke="#2c3b95"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
              <Area
                type="monotone"
                dataKey="events"
                name="Eventos"
                stroke="#30bce1"
                fillOpacity={1}
                fill="url(#colorEvents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Type */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eventos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('es-PE').format(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Events */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Eventos Más Frecuentes
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topEventsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat('es-PE').format(value)}
            />
            <Bar dataKey="count" fill="#2c3b95" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Event Counts Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle de Eventos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Evento
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overview?.topEvents?.map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {new Intl.NumberFormat('es-PE').format(event.count)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {overview.totalEvents > 0
                      ? ((event.count / overview.totalEvents) * 100).toFixed(1)
                      : 0}
                    %
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
