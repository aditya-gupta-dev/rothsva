import { useAuth } from '../providers/auth-context'
import { Button } from '../ui/components/button'
import { FloatingActionButton } from '../ui/components/floating-action-button'
import { ThemeToggle } from '../ui/components/theme-toggle'

export function DashboardPage() {
  const { logout, user } = useAuth()

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-text)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Dashboard
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Signed in as {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 pb-28 sm:px-8 sm:pb-32 lg:px-10 lg:pb-36">
        <div className="w-full rounded-[36px] border border-[var(--color-border)] bg-[var(--color-panel)] px-8 py-16 shadow-[0_32px_100px_-56px_rgba(0,0,0,0.52)] backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Personal Finance Overview
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
            Dashboard
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
            Your dashboard stays intentionally light for now. Use the floating
            action button to start a new financial record quickly from mobile or
            desktop.
          </p>
        </div>
      </section>
      <FloatingActionButton />
    </main>
  )
}
