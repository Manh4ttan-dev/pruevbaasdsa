import React, { useState, useEffect } from 'react'
import { dashboardService, filterService } from '../../services/analyticsApi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Clock,
  Users,
  Eye,
  Building,
  GraduationCap,
  TrendingUp,
  RefreshCw,
  Filter,
} from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      )}
    </div>
  </div>
)

const formatDuration = (ms) => {
  if (!ms || ms === 0) return '0s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const UserBehaviorAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [behaviorData, setBehaviorData] = useState(null)
  const [filters, setFilters] = useState({
    systemId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    role: '',
  })
  const [filterOptions, setFilterOptions] = useState({
    systems: [],
    roles: [],
  })
  const [activeTab, setActiveTab] = useState('pages')

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    loadData()
  }, [filters])

  const loadFilterOptions = async () => {
    try {
      const response = await filterService.getFilterOptions()
      setFilterOptions({
        systems: response.data.systems || [],
        roles: response.data.roles || [],
      })
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        ...(filters.systemId && { systemId: filters.systemId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.role && { role: filters.role }),
      }
      const response = await dashboardService.getUserBehavior(params)
      setBehaviorData(response.data)
    } catch (error) {
      console.error('Error loading user behavior data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'pages', label: 'Tiempo en Pagina', icon: Clock },
    { id: 'roles', label: 'Por Rol', icon: Users },
    { id: 'users', label: 'Top Usuarios', icon: Eye },
    { id: 'faculties', label: 'Facultades', icon: Building },
    { id: 'careers', label: 'Carreras', icon: GraduationCap },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Behavior Analytics</h1>
          <p className="text-gray-600 mt-1">Analisis estilo Google Analytics - Tiempo en pagina, usuarios y segmentacion</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sistema</label>
            <select
              value={filters.systemId}
              onChange={(e) => setFilters({ ...filters, systemId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              {filterOptions.systems.map((sys) => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              {filterOptions.roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {behaviorData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Paginas Unicas"
            value={behaviorData.pageStats?.length || 0}
            subtitle="paginas visitadas"
            icon={Eye}
            color="blue"
          />
          <MetricCard
            title="Tiempo Promedio"
            value={formatDuration(behaviorData.pageStats?.reduce((acc, p) => acc + (p.avgTimeOnPage || 0), 0) / (behaviorData.pageStats?.length || 1))}
            subtitle="por pagina"
            icon={Clock}
            color="green"
          />
          <MetricCard
            title="Usuarios Activos"
            value={behaviorData.userStats?.length || 0}
            subtitle="en el periodo"
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Roles Activos"
            value={behaviorData.roleStats?.length || 0}
            subtitle="roles diferentes"
            icon={TrendingUp}
            color="orange"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Pages Tab */}
          {activeTab === 'pages' && behaviorData?.pageStats && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tiempo en Pagina</h3>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={behaviorData.pageStats.slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => formatDuration(v)} />
                    <YAxis dataKey="page" type="category" width={200} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'avgTimeOnPage' ? formatDuration(value) : value,
                        name === 'avgTimeOnPage' ? 'Tiempo Promedio' : 'Vistas',
                      ]}
                    />
                    <Bar dataKey="avgTimeOnPage" fill="#3b82f6" name="Tiempo Promedio" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagina</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vistas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Promedio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {behaviorData.pageStats.map((page, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.page}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{page.views?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{page.uniqueUsers?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDuration(page.avgTimeOnPage)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDuration(page.totalTimeOnPage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && behaviorData?.roleStats && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actividad por Rol</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={behaviorData.roleStats}
                        dataKey="events"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ role, percent }) => `${role} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {behaviorData.roleStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eventos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {behaviorData.roleStats.map((role, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            {role.role || 'Sin rol'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{role.users?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{role.events?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{role.sessions?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && behaviorData?.userStats && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top 50 Usuarios Mas Activos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eventos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paginas Vistas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ultima Actividad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {behaviorData.userStats.slice(0, 50).map((user, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.userId}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {user.role || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.events?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.sessions?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.pageViews?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Faculties Tab */}
          {activeTab === 'faculties' && behaviorData?.facultyStats && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actividad por Facultad</h3>
              {behaviorData.facultyStats.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay datos de facultades disponibles.</p>
                  <p className="text-sm mt-2">Asegurate de enviar facultyId y facultyName en los eventos.</p>
                </div>
              ) : (
                <>
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={behaviorData.facultyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="facultyName" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#3b82f6" name="Usuarios" />
                        <Bar dataKey="events" fill="#10b981" name="Eventos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facultad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eventos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {behaviorData.facultyStats.map((faculty, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{faculty.facultyName || faculty.facultyId}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{faculty.users?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{faculty.events?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{faculty.sessions?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Careers Tab */}
          {activeTab === 'careers' && behaviorData?.careerStats && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actividad por Carrera</h3>
              {behaviorData.careerStats.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay datos de carreras disponibles.</p>
                  <p className="text-sm mt-2">Asegurate de enviar careerId y careerName en los eventos.</p>
                </div>
              ) : (
                <>
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={behaviorData.careerStats.slice(0, 15)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="careerName" type="category" width={200} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="users" fill="#8b5cf6" name="Usuarios" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrera</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eventos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {behaviorData.careerStats.map((career, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{career.careerName || career.careerId}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{career.users?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{career.events?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{career.sessions?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserBehaviorAnalytics
