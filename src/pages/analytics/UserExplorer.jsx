import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  User,
  Clock,
  MapPin,
  Smartphone,
  Activity,
  Calendar,
  ChevronRight,
  Filter,
  Download,
  Shield,
  AlertCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { subDays } from 'date-fns'

import MetricCard from '../../components/analytics/MetricCard'
import DateRangePicker from '../../components/analytics/DateRangePicker'
import { userAnalyticsService, privacyService } from '../../services/analyticsApi'

const EVENT_TYPE_COLORS = {
  SESSION: 'bg-blue-100 text-blue-700',
  AUTH: 'bg-purple-100 text-purple-700',
  NAVIGATION: 'bg-green-100 text-green-700',
  PROCEDURE: 'bg-yellow-100 text-yellow-700',
  ACADEMIC: 'bg-pink-100 text-pink-700',
  PERFORMANCE: 'bg-red-100 text-red-700',
  PRIVACY: 'bg-indigo-100 text-indigo-700',
  NOTIFICATION: 'bg-orange-100 text-orange-700',
  GEO: 'bg-teal-100 text-teal-700',
}

const EVENT_TYPE_ICONS = {
  session_start: '🟢',
  session_end: '🔴',
  login_success: '✅',
  login_failed: '❌',
  screen_view: '👁️',
  procedure_started: '📋',
  procedure_completed: '✔️',
  procedure_abandoned: '⚠️',
  grade_viewed: '📊',
  material_downloaded: '📥',
  error_occurred: '🐛',
}

export default function UserExplorer() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })
  const [eventTypeFilter, setEventTypeFilter] = useState('all')

  const [searchResults, setSearchResults] = useState([])
  const [userTimeline, setUserTimeline] = useState(null)
  const [userStats, setUserStats] = useState(null)

  // Search users
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await userAnalyticsService.searchUsers({
        query: searchQuery,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      setSearchResults(response.data?.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, dateRange])

  // Load user timeline
  const loadUserTimeline = useCallback(async (userId) => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        eventType: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
      }

      const [timelineRes, statsRes] = await Promise.all([
        userAnalyticsService.getUserTimeline(userId, params),
        userAnalyticsService.getUserStats(userId, params),
      ])

      setUserTimeline(timelineRes.data)
      setUserStats(statsRes.data)
    } catch (error) {
      console.error('Error loading user timeline:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, eventTypeFilter])

  useEffect(() => {
    if (selectedUserId) {
      loadUserTimeline(selectedUserId)
    }
  }, [selectedUserId, loadUserTimeline])

  // Handle user selection
  const selectUser = (userId) => {
    setSelectedUserId(userId)
    setSearchResults([])
    setSearchQuery('')
  }

  // Export user data
  const handleExportData = async () => {
    if (!selectedUserId) return

    try {
      const response = await privacyService.exportUserData(selectedUserId)
      // Trigger download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user_data_${selectedUserId}_${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting user data:', error)
    }
  }

  // Format event parameters for display
  const formatParams = (params) => {
    if (!params || Object.keys(params).length === 0) return null
    return Object.entries(params)
      .filter(([key]) => !key.startsWith('_'))
      .slice(0, 5)
      .map(([key, value]) => (
        <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 mr-1 mb-1">
          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value).substring(0, 30)}
        </span>
      ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explorador de Usuarios</h1>
          <p className="text-gray-500 mt-1">
            Busca y analiza la actividad de usuarios individuales
          </p>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Search Bar */}
      <div className="card p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID de usuario, email o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Buscar
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            {searchResults.map((user) => (
              <button
                key={user.userId}
                onClick={() => selectUser(user.userId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.userId}</p>
                    <p className="text-sm text-gray-500">
                      {user.totalEvents} eventos • Última actividad: {user.lastActivity ? format(parseISO(user.lastActivity), 'dd MMM yyyy HH:mm', { locale: es }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile & Stats */}
      {selectedUserId && userStats && (
        <>
          {/* User Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUserId}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {userStats.role && (
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {userStats.role}
                      </span>
                    )}
                    {userStats.platform && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-4 w-4" />
                        {userStats.platform}
                      </span>
                    )}
                    {userStats.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {userStats.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Exportar Datos
                </button>
                <button
                  onClick={() => {
                    setSelectedUserId(null)
                    setUserTimeline(null)
                    setUserStats(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Consent Status */}
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              userStats.hasConsent
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {userStats.hasConsent ? (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Usuario con consentimiento de analytics activo</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>Usuario sin consentimiento - datos anonimizados</span>
                </>
              )}
            </div>
          </div>

          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Eventos"
              value={userStats.totalEvents || 0}
              icon={Activity}
              color="primary"
              loading={loading}
            />
            <MetricCard
              title="Sesiones"
              value={userStats.totalSessions || 0}
              icon={Calendar}
              color="secondary"
              loading={loading}
            />
            <MetricCard
              title="Tiempo Total"
              value={userStats.totalTime || 0}
              format="duration"
              icon={Clock}
              color="info"
              loading={loading}
            />
            <MetricCard
              title="Primera Actividad"
              value={userStats.firstSeen ? format(parseISO(userStats.firstSeen), 'dd MMM', { locale: es }) : 'N/A'}
              icon={Calendar}
              color="warning"
              loading={loading}
            />
          </div>

          {/* Event Filter */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todos los eventos</option>
                <option value="SESSION">Sesiones</option>
                <option value="AUTH">Autenticación</option>
                <option value="NAVIGATION">Navegación</option>
                <option value="PROCEDURE">Procedimientos</option>
                <option value="ACADEMIC">Académico</option>
                <option value="PERFORMANCE">Rendimiento</option>
                <option value="PRIVACY">Privacidad</option>
              </select>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Línea de Tiempo de Actividad
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {(userTimeline?.events || []).map((event, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Event Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      {EVENT_TYPE_ICONS[event.eventName] || '📌'}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{event.eventName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          EVENT_TYPE_COLORS[event.eventType] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.eventType}
                        </span>
                      </div>

                      {/* Parameters */}
                      {event.parameters && Object.keys(event.parameters).length > 0 && (
                        <div className="mt-2 flex flex-wrap">
                          {formatParams(event.parameters)}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(event.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: es })}
                        </span>
                        {event.userProperties?.platform && (
                          <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            {event.userProperties.platform}
                          </span>
                        )}
                        {event.sessionId && (
                          <span className="font-mono text-gray-400">
                            Sesión: {event.sessionId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(!userTimeline?.events || userTimeline.events.length === 0) && (
                <div className="p-12 text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay eventos para mostrar</p>
                  <p className="text-sm mt-1">Intenta ajustar el rango de fechas o filtros</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {userTimeline?.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mostrando {userTimeline.events.length} de {userTimeline.totalEvents} eventos
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={userTimeline.currentPage <= 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={userTimeline.currentPage >= userTimeline.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedUserId && searchResults.length === 0 && (
        <div className="card p-12 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Busca un usuario para explorar
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Utiliza el campo de búsqueda para encontrar usuarios por ID, email o nombre.
            Podrás ver su línea de tiempo de actividad y estadísticas detalladas.
          </p>
        </div>
      )}
    </div>
  )
}
