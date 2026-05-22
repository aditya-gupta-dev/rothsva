import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactions } from '../lib/api'
import { useAuth } from '../providers/auth-context'
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react'

interface Transaction {
  id: number
  amount: number
  currency: string
  transactionType: 'credit' | 'debit'
  description: string | null
  createdAt: string
  merchantName: string | null
  categoryName: string | null
  paymentModeName: string | null
}

export function TransactionsPage() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        const data = await getTransactions(token)
        setTransactions(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load transactions')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-muted)]">Loading transactions...</p>
      </div>
    )
  }

  return (
    <section className="flex flex-1 flex-col">
      <header className="pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Activity
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
          Transactions
        </h1>
      </header>

      <div className="mt-10 flex-1 overflow-hidden">
        {error ? (
          <p className="text-[var(--color-danger)]">{error}</p>
        ) : (
          <div className="h-full space-y-3 overflow-y-auto pb-32 pr-2 scrollbar-hide">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                onClick={() => navigate(`/transactions/${txn.id}`)}
                className="group flex cursor-pointer items-center justify-between rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-all hover:bg-[var(--color-panel-subtle)] hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      txn.transactionType === 'credit'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {txn.transactionType === 'credit' ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-heading)]">
                      {txn.merchantName || txn.categoryName || 'Transaction'}
                    </h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      {new Date(txn.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' • '}
                      {txn.paymentModeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold tracking-tight ${
                        txn.transactionType === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {txn.transactionType === 'credit' ? '+' : '-'}
                      {txn.currency} {txn.amount.toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="text-[var(--color-border-strong)] transition-transform group-hover:translate-x-1" size={20} />
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-muted)]">No transactions found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
