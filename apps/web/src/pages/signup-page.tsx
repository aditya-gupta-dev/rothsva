import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/auth-context'
import { AuthShell } from '../ui/components/auth-shell'
import { Button } from '../ui/components/button'
import { Card } from '../ui/components/card'
import { Input } from '../ui/components/input'

type FormState = {
  name: string
  email: string
  password: string
}

export function SignupPage() {
  const navigate = useNavigate()
  const { isAuthenticated, register } = useAuth()
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
  })
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
      await register(form)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create account.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Personal Finance"
      title="Create a calm place for your income, expenses, and monthly records."
      description="Start with a simple account, then organize spending history, recurring bills, and personal financial snapshots in one place."
      features={[
        { label: 'Income', value: 'Tracked' },
        { label: 'Expenses', value: 'Organized' },
        { label: 'Records', value: 'Monthly' },
      ]}
    >
      <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
            New account
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
            Sign up
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Create your account to start managing personal finance records.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Your name"
            required
          />
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
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Create a password"
            required
            error={error}
          />
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="flex-1" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
            <Button
              className="flex-1"
              type="button"
              variant="secondary"
              onClick={() => navigate('/', { replace: true })}
            >
              Back to login
            </Button>
          </div>
          <div className="pt-1 text-center text-sm text-[var(--color-muted)]">
            Already have an account?{' '}
            <Link
              className="font-semibold text-[var(--color-accent)] transition hover:text-[#0066cc]"
              to="/"
            >
              Sign in
            </Link>
            .
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}
