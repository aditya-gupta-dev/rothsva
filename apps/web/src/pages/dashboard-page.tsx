import { useEffect, useState } from 'react'
import { useReferenceData } from '../providers/reference-data-context'
import { Button } from '../ui/components/button'
import { getMonthlyStats } from '../lib/api'
import { useAuth } from '../providers/auth-context'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

interface DailyStat {
  date: string
  credit: number
  debit: number
}

export function DashboardPage() {
  const { isLoading: isRefLoading, refresh } = useReferenceData()
  const { token } = useAuth()
  const [stats, setStats] = useState<DailyStat[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        const data = await getMonthlyStats(token)
        setStats(data)
      } catch (e) {
        console.error('Failed to load stats', e)
      }
    }
    load()
  }, [token])

  async function handleRefresh() {
    setError('')
    try {
      await refresh()
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Unable to refresh local data.',
      )
    }
  }

  const totalCredits = stats.reduce((acc, curr) => acc + (curr.credit || 0), 0)
  const totalDebits = stats.reduce((acc, curr) => acc + (curr.debit || 0), 0)

  return (
    <section className="flex flex-1 flex-col pb-32">
      <header className="flex items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
            Finance Overview
          </h1>
        </div>
        <div>
          <Button variant="secondary" onClick={handleRefresh} disabled={isRefLoading}>
            {isRefLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <StatCard
          title="Total Credits"
          amount={totalCredits}
          data={stats}
          dataKey="credit"
          color="#22c55e"
          gradientId="colorCredit"
        />
        <StatCard
          title="Total Debits"
          amount={totalDebits}
          data={stats}
          dataKey="debit"
          color="#ef4444"
          gradientId="colorDebit"
        />
      </div>

      <div className="mt-10 flex flex-1 items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="min-h-[22rem] rounded-[40px] border border-[var(--color-border)] bg-[var(--color-panel)] px-8 py-10 shadow-[0_32px_100px_-56px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:min-h-[28rem]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Personal Finance Overview
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
              Insights
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
              Your financial activity for this month is summarized in the charts above. 
              Credits are shown in green, while debits are shown in red. 
              The area charts provide a daily view of your spending and income trends.
            </p>
            {error ? (
              <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>
            ) : null}
          </div>

          <div className="min-h-[22rem] rounded-[40px] border border-[var(--color-border)] bg-[var(--color-panel-subtle)] px-8 py-10 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:min-h-[28rem]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Quick Status
            </p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Entries
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
                  {stats.length > 0 ? 'Active' : 'Ready'}
                </p>
              </div>
              <div className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Reference Cache
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
                  Synced
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  title: string
  amount: number
  data: DailyStat[]
  dataKey: string
  color: string
  gradientId: string
}

function StatCard({ title, amount, data, dataKey, color, gradientId }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-[40px] border border-[var(--color-border)] bg-[var(--color-panel)] shadow-[0_32px_100px_-56px_rgba(0,0,0,0.52)] backdrop-blur-xl">
      <div className="p-8 pb-0">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {title}
        </p>
        <h3 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-heading)]">
          ₹{amount.toLocaleString()}
        </h3>
      </div>
      <div className="h-32 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-strong)] p-2 shadow-xl">
                      <p className="text-xs font-bold text-[var(--color-heading)]">
                        {payload[0].payload.date}
                      </p>
                      <p className="text-sm font-semibold" style={{ color }}>
                        ₹{payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
