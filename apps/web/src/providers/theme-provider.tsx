import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ThemeContext,
  type Theme,
  type ThemeContextValue,
  type ThemePreference,
} from './theme-context'

const STORAGE_KEY = 'zapisi.theme'

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? getSystemTheme() : preference
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function getStoredPreference(): ThemePreference {
  return (window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(getStoredPreference)
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(preference))

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    applyTheme(theme)

    const onChange = () => {
      if (preference === 'system') {
        const systemTheme = resolveTheme('system')
        setTheme(systemTheme)
        applyTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [preference, theme])

  function setPreference(value: ThemePreference) {
    const nextTheme = resolveTheme(value)
    setPreferenceState(value)
    setTheme(nextTheme)
    applyTheme(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, value)
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      setPreference,
    }),
    [preference, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
