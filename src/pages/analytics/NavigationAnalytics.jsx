import { useState, useEffect, useCallback } from 'react'
import {
  Monitor,
  ArrowRight,
  MousePointer,
  Clock,
  TrendingUp,
  Layers,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Sankey,
  Rectangle,
  Layer,
} from 'recharts'
import { subDays } from 'date-fns'

import MetricCard from '../../components/analytics/MetricCard'
import DateRangePicker from '../../components/analytics/DateRangePicker'
import { dashboardService } from '../../services/analyticsApi'

// Custom node for Sankey diagram
const SankeyNode = ({ x, y, width, height, index, payload }) => {
  const colors = ['#2c3b95', '#30bce1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={colors[index % colors.length]}
      fillOpacity={0.9}
    />
  )
}

// Custom link for Sankey diagram
const SankeyLink = ({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth }) => {
  return (
    <path
      d={`
        M${sourceX},${sourceY}
        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
      `}
      fill="none"
      stroke="#94a3b8"
      strokeWidth={linkWidth}
      strokeOpacity={0.3}
    />
  )
}

export default function NavigationAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })

  const [navigationData, setNavigationData] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }

      const response = await dashboardService.getNavigation(params)
      setNavigationData(response.data)
    } catch (error) {
      console.error('Error loading navigation data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const topScreens = navigationData?.topScreens || []
  const navigationFlows = navigationData?.flows || []

  // Prepare Sankey data if flows exist
  const sankeyData = navigationFlows.length > 0 ? {
    nodes: [...new Set(navigationFlows.flatMap(f => [f.from, f.to]))].map(name => ({ name })),
    links: navigationFlows.map(f => ({
      source: [...new Set(navigationFlows.flatMap(fl => [fl.from, fl.to]))].indexOf(f.from),
      target: [...new Set(navigationFlows.flatMap(fl => [fl.from, fl.to]))].indexOf(f.to),
      value: f.count,
    })),
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Navegación</h1>
          <p className="text-gray-500 mt-1">
            Patrones de navegación y flujos de usuario
          </p>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vistas de Pantalla"
          value={navigationData?.totalScreenViews || 0}
          icon={Monitor}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Pantallas Únicas"
          value={navigationData?.uniqueScreens || 0}
          icon={Layers}
          color="secondary"
          loading={loading}
        />
        <MetricCard
          title="Promedio por Sesión"
          value={navigationData?.avgScreensPerSession || 0}
          format="number"
          icon={MousePointer}
          color="info"
          loading={loading}
        />
        <MetricCard
          title="Tiempo Promedio en Pantalla"
          value={navigationData?.avgTimeOnScreen || 0}
          format="duration"
          icon={Clock}
          color="warning"
          loading={loading}
        />
      </div>

      {/* Top Screens */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pantallas Más Visitadas
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topScreens.slice(0, 15)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="screen"
              width={200}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [
                new Intl.NumberFormat('es-PE').format(value),
                'Vistas',
              ]}
            />
            <Bar dataKey="views" name="Vistas" fill="#2c3b95" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Navigation Flow Visualization */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Flujos de Navegación
        </h3>
        {sankeyData && sankeyData.nodes.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <Sankey
              data={sankeyData}
              node={<SankeyNode />}
              link={<SankeyLink />}
              nodePadding={50}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay suficientes datos de flujo para mostrar</p>
              <p className="text-sm mt-1">Los flujos se generan con más navegación de usuarios</p>
            </div>
          </div>
        )}
      </div>

      {/* Entry and Exit Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Points */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Puntos de Entrada
          </h3>
          <div className="space-y-3">
            {(navigationData?.entryPoints || []).slice(0, 8).map((point, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {point.screen}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${navigationData?.totalSessions > 0
                          ? (point.count / navigationData.totalSessions) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {new Intl.NumberFormat('es-PE').format(point.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exit Points */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Puntos de Salida
          </h3>
          <div className="space-y-3">
            {(navigationData?.exitPoints || []).slice(0, 8).map((point, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {point.screen}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${navigationData?.totalSessions > 0
                          ? (point.count / navigationData.totalSessions) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {new Intl.NumberFormat('es-PE').format(point.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Transitions Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Transiciones Entre Pantallas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Desde
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase">
                  →
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                  Hacia
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  Transiciones
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {navigationFlows.slice(0, 20).map((flow, index) => {
                const totalFlows = navigationFlows.reduce((sum, f) => sum + f.count, 0)
                const percentage = totalFlows > 0 ? ((flow.count / totalFlows) * 100).toFixed(1) : 0
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {flow.from}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {flow.to}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {new Intl.NumberFormat('es-PE').format(flow.count)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {navigationFlows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay datos de transiciones disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
