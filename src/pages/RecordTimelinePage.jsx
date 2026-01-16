import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Timeline from "../components/Timeline";
import { dataAuditService } from "../services/api";
import { Search } from "lucide-react";

const RecordTimelinePage = () => {
  const location = useLocation();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    recordId: "",
    systemId: "",
    schemaName: "",
    tableName: "",
    keyValues: null,
  });

  // Pre-llenar parámetros si vienen desde otra página
  useEffect(() => {
    if (location.state) {
      const { recordId, keyValues, systemId, schemaName, tableName } = location.state;

      // Soportar tanto el formato nuevo (keyValues) como el viejo (recordId) para no romper nada
      if ((keyValues || recordId) && systemId && schemaName && tableName) {
        const searchParams = {
          systemId,
          schemaName,
          tableName,
        };

        // Si viene keyValues (formato nuevo), usarlo
        if (keyValues) {
          searchParams.keyValues = keyValues;
          // Extraer un ID para mostrar en el campo (solo para display)
          const displayId = keyValues.Id || keyValues.id || keyValues.ID ||
                           Object.values(keyValues)[0];
          setParams({
            recordId: String(displayId),
            systemId,
            schemaName,
            tableName,
            keyValues,
          });
        } else {
          // Formato viejo (solo recordId)
          searchParams.recordId = recordId;
          setParams({
            recordId,
            systemId,
            schemaName,
            tableName,
            keyValues: null,
          });
        }

        // Auto-buscar si todos los parámetros están presentes
        fetchTimeline(searchParams);
      }
    }
  }, [location.state]);

  const fetchTimeline = async (searchParams) => {
    setLoading(true);
    try {
      const response = await dataAuditService.getRecordTimeline(
        searchParams.recordId || searchParams.keyValues,
        {
          systemId: searchParams.systemId,
          schemaName: searchParams.schemaName,
          tableName: searchParams.tableName,
          // Indicar si estamos usando keyValues (clave compuesta) o recordId (clave simple)
          isComposite: !!searchParams.keyValues,
        }
      );
      setTimeline(response.data);
    } catch (error) {
      console.error("Error loading timeline:", error);
      alert("Error al cargar la línea de tiempo");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (
      !params.recordId ||
      !params.systemId ||
      !params.schemaName ||
      !params.tableName
    ) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }

    fetchTimeline(params);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Línea de Tiempo de Registro
        </h1>
        <p className="text-gray-600 mt-1">
          Ver historial completo de cambios de un registro específico
        </p>
      </div>

      {location.state && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-blue-700">
            ✓ Parámetros cargados automáticamente desde la búsqueda anterior
          </p>
        </div>
      )}

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Parámetros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Registro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={params.recordId}
              onChange={(e) =>
                setParams({ ...params, recordId: e.target.value })
              }
              placeholder="ej: 123"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID del Sistema <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={params.systemId}
              onChange={(e) =>
                setParams({ ...params, systemId: e.target.value })
              }
              placeholder="ej: intranet"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Esquema <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={params.schemaName}
              onChange={(e) =>
                setParams({ ...params, schemaName: e.target.value })
              }
              placeholder="ej: dbo"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Tabla <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={params.tableName}
              onChange={(e) =>
                setParams({ ...params, tableName: e.target.value })
              }
              placeholder="ej: usuarios"
              className="input-field w-full"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="btn-primary mt-4 flex items-center"
          disabled={loading}
        >
          <Search size={18} className="mr-2" />
          {loading ? "Cargando..." : "Buscar Línea de Tiempo"}
        </button>
      </div>

      {timeline.length > 0 ? (
        <Timeline events={timeline} />
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            Sin datos en la línea de tiempo. Ingrese los parámetros de búsqueda
            y haga clic en Buscar Línea de Tiempo.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordTimelinePage;
