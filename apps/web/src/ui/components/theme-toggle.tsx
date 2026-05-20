import { useTheme } from '../../providers/theme-context'

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-1">
      {(['light', 'dark', 'system'] as const).map((option) => {
        const active = preference === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => setPreference(option)}
            className={`rounded-full px-3 py-2 text-xs font-semibold capitalize tracking-[0.02em] transition ${
              active
                ? 'bg-[var(--color-text)] text-[var(--color-canvas)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
