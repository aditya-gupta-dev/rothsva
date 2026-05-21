import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app-router'
import { AuthProvider } from './providers/auth-provider'
import { FabPositionProvider } from './providers/fab-position-provider'
import { ReferenceDataProvider } from './providers/reference-data-provider'
import { ThemeProvider } from './providers/theme-provider'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FabPositionProvider>
          <ReferenceDataProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </ReferenceDataProvider>
        </FabPositionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
