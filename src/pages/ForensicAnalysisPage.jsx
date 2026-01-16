import React, { useState, useEffect } from "react";
import {
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
} from "recharts";
import StatCard from "../components/StatCard";
import { Users, Globe, AlertCircle, TrendingUp } from "lucide-react";
import { accessAuditService } from "../services/api";
import { format, subDays } from "date-fns";

const ForensicAnalysisPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const [errorStats, setErrorStats] = useState({
    errors4xx: 0,
    errors5xx: 0,
    byStatus: {},
  });
  const [userStats, setUserStats] = useState([]);
  const [endpointStats, setEndpointStats] = useState([]);
  const [slowRequests, setSlowRequests] = useState([]);
  const [geoStats, setGeoStats] = useState({ byCountry: [], byCity: [] });
  const [ipStats, setIpStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForensicData();
  }, []);

  const loadForensicData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate).toISOString(),
      };

      const [errors, users, endpoints, slow, geo, ips] = await Promise.all([
        accessAuditService.getErrorStats(params),
        accessAuditService.getStatsByUser({ ...params, limit: 10 }),
        accessAuditService.getStatsByEndpoint({ ...params, limit: 10 }),
        accessAuditService.getSlowRequests({
          ...params,
          minDuration: 1000,
          limit: 10,
        }),
        accessAuditService.getGeoStats(params),
        accessAuditService.getStatsByIp({ ...params, limit: 10 }),
      ]);

      setErrorStats(errors.data);
      setUserStats(users.data);
      setEndpointStats(endpoints.data);
      setSlowRequests(slow.data);
      setGeoStats(geo.data);
      setIpStats(ips.data);
    } catch (error) {
      console.error("Error loading forensic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const errorByStatusData = Object.entries(errorStats.byStatus || {}).map(
    ([status, count]) => ({
      status: `${status}`,
      count,
    })
  );

  const COLORS = [
    "#2c3b95",
    "#30bce1",
    "#072d3e",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Forense</h1>
        <p className="text-gray-600 mt-1">
          Análisis avanzado de seguridad y rendimiento
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Rango de Tiempo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <button onClick={loadForensicData} className="btn-primary w-full">
              Aplicar Filtro
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Errores 4xx"
          value={errorStats.errors4xx}
          subtitle="Errores de cliente"
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Errores 5xx"
          value={errorStats.errors5xx}
          subtitle="Errores de servidor"
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Usuarios Activos"
          value={userStats.length}
          subtitle="Usuarios únicos"
          icon={Users}
          color="main"
        />
        <StatCard
          title="Países"
          value={geoStats.byCountry.length}
          subtitle="Distribución geográfica"
          icon={Globe}
          color="accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Error Status Codes */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Distribución de Errores por Código de Estado
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorByStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Principales Países por Acceso
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={geoStats.byCountry.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ country, percent }) =>
                  `${country}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {geoStats.byCountry.slice(0, 6).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Users by Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Usuarios Más Activos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Peticiones</th>
                  <th className="table-header">Errores</th>
                  <th className="table-header">Duración Promedio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userStats.slice(0, 10).map((user, index) => (
                  <tr key={index}>
                    <td className="table-cell font-medium">{user.userName}</td>
                    <td className="table-cell">{user.totalRequests}</td>
                    <td className="table-cell text-red-600">{user.errors}</td>
                    <td className="table-cell">
                      {Math.round(user.avgDuration)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Used Endpoints */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Endpoints Más Utilizados
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Método</th>
                  <th className="table-header">Endpoint</th>
                  <th className="table-header">Cantidad</th>
                  <th className="table-header">Errores</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {endpointStats.slice(0, 10).map((endpoint, index) => (
                  <tr key={index}>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          endpoint.method === "GET"
                            ? "bg-blue-100 text-blue-800"
                            : endpoint.method === "POST"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="table-cell font-mono text-sm">
                      {endpoint.endpoint}
                    </td>
                    <td className="table-cell">{endpoint.count}</td>
                    <td className="table-cell text-red-600">
                      {endpoint.errors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slow Requests */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Peticiones Más Lentas (más de 1 segundo)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Fecha y Hora</th>
                <th className="table-header">Método</th>
                <th className="table-header">Ruta</th>
                <th className="table-header">Usuario</th>
                <th className="table-header">Duración</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slowRequests.map((req, index) => (
                <tr key={index}>
                  <td className="table-cell">
                    {format(new Date(req.timestamp), "dd/MM/yyyy HH:mm:ss")}
                  </td>
                  <td className="table-cell">{req.requestMethod}</td>
                  <td className="table-cell font-mono text-sm">
                    {req.requestPath}
                  </td>
                  <td className="table-cell">{req.userName}</td>
                  <td className="table-cell font-bold text-red-600">
                    {req.durationMs}ms
                  </td>
                  <td className="table-cell">{req.responseStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Direcciones IP Más Activas
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Dirección IP</th>
                <th className="table-header">Peticiones</th>
                <th className="table-header">Usuarios Únicos</th>
                <th className="table-header">Errores</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ipStats.map((ip, index) => (
                <tr key={index}>
                  <td className="table-cell font-mono">{ip.ipAddress}</td>
                  <td className="table-cell">{ip.requests}</td>
                  <td className="table-cell">{ip.uniqueUsers}</td>
                  <td className="table-cell text-red-600">{ip.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForensicAnalysisPage;
