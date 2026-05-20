import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/dashboard-page'
import { LoginPage } from './pages/login-page'
import { SignupPage } from './pages/signup-page'
import { ProtectedRoute, PublicOnlyRoute } from './routes/route-guards'

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
