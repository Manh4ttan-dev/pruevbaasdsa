import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'
import { Database, Activity, AlertTriangle, Clock } from 'lucide-react'
import { dataAuditService, accessAuditService } from '../services/api'
import { format, subDays } from 'date-fns'

const Dashboard = () => {
  const [dataStats, setDataStats] = useState({ INSERT: 0, UPDATE: 0, DELETE: 0 })
  const [accessStats, setAccessStats] = useState({ errors4xx: 0, errors5xx: 0 })
  const [topUsers, setTopUsers] = useState([])
  const [topTables, setTopTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = subDays(endDate, 7)

      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }

      const [dataOps, errorStats, users, tables] = await Promise.all([
        dataAuditService.getStatsByOperation(params),
        accessAuditService.getErrorStats(params),
        dataAuditService.getStatsByUser({ ...params, limit: 5 }),
        dataAuditService.getStatsByTable({ ...params }),
      ])

      setDataStats(dataOps.data)
      setAccessStats(errorStats.data)
      setTopUsers(users.data)
      setTopTables(tables.data.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const operationChartData = [
    { name: 'INSERT', value: dataStats.INSERT, color: '#10b981' },
    { name: 'UPDATE', value: dataStats.UPDATE, color: '#3b82f6' },
    { name: 'DELETE', value: dataStats.DELETE, color: '#ef4444' },
  ]

  const errorChartData = [
    { name: '4xx Errors', value: accessStats.errors4xx, color: '#f59e0b' },
    { name: '5xx Errors', value: accessStats.errors5xx, color: '#ef4444' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-600 mt-1">Resumen de los últimos 7 días</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Cambios"
          value={dataStats.INSERT + dataStats.UPDATE + dataStats.DELETE}
          subtitle="Modificaciones de datos"
          icon={Database}
          color="main"
        />
        <StatCard
          title="Registros de Acceso"
          value={accessStats.errors4xx + accessStats.errors5xx}
          subtitle="Peticiones con error"
          icon={Activity}
          color="accent"
        />
        <StatCard
          title="Errores 4xx"
          value={accessStats.errors4xx}
          subtitle="Errores de cliente"
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Errores 5xx"
          value={accessStats.errors5xx}
          subtitle="Errores de servidor"
          icon={Clock}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Operations Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribución de Operaciones de Datos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={operationChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {operationChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Errors Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Errores HTTP</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2c3b95" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Usuarios Más Activos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Cambios</th>
                  <th className="table-header">Inserciones</th>
                  <th className="table-header">Actualizaciones</th>
                  <th className="table-header">Eliminaciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="table-cell font-medium">{user.userName}</td>
                    <td className="table-cell">{user.total}</td>
                    <td className="table-cell text-green-600">{user.inserts}</td>
                    <td className="table-cell text-blue-600">{user.updates}</td>
                    <td className="table-cell text-red-600">{user.deletes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Tables */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tablas Más Modificadas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Tabla</th>
                  <th className="table-header">Cambios</th>
                  <th className="table-header">Inserciones</th>
                  <th className="table-header">Actualizaciones</th>
                  <th className="table-header">Eliminaciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topTables.map((table, index) => (
                  <tr key={index}>
                    <td className="table-cell font-medium">{table.tableName}</td>
                    <td className="table-cell">{table.total}</td>
                    <td className="table-cell text-green-600">{table.inserts}</td>
                    <td className="table-cell text-blue-600">{table.updates}</td>
                    <td className="table-cell text-red-600">{table.deletes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
