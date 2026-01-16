import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataAuditPage from './pages/DataAuditPage'
import AccessAuditPage from './pages/AccessAuditPage'
import RecordTimelinePage from './pages/RecordTimelinePage'
import ForensicAnalysisPage from './pages/ForensicAnalysisPage'
import EndpointAnalyticsPage from './pages/EndpointAnalyticsPage'

// Analytics Pages
import AnalyticsOverview from './pages/analytics/AnalyticsOverview'
import SessionAnalytics from './pages/analytics/SessionAnalytics'
import NavigationAnalytics from './pages/analytics/NavigationAnalytics'
import ProcedureAnalytics from './pages/analytics/ProcedureAnalytics'
import AcademicAnalytics from './pages/analytics/AcademicAnalytics'
import PerformanceAnalytics from './pages/analytics/PerformanceAnalytics'
import GeoAnalytics from './pages/analytics/GeoAnalytics'
import PrivacyDashboard from './pages/analytics/PrivacyDashboard'
import UserExplorer from './pages/analytics/UserExplorer'
import UserBehaviorAnalytics from './pages/analytics/UserBehaviorAnalytics'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/data-audit" element={<DataAuditPage />} />
          <Route path="/access-audit" element={<AccessAuditPage />} />
          <Route path="/record-timeline" element={<RecordTimelinePage />} />
          <Route path="/endpoint-analytics" element={<EndpointAnalyticsPage />} />
          <Route path="/forensic-analysis" element={<ForensicAnalysisPage />} />

          {/* Analytics Routes */}
          <Route path="/analytics" element={<Navigate to="/analytics/overview" replace />} />
          <Route path="/analytics/overview" element={<AnalyticsOverview />} />
          <Route path="/analytics/sessions" element={<SessionAnalytics />} />
          <Route path="/analytics/navigation" element={<NavigationAnalytics />} />
          <Route path="/analytics/procedures" element={<ProcedureAnalytics />} />
          <Route path="/analytics/academic" element={<AcademicAnalytics />} />
          <Route path="/analytics/performance" element={<PerformanceAnalytics />} />
          <Route path="/analytics/geo" element={<GeoAnalytics />} />
          <Route path="/analytics/privacy" element={<PrivacyDashboard />} />
          <Route path="/analytics/users" element={<UserExplorer />} />
          <Route path="/analytics/behavior" element={<UserBehaviorAnalytics />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
