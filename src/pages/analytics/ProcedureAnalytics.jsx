import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
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
import FunnelChart from '../../components/analytics/FunnelChart'
import { dashboardService, funnelService } from '../../services/analyticsApi'

export default function ProcedureAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })

  const [procedureData, setProcedureData] = useState(null)
  const [customFunnel, setCustomFunnel] = useState(null)
  const [selectedProcedure, setSelectedProcedure] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }

      const [proceduresRes, funnelRes] = await Promise.all([
        dashboardService.getProcedures(params),
        funnelService.analyzeFunnel(
          ['procedure_started', 'procedure_step_completed', 'procedure_document_uploaded', 'procedure_submitted'],
          params
        ),
      ])

      setProcedureData(proceduresRes.data)
      setCustomFunnel(funnelRes.data)
    } catch (error) {
      console.error('Error loading procedure data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate overall conversion
  const overallConversion = procedureData?.totalStarted > 0
    ? ((procedureData.totalCompleted / procedureData.totalStarted) * 100).toFixed(1)
    : 0

  const abandonmentRate = procedureData?.totalStarted > 0
    ? ((procedureData.totalAbandoned / procedureData.totalStarted) * 100).toFixed(1)
    : 0

  // Prepare procedure comparison data
  const procedureComparisonData = procedureData?.procedures?.slice(0, 10).map(proc => ({
    name: proc.procedureType.length > 15
      ? proc.procedureType.substring(0, 15) + '...'
      : proc.procedureType,
    started: proc.started,
    completed: proc.completed,
    abandoned: proc.abandoned,
    conversionRate: proc.conversionRate,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Procedimientos</h1>
          <p className="text-gray-500 mt-1">
            Funnels de conversión y análisis de abandono de procedimientos
          </p>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Procedimientos Iniciados"
          value={procedureData?.totalStarted || 0}
          icon={FileText}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Procedimientos Completados"
          value={procedureData?.totalCompleted || 0}
          icon={CheckCircle}
          color="success"
          loading={loading}
        />
        <MetricCard
          title="Procedimientos Abandonados"
          value={procedureData?.totalAbandoned || 0}
          icon={XCircle}
          color="danger"
          loading={loading}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={parseFloat(overallConversion)}
          format="percentage"
          icon={TrendingUp}
          color="info"
          loading={loading}
        />
      </div>

      {/* General Funnel */}
      {customFunnel?.steps && (
        <FunnelChart
          title="Funnel General de Procedimientos"
          steps={customFunnel.steps}
        />
      )}

      {/* Procedure Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comparación de Procedimientos
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={procedureComparisonData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="started" name="Iniciados" fill="#2c3b95" />
            <Bar dataKey="completed" name="Completados" fill="#10b981" />
            <Bar dataKey="abandoned" name="Abandonados" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Procedure Funnels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {procedureData?.procedures?.slice(0, 4).map((procedure) => (
          <div key={procedure.procedureType} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {procedure.procedureType}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                procedure.conversionRate >= 70
                  ? 'bg-green-100 text-green-800'
                  : procedure.conversionRate >= 40
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {procedure.conversionRate}% conversión
              </span>
            </div>

            {/* Mini funnel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Iniciados</span>
                <span className="font-medium">{procedure.started}</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completados</span>
                <span className="font-medium text-green-600">{procedure.completed}</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${procedure.conversionRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Abandonados</span>
                <span className="font-medium text-red-600">{procedure.abandoned}</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${procedure.abandonmentRate}%` }}
                />
              </div>
            </div>

            {procedure.avgDuration > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Tiempo promedio: {Math.round(procedure.avgDuration / 60)} minutos
                </span>
              </div>
            )}

            {/* Step funnel if available */}
            {procedure.funnel?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Pasos del procedimiento</p>
                <div className="space-y-2">
                  {procedure.funnel.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {step.step}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${procedure.started > 0 ? (step.users / procedure.started) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{step.users}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alert for high abandonment */}
      {parseFloat(abandonmentRate) > 30 && (
        <div className="card p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Alta tasa de abandono detectada
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                El {abandonmentRate}% de los procedimientos están siendo abandonados.
                Considera revisar los pasos con mayor tasa de abandono y optimizar la experiencia del usuario.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
