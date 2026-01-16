import React, { useState, useEffect } from "react";
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
} from "recharts";
import StatCard from "../components/StatCard";
import { Activity, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { dataAuditService, accessAuditService } from "../services/api";
import { format, subDays } from "date-fns";

const EndpointAnalyticsPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const [interval, setInterval] = useState("hour");
  const [dataEndpoints, setDataEndpoints] = useState([]);
  const [accessEndpoints, setAccessEndpoints] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEndpointData();
  }, []);

  const loadEndpointData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate).toISOString(),
      };

      const [dataEp, accessEp, timelineData] = await Promise.all([
        dataAuditService.getStatsByEndpoint({ ...params, limit: 10 }),
        accessAuditService.getStatsByEndpoint({ ...params, limit: 10 }),
        accessAuditService.getEndpointTimeline({ ...params, interval }),
      ]);

      setDataEndpoints(dataEp.data);
      setAccessEndpoints(accessEp.data);
      setTimeline(timelineData.data);
    } catch (error) {
      console.error("Error loading endpoint data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#2c3b95",
    "#30bce1",
    "#072d3e",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const totalAccessRequests = accessEndpoints.reduce(
    (sum, ep) => sum + ep.count,
    0
  );
  const totalDataChanges = dataEndpoints.reduce((sum, ep) => sum + ep.total, 0);
  const avgResponseTime =
    accessEndpoints.reduce((sum, ep) => sum + ep.avgDuration, 0) /
    (accessEndpoints.length || 1);
  const totalErrors = accessEndpoints.reduce((sum, ep) => sum + ep.errors, 0);

  const dataEndpointChartData = dataEndpoints.map((ep) => ({
    name:
      ep.endpoint.length > 30
        ? ep.endpoint.substring(0, 30) + "..."
        : ep.endpoint,
    inserts: ep.inserts,
    updates: ep.updates,
    deletes: ep.deletes,
  }));

  const accessEndpointPieData = accessEndpoints.slice(0, 6).map((ep) => ({
    name:
      ep.endpoint.length > 20
        ? ep.endpoint.substring(0, 20) + "..."
        : ep.endpoint,
    value: ep.count,
  }));

  const topEndpointsForTimeline = accessEndpoints
    .slice(0, 5)
    .map((ep) => ep.endpoint);
  const timelineChartData = timeline.map((t) => {
    const dataPoint = {
      time: t.time.length > 16 ? t.time.substring(5) : t.time,
    };
    topEndpointsForTimeline.forEach((endpoint) => {
      dataPoint[endpoint] = t[endpoint] || 0;
    });
    return dataPoint;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Análisis de Endpoints
        </h1>
        <p className="text-gray-600 mt-1">
          Análisis completo de uso de endpoints
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Rango de Tiempo</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="datetime-local"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervalo
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="input-field w-full"
            >
              <option value="hour">Por Hora</option>
              <option value="day">Diario</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadEndpointData}
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Aplicar Filtro"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Peticiones de Acceso"
          value={totalAccessRequests}
          subtitle="Llamadas API"
          icon={Activity}
          color="main"
        />
        <StatCard
          title="Modificaciones de Datos"
          value={totalDataChanges}
          subtitle="Cambios en base de datos"
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Tiempo de Respuesta Promedio"
          value={`${Math.round(avgResponseTime)}ms`}
          subtitle="Duración promedio"
          icon={Clock}
          color="dark"
        />
        <StatCard
          title="Total de Errores"
          value={totalErrors}
          subtitle="Peticiones fallidas"
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Data Endpoints Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Principales Endpoints por Cambios de Datos
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dataEndpointChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="inserts"
                stackId="a"
                fill="#10b981"
                name="Inserciones"
              />
              <Bar
                dataKey="updates"
                stackId="a"
                fill="#3b82f6"
                name="Actualizaciones"
              />
              <Bar
                dataKey="deletes"
                stackId="a"
                fill="#ef4444"
                name="Eliminaciones"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Access Endpoints Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Principales Endpoints por Peticiones de Acceso
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={accessEndpointPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {accessEndpointPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Uso de Endpoints en el Tiempo
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timelineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            {topEndpointsForTimeline.map((endpoint, index) => (
              <Line
                key={endpoint}
                type="monotone"
                dataKey={endpoint}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Endpoints Table */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Endpoints de Cambios de Datos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Endpoint</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">INS</th>
                  <th className="table-header">ACT</th>
                  <th className="table-header">ELI</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td
                      className="table-cell font-mono text-xs"
                      title={endpoint.endpoint}
                    >
                      {endpoint.endpoint.length > 40
                        ? endpoint.endpoint.substring(0, 40) + "..."
                        : endpoint.endpoint}
                    </td>
                    <td className="table-cell font-bold">{endpoint.total}</td>
                    <td className="table-cell text-green-600">
                      {endpoint.inserts}
                    </td>
                    <td className="table-cell text-blue-600">
                      {endpoint.updates}
                    </td>
                    <td className="table-cell text-red-600">
                      {endpoint.deletes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Access Endpoints Table */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Endpoints de Acceso API
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Método</th>
                  <th className="table-header">Endpoint</th>
                  <th className="table-header">Peticiones</th>
                  <th className="table-header">Errores</th>
                  <th className="table-header">Tiempo Promedio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          endpoint.method === "GET"
                            ? "bg-blue-100 text-blue-800"
                            : endpoint.method === "POST"
                            ? "bg-green-100 text-green-800"
                            : endpoint.method === "PUT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                    </td>
                    <td
                      className="table-cell font-mono text-xs"
                      title={endpoint.endpoint}
                    >
                      {endpoint.endpoint.length > 30
                        ? endpoint.endpoint.substring(0, 30) + "..."
                        : endpoint.endpoint}
                    </td>
                    <td className="table-cell font-bold">{endpoint.count}</td>
                    <td className="table-cell text-red-600">
                      {endpoint.errors}
                    </td>
                    <td className="table-cell">
                      {Math.round(endpoint.avgDuration)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndpointAnalyticsPage;
