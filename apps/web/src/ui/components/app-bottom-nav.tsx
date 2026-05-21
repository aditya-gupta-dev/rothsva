import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
]

export function AppBottomNav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="pointer-events-auto relative mx-auto max-w-xl rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-4 shadow-[0_28px_90px_-52px_rgba(0,0,0,0.58)] backdrop-blur-xl">
          <nav className="grid grid-cols-2 gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-semibold tracking-[-0.01em] transition ${
                    isActive
                      ? 'bg-[var(--color-text)] text-[var(--color-canvas)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-subtle)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
