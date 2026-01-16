import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Clock,
  LogIn,
  LogOut,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { subDays } from 'date-fns'

import MetricCard from '../../components/analytics/MetricCard'
import DateRangePicker from '../../components/analytics/DateRangePicker'
import { dashboardService } from '../../services/analyticsApi'

const COLORS = ['#2c3b95', '#30bce1', '#10b981', '#f59e0b', '#ef4444']

const PLATFORM_ICONS = {
  web: Monitor,
  ios: Smartphone,
  android: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
}

export default function SessionAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 6).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 7 días',
  })

  const [sessionData, setSessionData] = useState(null)
  const [authData, setAuthData] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }

      const [sessionsRes, authRes] = await Promise.all([
        dashboardService.getSessions(params),
        dashboardService.getAuth(params),
      ])

      setSessionData(sessionsRes.data)
      setAuthData(authRes.data)
    } catch (error) {
      console.error('Error loading session data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Prepare platform data for chart
  const platformData = sessionData?.sessionsByPlatform || []

  // Prepare hourly data for heatmap-style chart
  const hourlyData = sessionData?.sessionsByHour || []

  // Prepare auth method data
  const authMethodData = authData?.methodStats || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sesiones & Autenticación</h1>
          <p className="text-gray-500 mt-1">
            Análisis de sesiones de usuario y métodos de autenticación
          </p>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Session Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sesiones"
          value={sessionData?.totalSessions || 0}
          icon={Users}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Duración Promedio"
          value={sessionData?.avgSessionDuration || 0}
          format="duration"
          icon={Clock}
          color="secondary"
          loading={loading}
        />
        <MetricCard
          title="Tasa de Rebote"
          value={sessionData?.bounceRate || 0}
          format="percentage"
          icon={LogOut}
          color="warning"
          loading={loading}
        />
        <MetricCard
          title="Tasa de Éxito Login"
          value={authData?.successRate || 0}
          format="percentage"
          icon={LogIn}
          color="success"
          loading={loading}
        />
      </div>

      {/* Auth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Intentos de Login"
          value={authData?.loginAttempts || 0}
          icon={LogIn}
          color="info"
          loading={loading}
        />
        <MetricCard
          title="Logins Exitosos"
          value={authData?.loginSuccesses || 0}
          icon={LogIn}
          color="success"
          loading={loading}
        />
        <MetricCard
          title="Logins Fallidos"
          value={authData?.loginFailures || 0}
          icon={LogOut}
          color="danger"
          loading={loading}
        />
        <MetricCard
          title="Tiempo Promedio Login"
          value={authData?.avgLoginTime || 0}
          suffix="ms"
          icon={Clock}
          color="secondary"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions by Platform */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sesiones por Plataforma
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ platform, percent }) =>
                  `${platform} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="platform"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('es-PE').format(value)}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Platform Legend with icons */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {platformData.map((item, index) => {
              const Icon = PLATFORM_ICONS[item.platform] || Monitor
              return (
                <div key={item.platform} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {item.platform}: {new Intl.NumberFormat('es-PE').format(item.count)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Auth Methods */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métodos de Autenticación
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={authMethodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="method" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="successes" name="Exitosos" fill="#10b981" stackId="a" />
              <Bar dataKey="failures" name="Fallidos" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sessions by Hour */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sesiones por Hora del Día
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12 }}
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(hour) => `${hour}:00 - ${hour}:59`}
              formatter={(value) => [
                new Intl.NumberFormat('es-PE').format(value),
                'Sesiones',
              ]}
            />
            <Bar dataKey="count" fill="#2c3b95" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Failure Reasons Table with Users */}
      {authData?.failureReasons?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Errores de Autenticación
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Razones de fallo y usuarios afectados
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                    Razón del Fallo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                    % del Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                    Usuarios Afectados
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {authData.failureReasons.map((failure, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        {failure.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {new Intl.NumberFormat('es-PE').format(failure.count)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {authData.loginFailures > 0
                        ? ((failure.count / authData.loginFailures) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {failure.users?.slice(0, 5).map((user, userIndex) => (
                          <span
                            key={userIndex}
                            className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                          >
                            {user}
                          </span>
                        ))}
                        {failure.users?.length > 5 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                            +{failure.users.length - 5} más
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
