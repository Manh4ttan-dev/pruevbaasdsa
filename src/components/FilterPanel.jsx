import React from "react";
import { Search, X } from "lucide-react";

const FilterPanel = ({ filters, onFilterChange, onSearch, onClear }) => {
  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {filter.type === "select" ? (
              <select
                value={filter.value || ""}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                className="input-field w-full"
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === "datetime-local" ? (
              <input
                type="datetime-local"
                value={filter.value || ""}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                className="input-field w-full"
              />
            ) : (
              <input
                type={filter.type || "text"}
                value={filter.value || ""}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                placeholder={filter.placeholder}
                className="input-field w-full"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onSearch} className="btn-primary flex items-center">
          <Search size={18} className="mr-2" />
          Buscar
        </button>
        <button onClick={onClear} className="btn-secondary flex items-center">
          <X size={18} className="mr-2" />
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
