import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  BookOpen,
  FileCheck,
  Users,
  Calendar,
  Download,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  Trash2,
  UserPlus,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const COLORS = ['#2c3b95', '#30bce1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AcademicAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Últimos 30 días',
  })
  const [roleFilter, setRoleFilter] = useState('all')

  const [academicData, setAcademicData] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      }

      const response = await dashboardService.getAcademic(params)
      setAcademicData(response.data)
    } catch (error) {
      console.error('Error loading academic data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, roleFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Event type distribution
  const eventTypeData = academicData?.eventsByType || []

  // Activity over time
  const activityTimeline = academicData?.activityTimeline || []

  // Top courses/materials
  const topCourses = academicData?.topCourses || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis Académico</h1>
          <p className="text-gray-500 mt-1">
            Métricas de actividad académica de profesores y estudiantes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos los Roles</option>
            <option value="estudiante">Estudiantes</option>
            <option value="profesor">Profesores</option>
          </select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Notas Consultadas"
          value={academicData?.studentMetrics?.gradesViewed || 0}
          icon={GraduationCap}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Materiales Descargados"
          value={academicData?.studentMetrics?.materialsDownloaded || 0}
          icon={Download}
          color="secondary"
          loading={loading}
        />
        <MetricCard
          title="Tareas Creadas"
          value={academicData?.professorMetrics?.tasksCreated || 0}
          icon={FileCheck}
          color="success"
          loading={loading}
        />
        <MetricCard
          title="Asistencias Marcadas"
          value={academicData?.professorMetrics?.attendanceMarked || 0}
          icon={Calendar}
          color="info"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Encuestas Completadas"
          value={academicData?.studentMetrics?.surveysCompleted || 0}
          icon={ClipboardList}
          color="warning"
          loading={loading}
        />
        <MetricCard
          title="Cursos Matriculados"
          value={academicData?.studentMetrics?.coursesEnrolled || 0}
          icon={UserPlus}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Encuestas Iniciadas"
          value={academicData?.studentMetrics?.surveysStarted || 0}
          format="number"
          icon={ClipboardList}
          color="secondary"
          loading={loading}
        />
      </div>

      {/* Forum Metrics */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Actividad en el Foro
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Posts Creados</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('es-PE').format(academicData?.forumMetrics?.postsCreated || 0)}
            </span>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Respuestas</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('es-PE').format(academicData?.forumMetrics?.repliesCreated || 0)}
            </span>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Temas Eliminados</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('es-PE').format(academicData?.forumMetrics?.topicsDeleted || 0)}
            </span>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Posts Eliminados</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('es-PE').format(academicData?.forumMetrics?.postsDeleted || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Académica en el Tiempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="gradesViewed"
                name="Notas Consultadas"
                stroke="#2c3b95"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="materialsDownloaded"
                name="Materiales"
                stroke="#30bce1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="tasksCreated"
                name="Tareas"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Type Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Tipo de Evento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="eventType"
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

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {eventTypeData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{entry.eventType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Courses/Materials */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cursos/Materiales Más Accedidos
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCourses.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={200}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" name="Visualizaciones" fill="#2c3b95" />
            <Bar dataKey="downloads" name="Descargas" fill="#30bce1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Role Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Metrics */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Métricas de Estudiantes
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Consultas de Notas</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.studentMetrics?.gradesViewed || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Materiales Descargados</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.studentMetrics?.materialsDownloaded || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Tareas Entregadas</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.studentMetrics?.tasksSubmitted || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Encuestas Completadas</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.studentMetrics?.surveysCompleted || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Professor Metrics */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Métricas de Profesores
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Tareas Creadas</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.professorMetrics?.tasksCreated || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Asistencias Marcadas</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.professorMetrics?.attendanceMarked || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Materiales Subidos</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.professorMetrics?.materialsUploaded || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Notas Asignadas</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('es-PE').format(academicData?.professorMetrics?.gradesAssigned || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity by Day of Week */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad por Día de la Semana
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={academicData?.activityByDayOfWeek || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="events" name="Eventos" fill="#2c3b95" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
