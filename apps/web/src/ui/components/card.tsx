import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.42)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
