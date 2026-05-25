import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ReceiptText, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppBottomNav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-60 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="pointer-events-auto relative mx-auto max-w-xl rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-4 shadow-[0_28px_90px_-52px_rgba(0,0,0,0.58)] backdrop-blur-xl">
          <nav className="flex items-center justify-around gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[var(--color-text)] text-[var(--color-canvas)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-subtle)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <item.icon size={24} strokeWidth={2.5} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-75 rounded-lg bg-[var(--color-heading)] px-2.5 py-1 text-xs font-medium text-[var(--color-canvas)] opacity-0 transition-all group-hover:top-[-44px] group-hover:scale-100 group-hover:opacity-100">
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-heading)]" />
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
