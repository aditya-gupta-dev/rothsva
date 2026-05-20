import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Input({ error, label, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      <input
        className={`min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)] ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-sm text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  )
}
