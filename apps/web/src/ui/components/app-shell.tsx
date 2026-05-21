import { Outlet } from 'react-router-dom'
import { FloatingActionButton } from './floating-action-button'
import { AppBottomNav } from './app-bottom-nav'

export function AppShell() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 pb-36 sm:px-8 sm:py-6 sm:pb-40 lg:px-10 lg:py-8 lg:pb-44">
        <Outlet />
      </div>
      <AppBottomNav />
      <FloatingActionButton />
    </main>
  )
}
