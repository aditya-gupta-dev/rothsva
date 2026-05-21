import type { ReactNode, SelectHTMLAttributes } from 'react'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
  error?: string
}

export function SelectField({
  children,
  className = '',
  error,
  label,
  ...props
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      <select
        className={`min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)] ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-sm text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  )
}
