import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import FilterPanel from "../components/FilterPanel";
import { dataAuditService } from "../services/api";
import { format } from "date-fns";
import { History } from "lucide-react";

const DataAuditPage = () => {
  const navigate = useNavigate();
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
    schemaName: "",
    tableName: "",
    operation: "",
    userName: "",
    userId: "",
    startDate: "",
    endDate: "",
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
      name: "schemaName",
      label: "Esquema",
      type: "text",
      placeholder: "ej: dbo",
    },
    {
      name: "tableName",
      label: "Tabla",
      type: "text",
      placeholder: "ej: usuarios",
    },
    {
      name: "operation",
      label: "Operación",
      type: "select",
      options: [
        { value: "INSERT", label: "INSERCIÓN" },
        { value: "UPDATE", label: "ACTUALIZACIÓN" },
        { value: "DELETE", label: "ELIMINACIÓN" },
      ],
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
    { name: "startDate", label: "Fecha Inicio", type: "datetime-local" },
    { name: "endDate", label: "Fecha Fin", type: "datetime-local" },
  ];

  const handleViewTimeline = useCallback((row) => {
    // Extraer el ID del registro desde keyValues
    let keyValues = row.keyValues;

    // Si keyValues es un string JSON, parsearlo
    if (typeof keyValues === 'string') {
      try {
        keyValues = JSON.parse(keyValues);
      } catch (e) {
        console.error('Error parsing keyValues:', e);
        alert("Error al obtener los datos del registro");
        return;
      }
    }

    if (!keyValues || typeof keyValues !== 'object') {
      alert("No se encontraron datos de identificación del registro");
      return;
    }

    // Enviar TODOS los keyValues para soportar claves compuestas
    // El backend se encargará de filtrar correctamente
    navigate("/record-timeline", {
      state: {
        keyValues: keyValues, // Enviar el objeto completo
        systemId: row.systemId,
        schemaName: row.schemaName,
        tableName: row.tableName,
      },
    });
  }, [navigate]);

  const columns = useMemo(() => [
    {
      key: "timestamp",
      label: "Fecha y Hora",
      render: (row) => format(new Date(row.timestamp), "dd/MM/yyyy HH:mm:ss"),
    },
    {
      key: "operation",
      label: "Operación",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            row.operation === "INSERT"
              ? "bg-green-100 text-green-800"
              : row.operation === "UPDATE"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.operation}
        </span>
      ),
    },
    { key: "systemId", label: "Sistema" },
    { key: "schemaName", label: "Esquema" },
    { key: "tableName", label: "Tabla" },
    { key: "userName", label: "Usuario" },
    {
      key: "changedFields",
      label: "Campos Modificados",
      render: (row) => row.changedFields?.join(", ") || "-",
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <button
          onClick={() => handleViewTimeline(row)}
          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          title="Ver línea de tiempo del registro"
        >
          <History size={16} className="mr-1" />
          Timeline
        </button>
      ),
    },
  ], [handleViewTimeline]);

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

      const response = await dataAuditService.query(params);
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
      schemaName: "",
      tableName: "",
      operation: "",
      userName: "",
      userId: "",
      startDate: "",
      endDate: "",
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
        <h1 className="text-3xl font-bold text-gray-900">Auditoría de Datos</h1>
        <p className="text-gray-600 mt-1">
          Seguimiento y análisis de cambios en base de datos
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

export default DataAuditPage;
