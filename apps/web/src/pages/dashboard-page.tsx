import { useState } from 'react'
import { useReferenceData } from '../providers/reference-data-context'
import { Button } from '../ui/components/button'

export function DashboardPage() {
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
    <section className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
            Finance Overview
          </h1>
        </div>
        <div>
          <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 items-center py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="min-h-[22rem] rounded-[40px] border border-[var(--color-border)] bg-[var(--color-panel)] px-8 py-10 shadow-[0_32px_100px_-56px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:min-h-[28rem]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Personal Finance Overview
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
              Dashboard
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
              The primary stage now sits in a wider desktop proportion instead
              of a tall card. Use the centered floating action button above the
              navigation bar to create a new record from anywhere.
            </p>
            {error ? (
              <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>
            ) : null}
          </div>

          <div className="min-h-[22rem] rounded-[40px] border border-[var(--color-border)] bg-[var(--color-panel-subtle)] px-8 py-10 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:min-h-[28rem]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Quick Status
            </p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Entries
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
                  Ready
                </p>
              </div>
              <div className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Reference Cache
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
                  Synced
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
