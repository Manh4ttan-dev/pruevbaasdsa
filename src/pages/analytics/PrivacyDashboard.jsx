import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
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
import { dashboardService, privacyService } from '../../services/analyticsApi'

const COLORS = ['#10b981', '#ef4444']

export default function PrivacyDashboard() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })

  const [privacyData, setPrivacyData] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }

      const response = await dashboardService.getPrivacy(params)
      setPrivacyData(response.data)
    } catch (error) {
      console.error('Error loading privacy data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Prepare consent pie data
  const consentData = [
    { name: 'Con Consentimiento', value: privacyData?.totalWithConsent || 0 },
    { name: 'Sin Consentimiento', value: privacyData?.totalWithoutConsent || 0 },
  ]

  // Net consent change
  const netConsentChange = (privacyData?.consentsGranted || 0) - (privacyData?.consentsRevoked || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacidad & Consentimiento</h1>
          <p className="text-gray-500 mt-1">
            Cumplimiento con Ley 29733 de Protección de Datos Personales
          </p>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Compliance Alert */}
      <div className={`card p-4 ${
        (privacyData?.consentRate || 0) >= 80
          ? 'bg-green-50 border border-green-200'
          : (privacyData?.consentRate || 0) >= 50
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <Shield className={`h-6 w-6 ${
            (privacyData?.consentRate || 0) >= 80
              ? 'text-green-600'
              : (privacyData?.consentRate || 0) >= 50
              ? 'text-yellow-600'
              : 'text-red-600'
          }`} />
          <div>
            <h4 className={`font-medium ${
              (privacyData?.consentRate || 0) >= 80
                ? 'text-green-800'
                : (privacyData?.consentRate || 0) >= 50
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {(privacyData?.consentRate || 0) >= 80
                ? 'Buen nivel de cumplimiento'
                : (privacyData?.consentRate || 0) >= 50
                ? 'Nivel de cumplimiento moderado'
                : 'Nivel de cumplimiento bajo'}
            </h4>
            <p className={`text-sm ${
              (privacyData?.consentRate || 0) >= 80
                ? 'text-green-700'
                : (privacyData?.consentRate || 0) >= 50
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              El {privacyData?.consentRate?.toFixed(1) || 0}% de los eventos tienen consentimiento de analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tasa de Consentimiento"
          value={privacyData?.consentRate || 0}
          format="percentage"
          icon={Shield}
          color={privacyData?.consentRate >= 80 ? 'success' : 'warning'}
          loading={loading}
        />
        <MetricCard
          title="Consentimientos Otorgados"
          value={privacyData?.consentsGranted || 0}
          icon={CheckCircle}
          color="success"
          loading={loading}
        />
        <MetricCard
          title="Consentimientos Revocados"
          value={privacyData?.consentsRevoked || 0}
          icon={XCircle}
          color="danger"
          loading={loading}
        />
        <MetricCard
          title="Cambio Neto"
          value={netConsentChange}
          prefix={netConsentChange >= 0 ? '+' : ''}
          icon={netConsentChange >= 0 ? TrendingUp : TrendingDown}
          color={netConsentChange >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
      </div>

      {/* Data Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Solicitudes de Exportación"
          value={privacyData?.exportRequests || 0}
          icon={Download}
          color="info"
          loading={loading}
        />
        <MetricCard
          title="Solicitudes de Eliminación"
          value={privacyData?.deletionRequests || 0}
          icon={Trash2}
          color="warning"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Consentimiento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={consentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {consentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('es-PE').format(value)}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                Con Consentimiento ({new Intl.NumberFormat('es-PE').format(privacyData?.totalWithConsent || 0)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">
                Sin Consentimiento ({new Intl.NumberFormat('es-PE').format(privacyData?.totalWithoutConsent || 0)})
              </span>
            </div>
          </div>
        </div>

        {/* Consent Changes */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cambios de Consentimiento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Otorgados', value: privacyData?.consentsGranted || 0 },
                { name: 'Revocados', value: privacyData?.consentsRevoked || 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2c3b95"
                radius={[4, 4, 0, 0]}
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance Information */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de Cumplimiento - Ley 29733
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Derechos del Usuario</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                Derecho de acceso a sus datos personales
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                Derecho de rectificación de datos inexactos
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                Derecho de cancelación (eliminación)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                Derecho de oposición al tratamiento
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Medidas Implementadas</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                Consentimiento explícito requerido para analytics
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                Anonimización de datos sin consentimiento
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                Exportación de datos en formato portable
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                Eliminación completa bajo solicitud
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warning for low consent */}
      {(privacyData?.consentRate || 0) < 50 && (
        <div className="card p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">
                Atención: Nivel bajo de consentimiento
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Menos del 50% de los usuarios han otorgado consentimiento para analytics.
                Considera revisar el flujo de solicitud de consentimiento y la claridad
                de la política de privacidad.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
