import { Outlet } from 'react-router-dom'
import { FloatingActionButton } from './floating-action-button'
import { AppBottomNav } from './app-bottom-nav'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export function AppShell() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleRefresh() {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    // Small delay to show the animation
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      {/* Top Bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-end px-5 sm:px-8 lg:px-10">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text)] shadow-sm backdrop-blur-md transition-all hover:bg-[var(--color-panel-subtle)] active:scale-95 disabled:opacity-50"
          title="Refresh Cache"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pt-20 pb-36 sm:px-8 sm:pt-24 sm:pb-40 lg:px-10 lg:pt-28 lg:pb-44">
        <Outlet />
      </div>
      <AppBottomNav />
      <FloatingActionButton />
    </main>
  )
}
