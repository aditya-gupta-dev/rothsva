import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/auth-context'
import { AuthShell } from '../ui/components/auth-shell'
import { Button } from '../ui/components/button'
import { Card } from '../ui/components/card'
import { Input } from '../ui/components/input'

type FormState = {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to sign in.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Personal Finance"
      title="Stay on top of every expense, balance, and monthly record."
      description="Zapisi is your personal financial record manager. Track everyday spending, keep your numbers organized, and return to the same dashboard automatically when your session is still valid."
      features={[
        { label: 'Expense Logs', value: 'Daily' },
        { label: 'Monthly View', value: 'Structured' },
        { label: 'Privacy', value: 'Personal' },
      ]}
    >
      <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Welcome back
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
            Login
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Sign in to review and manage your personal financial records.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Enter your password"
            required
            error={error}
          />
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="flex-1" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Button
              className="flex-1"
              type="reset"
              variant="secondary"
              onClick={() => {
                setForm({ email: '', password: '' })
                setError('')
              }}
            >
              Clear
            </Button>
          </div>
          <div className="pt-1 text-center text-sm text-[var(--color-muted)]">
            New to Zapisi?{' '}
            <Link
              className="font-semibold text-[var(--color-accent)] transition hover:text-[#0066cc]"
              to="/signup"
            >
              Sign up
            </Link>
            .
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}
