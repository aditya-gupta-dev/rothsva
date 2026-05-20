import { useAuth } from '../providers/auth-context'
import { Button } from '../ui/components/button'
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

      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 sm:px-8 lg:px-10">
        <div className="rounded-[32px] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-panel-subtle)] px-8 py-16">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)]">
            Dashboard
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
            This page is intentionally simple and only available to logged-in
            users.
          </p>
        </div>
      </section>
    </main>
  )
}
