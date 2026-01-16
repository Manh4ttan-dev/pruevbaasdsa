import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import FilterPanel from "../components/FilterPanel";
import { accessAuditService } from "../services/api";
import { format } from "date-fns";

const AccessAuditPage = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    systemId: "",
    userId: "",
    userName: "",
    ipAddress: "",
    requestMethod: "",
    requestPath: "",
    responseStatus: "",
    startDate: "",
    endDate: "",
    minDuration: "",
    maxDuration: "",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  const filterConfig = [
    {
      name: "systemId",
      label: "ID del Sistema",
      type: "text",
      placeholder: "ej: intranet",
    },
    {
      name: "userName",
      label: "Nombre de Usuario",
      type: "text",
      placeholder: "ej: superadmin",
    },
    {
      name: "userId",
      label: "ID de Usuario",
      type: "text",
      placeholder: "ID de Usuario",
    },
    {
      name: "ipAddress",
      label: "Dirección IP",
      type: "text",
      placeholder: "ej: 192.168.1.100",
    },
    {
      name: "requestMethod",
      label: "Método",
      type: "select",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "PATCH", label: "PATCH" },
        { value: "DELETE", label: "DELETE" },
      ],
    },
    {
      name: "requestPath",
      label: "Ruta",
      type: "text",
      placeholder: "ej: /api/usuarios",
    },
    {
      name: "responseStatus",
      label: "Código de Estado",
      type: "number",
      placeholder: "ej: 200",
    },
    { name: "startDate", label: "Fecha Inicio", type: "datetime-local" },
    { name: "endDate", label: "Fecha Fin", type: "datetime-local" },
    {
      name: "minDuration",
      label: "Duración Mín (ms)",
      type: "number",
      placeholder: "ej: 1000",
    },
  ];

  const columns = [
    {
      key: "timestamp",
      label: "Fecha y Hora",
      render: (row) => format(new Date(row.timestamp), "dd/MM/yyyy HH:mm:ss"),
    },
    {
      key: "requestMethod",
      label: "Método",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            row.requestMethod === "GET"
              ? "bg-blue-100 text-blue-800"
              : row.requestMethod === "POST"
              ? "bg-green-100 text-green-800"
              : row.requestMethod === "PUT"
              ? "bg-yellow-100 text-yellow-800"
              : row.requestMethod === "DELETE"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.requestMethod}
        </span>
      ),
    },
    { key: "requestPath", label: "Ruta" },
    {
      key: "responseStatus",
      label: "Estado",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            row.responseStatus < 300
              ? "bg-green-100 text-green-800"
              : row.responseStatus < 400
              ? "bg-blue-100 text-blue-800"
              : row.responseStatus < 500
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.responseStatus}
        </span>
      ),
    },
    { key: "userName", label: "Usuario" },
    { key: "ipAddress", label: "Dirección IP" },
    {
      key: "durationMs",
      label: "Duración",
      render: (row) => (row.durationMs ? `${row.durationMs}ms` : "-"),
    },
  ];

  useEffect(() => {
    loadData();
  }, [pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        startDate: filters.startDate
          ? new Date(filters.startDate).toISOString()
          : undefined,
        endDate: filters.endDate
          ? new Date(filters.endDate).toISOString()
          : undefined,
      };

      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const response = await accessAuditService.query(params);
      setData(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadData();
  };

  const handleClear = () => {
    setFilters({
      systemId: "",
      userId: "",
      userName: "",
      ipAddress: "",
      requestMethod: "",
      requestPath: "",
      responseStatus: "",
      startDate: "",
      endDate: "",
      minDuration: "",
      maxDuration: "",
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Auditoría de Acceso
        </h1>
        <p className="text-gray-600 mt-1">
          Seguimiento de accesos de usuarios y peticiones API
        </p>
      </div>

      <FilterPanel
        filters={filterConfig.map((f) => ({ ...f, value: filters[f.name] }))}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};

export default AccessAuditPage;
