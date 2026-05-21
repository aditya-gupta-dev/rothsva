import type { TextareaHTMLAttributes } from 'react'

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function TextareaField({
  className = '',
  error,
  label,
  ...props
}: TextareaFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      <textarea
        className={`min-h-32 rounded-[24px] border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)] ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-sm text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  )
}
