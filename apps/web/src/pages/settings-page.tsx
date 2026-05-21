import { useState } from 'react'
import { useAuth } from '../providers/auth-context'
import { useFabPosition } from '../providers/fab-position-context'
import { useReferenceData } from '../providers/reference-data-context'
import { Button } from '../ui/components/button'
import { Card } from '../ui/components/card'

export function SettingsPage() {
  const { logout, user } = useAuth()
  const { position, setPosition } = useFabPosition()
  const { isLoading, refresh } = useReferenceData()
  const [error, setError] = useState('')

  async function handleRefresh() {
    setError('')

    try {
      await refresh()
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Unable to refresh local data.',
      )
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="pt-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
          General
        </h1>
      </header>

      <Card className="rounded-[36px] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Account
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Name</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--color-heading)]">
                    {user?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Email</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--color-heading)]">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">User id</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--color-heading)]">
                    {user?.id}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Appearance
              </p>
              <p className="mt-4 text-lg font-semibold text-[var(--color-heading)]">
                Theme: system
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                FAB Position
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(['left', 'center', 'right'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPosition(option)}
                    className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize tracking-[-0.01em] transition ${
                      position === option
                        ? 'bg-[var(--color-text)] text-[var(--color-canvas)]'
                        : 'border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-text)] hover:bg-[var(--color-panel-strong)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-panel-subtle)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Data Controls
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              Refresh categories, sub-categories, merchants, and payment modes
              stored in local cache.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh Cached Data'}
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>
            ) : null}
          </div>
        </div>
      </Card>
    </section>
  )
}
