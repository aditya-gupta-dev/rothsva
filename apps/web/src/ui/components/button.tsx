import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

const styles = {
  primary:
    'bg-[var(--color-accent)] text-white shadow-[0_18px_40px_-24px_rgba(0,113,227,0.75)] hover:bg-[#0066cc]',
  secondary:
    'border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-text)] hover:bg-[var(--color-panel-strong)]',
  ghost:
    'text-[var(--color-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-text)]',
}

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
