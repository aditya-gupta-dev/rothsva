import { useTheme } from '../../providers/theme-context'

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <fieldset className="pointer-events-auto">
      <legend className="sr-only">Theme preference</legend>
      <div className="flex flex-wrap gap-4">
      {(['light', 'dark', 'system'] as const).map((option) => {
        const active = preference === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => setPreference(option)}
            aria-pressed={active}
            className="group inline-flex min-h-11 items-center gap-3 rounded-full px-2 py-1 text-sm font-medium capitalize text-[var(--color-text)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                active
                  ? 'border-[var(--color-accent)]'
                  : 'border-[var(--color-border-strong)] group-hover:border-[var(--color-text)]'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition ${
                  active
                    ? 'bg-[var(--color-accent)]'
                    : 'bg-transparent'
                }`}
              />
            </span>
            <span
              className={
                active
                  ? 'text-[var(--color-heading)]'
                  : 'text-[var(--color-muted)] group-hover:text-[var(--color-text)]'
              }
            >
              {option}
            </span>
          </button>
        )
      })}
      </div>
    </fieldset>
  )
}
