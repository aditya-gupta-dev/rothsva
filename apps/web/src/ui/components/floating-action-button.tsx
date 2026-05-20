import {
  useEffect,
  useEffectEvent,
  useState,
  type ChangeEvent,
} from 'react'
import { Button } from './button'

type QuickRecord = {
  title: string
  amount: string
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<QuickRecord>({ title: '', amount: '' })

  const openComposer = useEffectEvent(() => {
    setIsOpen(true)
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        openComposer()
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  function updateDraft(
    key: keyof QuickRecord,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.16)] backdrop-blur-[6px]"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-4 sm:px-6 sm:pb-6 lg:justify-center lg:px-8 lg:pb-8">
        <div className="pointer-events-auto flex w-full max-w-sm flex-col items-end gap-3 lg:max-w-md lg:items-center">
          {isOpen ? (
            <div className="w-full rounded-[30px] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-[0_32px_90px_-44px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Quick Add
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
                    New record
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel-strong)] text-xl leading-none text-[var(--color-text)] transition hover:border-[var(--color-border-strong)]"
                  aria-label="Close quick add panel"
                >
                  ×
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                Capture an expense or income entry without leaving the dashboard.
              </p>
              <div className="mt-5 grid gap-3">
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft('title', event)}
                  placeholder="Groceries, salary, rent"
                  className="min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)]"
                />
                <input
                  value={draft.amount}
                  onChange={(event) => updateDraft('amount', event)}
                  inputMode="decimal"
                  placeholder="Amount"
                  className="min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)]"
                />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" onClick={() => setIsOpen(false)}>
                  Save draft
                </Button>
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    setDraft({ title: '', amount: '' })
                    setIsOpen(false)
                  }}
                >
                  Dismiss
                </Button>
              </div>
              <p className="mt-4 text-xs text-[var(--color-muted)]">
                Shortcut: Ctrl+N
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_22px_48px_-24px_rgba(0,113,227,0.88)] transition hover:scale-[1.01] hover:bg-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] lg:min-h-12"
            aria-expanded={isOpen}
            aria-label="Open quick add record panel"
          >
            <span className="text-xl leading-none">+</span>
            <span>New record</span>
          </button>
        </div>
      </div>
    </>
  )
}
