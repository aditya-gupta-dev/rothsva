import type { ReactNode } from 'react'
import { ThemeToggle } from './theme-toggle'

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  features,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
  features: Array<{ label: string; value: string }>
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text)]">
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(41,151,255,0.16),transparent_45%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.06))]" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-8 pt-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Rothsva
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Secure notes, minimal chrome.
            </p>
          </div>
          <ThemeToggle />
        </header>
        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--color-muted)]">
              {description}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <FeatureStat
                  key={feature.label}
                  label={feature.label}
                  value={feature.value}
                />
              ))}
            </div>
          </div>
          <div>{children}</div>
        </section>
      </main>
    </div>
  )
}

function FeatureStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel-subtle)] px-5 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--color-heading)]">
        {value}
      </p>
    </div>
  )
}
