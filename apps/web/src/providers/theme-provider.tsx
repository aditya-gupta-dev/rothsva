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

function getStoredPreference(): ThemePreference {
  return (window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(getStoredPreference)
  const [theme, setTheme] = useState<Theme>(() =>
    preference === 'system' ? getSystemTheme() : preference,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme(nextPreference: ThemePreference) {
      const nextTheme =
        nextPreference === 'system' ? getSystemTheme() : nextPreference

      setTheme(nextTheme)
      document.documentElement.dataset.theme = nextTheme
      document.documentElement.style.colorScheme = nextTheme
    }

    applyTheme(preference)

    const onChange = () => {
      if (preference === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [preference])

  function setPreference(value: ThemePreference) {
    setPreferenceState(value)
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
