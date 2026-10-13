import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'cg_theme'
const THEMES = ['light', 'dark', 'system']
const ThemeContext = createContext(null)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readSavedTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return THEMES.includes(stored) ? stored : 'system'
  } catch (error) {
    console.warn('Unable to read saved theme preference.', error)
    return 'system'
  }
}

function applyThemeToDocument(theme) {
  const root = document.documentElement
  // If theme is light, remove the data-theme attribute so :root variables (light palette)
  // remain in effect. Only set data-theme when using dark to override variables.
  if (theme === 'light') {
    root.removeAttribute('data-theme')
  } else {
    root.dataset.theme = theme
  }
  // color-scheme expects 'light' or 'dark' — set it to the resolved theme so UA form controls match.
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readSavedTheme())
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme())

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [])

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    applyThemeToDocument(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (error) {
      console.warn('Unable to save theme preference.', error)
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      themes: THEMES,
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
