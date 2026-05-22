import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/dashboard-page'
import { LoginPage } from './pages/login-page'
import { SettingsPage } from './pages/settings-page'
import { SignupPage } from './pages/signup-page'
import { TransactionsPage } from './pages/transactions-page'
import { TransactionDetailPage } from './pages/transaction-detail-page'
import { ProtectedRoute, PublicOnlyRoute } from './routes/route-guards'
import { AppShell } from './ui/components/app-shell'

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
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/:id" element={<TransactionDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
