import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BarChart3,
  Database,
  Activity,
  Search,
  Home,
  TrendingUp,
  PieChart,
  Users,
  FileText,
  Globe,
  Shield,
  ChevronDown,
  ChevronRight,
  Monitor,
  GraduationCap,
  Zap,
  UserSearch,
  LineChart,
} from "lucide-react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: "Panel Principal", href: "/dashboard", icon: Home },
    { name: "Auditoría de Datos", href: "/data-audit", icon: Database },
    { name: "Auditoría de Acceso", href: "/access-audit", icon: Activity },
    { name: "Línea de Tiempo", href: "/record-timeline", icon: BarChart3 },
    {
      name: "Análisis de Endpoints",
      href: "/endpoint-analytics",
      icon: TrendingUp,
    },
    { name: "Análisis Forense", href: "/forensic-analysis", icon: Search },
  ];

  const analyticsNavigation = [
    { name: "Overview", href: "/analytics/overview", icon: PieChart },
    { name: "User Behavior", href: "/analytics/behavior", icon: LineChart },
    { name: "Sesiones & Auth", href: "/analytics/sessions", icon: Users },
    { name: "Navegación", href: "/analytics/navigation", icon: Monitor },
    { name: "Procedimientos", href: "/analytics/procedures", icon: FileText },
    { name: "Académico", href: "/analytics/academic", icon: GraduationCap },
    { name: "Rendimiento", href: "/analytics/performance", icon: Zap },
    { name: "Geográfico", href: "/analytics/geo", icon: Globe },
    { name: "Privacidad", href: "/analytics/privacy", icon: Shield },
    { name: "Explorador", href: "/analytics/users", icon: UserSearch },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-dark transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-dark-lighter">
          <h1 className="text-xl font-bold text-white">Sistema de Auditoría</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {/* Auditoría Section */}
          <div className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Auditoría
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 mb-1 rounded-lg transition-colors duration-200
                    ${
                      isActive
                        ? "bg-main text-white"
                        : "text-gray-300 hover:bg-dark-lighter hover:text-white"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Analytics Section */}
          <div className="mb-4">
            <button
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
            >
              <span>Analytics Avanzado</span>
              {analyticsOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {analyticsOpen && (
              <div className="mt-1">
                {analyticsNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-4 py-3 mb-1 rounded-lg transition-colors duration-200
                        ${
                          isActive
                            ? "bg-secondary text-white"
                            : "text-gray-300 hover:bg-dark-lighter hover:text-white"
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} className="mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Sistema de Análisis Forense
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
