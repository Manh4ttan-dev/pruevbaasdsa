import React from "react";

const StatCard = ({ title, value, subtitle, icon: Icon, color = "main" }) => {
  const colorClasses = {
    main: "bg-main",
    accent: "bg-accent",
    dark: "bg-dark",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
