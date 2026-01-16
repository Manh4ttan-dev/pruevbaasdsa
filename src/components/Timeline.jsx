import React from "react";
import { format } from "date-fns";
import { Circle, ArrowRight } from "lucide-react";

const Timeline = ({ events }) => {
  const getOperationColor = (operation) => {
    switch (operation) {
      case "INSERT":
        return "bg-green-500";
      case "UPDATE":
        return "bg-blue-500";
      case "DELETE":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">Línea de Tiempo de Cambios</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Timeline events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="relative flex items-start ml-10">
              {/* Timeline dot */}
              <div
                className={`absolute -left-10 w-8 h-8 rounded-full ${getOperationColor(
                  event.operation
                )} flex items-center justify-center`}
              >
                <Circle size={12} className="text-white" fill="currentColor" />
              </div>

              {/* Event content */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      event.operation === "INSERT"
                        ? "bg-green-100 text-green-800"
                        : event.operation === "UPDATE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.operation}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(event.timestamp), "dd/MM/yyyy HH:mm:ss")}
                  </span>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Usuario:</span> {event.userName}
                  {event.userId && (
                    <span className="text-gray-500 ml-2">({event.userId})</span>
                  )}
                </div>

                {event.changedFields && event.changedFields.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Campos modificados:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.changedFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-accent text-white rounded"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.operation === "UPDATE" &&
                  event.oldValues &&
                  event.newValues && (
                    <div className="mt-3 space-y-2">
                      {Object.keys(event.newValues)
                        .filter(
                          (key) =>
                            String(event.oldValues[key]) !== String(event.newValues[key])
                        )
                        .map((key) => {
                          const oldVal = event.oldValues[key];
                          const newVal = event.newValues[key];

                          return (
                            <div key={key} className="flex items-start text-sm border-l-2 border-gray-300 pl-3">
                              <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                                {key}:
                              </span>
                              <div className="flex items-center flex-1 min-w-0">
                                <span className="text-red-600 line-through truncate">
                                  {String(oldVal)}
                                </span>
                                <ArrowRight
                                  size={16}
                                  className="mx-2 text-gray-400 flex-shrink-0"
                                />
                                <span className="text-green-600 font-medium truncate">
                                  {String(newVal)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                {event.operation === "INSERT" && event.newValues && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Valores insertados:</div>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm max-h-40 overflow-auto">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(event.newValues, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {event.operation === "DELETE" && event.oldValues && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Valores eliminados:</div>
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-sm max-h-40 overflow-auto">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(event.oldValues, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {event.requestPath && (
                  <div className="text-xs text-gray-500 mt-2">
                    Petición: {event.requestPath}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
