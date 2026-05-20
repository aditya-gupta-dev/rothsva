import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app-router'
import { AuthProvider } from './providers/auth-provider'
import { ThemeProvider } from './providers/theme-provider'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
