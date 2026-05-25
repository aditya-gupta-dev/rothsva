import { useParams, useNavigate } from 'react-router-dom'
import { getTransactionDetail, deleteTransaction } from '../lib/api'
import { useAuth } from '../providers/auth-context'
import { ChevronLeft, Calendar, Tag, CreditCard, Hash, FileText, ArrowUpRight, ArrowDownLeft, MoreVertical, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: transaction, isLoading, error } = useQuery<TransactionDetail>({
    queryKey: ['transactions', id],
    queryFn: () => getTransactionDetail(id!, token!).then(data => data as TransactionDetail),
    enabled: !!token && !!id,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = async () => {
    if (!id || !token || !window.confirm('Are you sure you want to delete this transaction?')) return
    
    setIsDeleting(true)
    try {
      await deleteTransaction(Number(id), token)
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['stats'] })
      navigate('/transactions')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete transaction')
    } finally {
      setIsDeleting(false)
    }
  }

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
        <p className="text-[var(--color-danger)]">{(error as Error)?.message || 'Transaction not found'}</p>
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
    <section className="flex flex-1 flex-col pb-20">
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-panel-subtle)] transition-colors active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-heading)] truncate">
            Transaction Details
          </h1>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-panel-subtle)] transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-strong)] p-2 shadow-2xl backdrop-blur-xl z-50">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="mt-8 flex flex-col items-center justify-center py-10">
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-inner ${
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
        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm backdrop-blur-md">
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

        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm backdrop-blur-md">
          <div className="space-y-6">
            <DetailItem
              icon={<Hash size={18} />}
              label="Transaction ID"
              value={transaction.officialTxnId || 'Not available'}
            />
            <DetailItem
              icon={<Tag size={18} />}
              label="Sub-category"
              value={transaction.categoryName || 'None'}
            />
            <DetailItem
              icon={<ArrowUpRight size={18} />}
              label="Type"
              value={transaction.transactionType.toUpperCase()}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 text-[var(--color-muted)]">
          <FileText size={18} />
          <span className="text-xs font-semibold uppercase tracking-[0.12em]">Description</span>
        </div>
        <div className="min-h-[100px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-subtle)] p-4 text-base text-[var(--color-text)] leading-relaxed">
          {transaction.description || 'No description provided for this transaction.'}
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
