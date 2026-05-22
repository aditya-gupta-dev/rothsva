import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTransactionDetail } from '../lib/api'
import { useAuth } from '../providers/auth-context'
import { ChevronLeft, Calendar, Tag, CreditCard, Hash, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface TransactionDetail {
  id: number
  amount: number
  currency: string
  transactionType: 'credit' | 'debit'
  description: string | null
  officialTxnId: string | null
  createdAt: string
  updatedAt: string
  merchantName: string | null
  categoryName: string | null
  paymentModeName: string | null
}

export function TransactionDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      if (!token || !id) return
      try {
        const data = await getTransactionDetail(id, token)
        setTransaction(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load transaction details')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, token])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-muted)]">Loading details...</p>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-danger)]">{error || 'Transaction not found'}</p>
        <button
          onClick={() => navigate('/transactions')}
          className="rounded-full bg-[var(--color-text)] px-6 py-2 text-sm font-semibold text-[var(--color-canvas)]"
        >
          Go Back
        </button>
      </div>
    )
  }

  const isCredit = transaction.transactionType === 'credit'

  return (
    <section className="flex flex-1 flex-col">
      <header className="flex items-center gap-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-panel-subtle)]"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-heading)]">
          Transaction Details
        </h1>
      </header>

      <div className="mt-8 flex flex-col items-center justify-center py-10">
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            isCredit
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isCredit ? <ArrowDownLeft size={36} /> : <ArrowUpRight size={36} />}
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-[var(--color-heading)]">
          {isCredit ? '+' : '-'}
          {transaction.currency} {transaction.amount.toLocaleString()}
        </h2>
        <p className="mt-4 text-xl font-medium text-[var(--color-muted)]">
          {transaction.merchantName || transaction.categoryName || 'Transaction'}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm">
          <div className="space-y-6">
            <DetailItem
              icon={<Calendar size={18} />}
              label="Date & Time"
              value={new Date(transaction.createdAt).toLocaleString(undefined, {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            />
            <DetailItem
              icon={<Tag size={18} />}
              label="Category"
              value={transaction.categoryName || 'Uncategorized'}
            />
            <DetailItem
              icon={<CreditCard size={18} />}
              label="Payment Mode"
              value={transaction.paymentModeName || 'None'}
            />
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm">
          <div className="space-y-6">
            <DetailItem
              icon={<Hash size={18} />}
              label="Transaction ID"
              value={transaction.officialTxnId || 'Not available'}
            />
            <DetailItem
              icon={<FileText size={18} />}
              label="Description"
              value={transaction.description || 'No description provided'}
            />
            <DetailItem
              icon={<ArrowUpRight size={18} />}
              label="Type"
              value={transaction.transactionType.toUpperCase()}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 text-[var(--color-muted)]">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
          {label}
        </p>
        <p className="mt-1 text-base font-medium text-[var(--color-heading)]">{value}</p>
      </div>
    </div>
  )
}
