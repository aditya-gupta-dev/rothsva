import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { apiRequest } from '../../lib/api'
import { useReferenceData } from '../../providers/reference-data-context'
import { useAuth } from '../../providers/auth-context'
import { useFabPosition } from '../../providers/fab-position-context'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from './button'
import { SelectField } from './select-field'
import { TextareaField } from './textarea-field'

type TransactionType = 'credit' | 'debit'

type RecordDraft = {
  transactionType: TransactionType
  amount: string
  paymentModeId: string
  currency: string
  merchantName: string
  mainCategoryId: string
  subCategoryId: string
  description: string
  officialTxnId: string
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMerchantDropdownOpen, setIsMerchantDropdownOpen] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draft, setDraft] = useState<RecordDraft>({
    transactionType: 'debit',
    amount: '',
    paymentModeId: '',
    currency: 'INR',
    merchantName: '',
    mainCategoryId: '',
    subCategoryId: '',
    description: '',
    officialTxnId: '',
  })
  const { token } = useAuth()
  const { position } = useFabPosition()
  const queryClient = useQueryClient()
  const {
    isReady,
    isLoading,
    mainCategories,
    subCategories,
    paymentModes,
    merchants,
  } = useReferenceData()

  const filteredSubCategories = draft.mainCategoryId
    ? subCategories.filter(
        (subCategory) => subCategory.parentId === Number(draft.mainCategoryId),
      )
    : []
  const filteredMerchants = useMemo(() => {
    const query = draft.merchantName.trim().toLowerCase()

    if (!query) {
      return merchants
    }

    return merchants.filter((merchant) =>
      merchant.name.toLowerCase().includes(query),
    )
  }, [draft.merchantName, merchants])
  const alignmentClass =
    position === 'left'
      ? 'justify-start'
      : position === 'right'
        ? 'justify-end'
        : 'justify-center'

  const openComposer = useCallback(() => {
    if (!isReady) {
      setPopupMessage('required data not loaded yet')
      return
    }

    setPopupMessage('')
    setIsOpen(true)
    setIsMerchantDropdownOpen(false)
  }, [isReady])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        openComposer()
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
        setIsMerchantDropdownOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openComposer])

  useEffect(() => {
    if (!popupMessage) {
      return
    }

    const timeout = window.setTimeout(() => {
      setPopupMessage('')
    }, 2600)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [popupMessage])

  function updateDraft(
    key: keyof RecordDraft,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const value = event.target.value
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setSubmitError('Your session is not available.')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await apiRequest<{ message: string }>('/transactions', {
        method: 'POST',
        token,
        body: JSON.stringify({
          transactionType: draft.transactionType,
          amount: Number(draft.amount),
          paymentModeId: draft.paymentModeId
            ? Number(draft.paymentModeId)
            : undefined,
          currency: draft.currency || 'INR',
          receiverId: merchants.find(
            (merchant) =>
              merchant.name.toLowerCase() === draft.merchantName.trim().toLowerCase(),
          )?.id,
          merchantName: draft.merchantName.trim() || undefined,
          categoryId: draft.subCategoryId
            ? Number(draft.subCategoryId)
            : draft.mainCategoryId
              ? Number(draft.mainCategoryId)
              : undefined,
          description: draft.description || undefined,
          officialTxnId: draft.officialTxnId.trim() || undefined,
        }),
      })

      // Invalidate queries to refresh data across the app
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['stats'] })

      setDraft({
        transactionType: 'debit',
        amount: '',
        paymentModeId: '',
        currency: 'INR',
        merchantName: '',
        mainCategoryId: '',
        subCategoryId: '',
        description: '',
        officialTxnId: '',
      })
      setIsOpen(false)
      setIsMerchantDropdownOpen(false)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to add record.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.16)] backdrop-blur-[6px]"
          onClick={() => {
            setIsOpen(false)
            setIsMerchantDropdownOpen(false)
          }}
        />
      ) : null}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 flex px-4 pb-[7.75rem] sm:px-6 sm:pb-[8.5rem] lg:px-8 lg:pb-[8.5rem] ${alignmentClass}`}
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-3 lg:max-w-5xl">
          <div
            className={`w-full origin-bottom transition duration-300 ${
              isOpen
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-6 opacity-0'
            }`}
          >
            <div className="max-h-[78vh] overflow-y-auto rounded-[30px] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-[0_32px_90px_-44px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:max-h-[72vh] sm:p-5 lg:mx-auto lg:max-w-5xl lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Add Record
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
                    New transaction
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel-strong)] text-xl leading-none text-[var(--color-text)] transition hover:border-[var(--color-border-strong)]"
                  aria-label="Close quick add panel"
                >
                  ×
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                Capture a debit or credit entry without leaving the dashboard.
              </p>
              <form className="mt-5 space-y-5 lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-6 lg:space-y-0" onSubmit={handleSubmit}>
                <div className="space-y-5">
                <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel-subtle)] p-1">
                  <div className="grid grid-cols-2 gap-1">
                    {(['debit', 'credit'] as const).map((type) => {
                      const active = draft.transactionType === type

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              transactionType: type,
                              ...(type === 'credit' ? { merchantName: '' } : {}),
                            }))
                          }
                          className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize tracking-[-0.01em] transition ${
                            active
                              ? 'bg-[var(--color-text)] text-[var(--color-canvas)]'
                              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-left">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Amount
                    </span>
                    <input
                      value={draft.amount}
                      onChange={(event) => updateDraft('amount', event)}
                      inputMode="decimal"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)]"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-left">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Currency
                    </span>
                    <input
                      value={draft.currency}
                      onChange={(event) => updateDraft('currency', event)}
                      placeholder="INR"
                      className="min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base uppercase text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)]"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Payment mode"
                    value={draft.paymentModeId}
                    onChange={(event) => updateDraft('paymentModeId', event)}
                    required
                  >
                    <option value="">Select payment mode</option>
                    {paymentModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.name}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Category"
                    value={draft.mainCategoryId}
                    onChange={(event) => {
                      const nextMainCategoryId = event.target.value
                      setDraft((current) => ({
                        ...current,
                        mainCategoryId: nextMainCategoryId,
                        subCategoryId: '',
                      }))
                    }}
                  >
                    <option value="">Select category</option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {draft.transactionType === 'debit' && (
                  <label className="flex flex-col gap-2 text-left">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Receiver name
                    </span>
                    <div className="relative">
                      <input
                        value={draft.merchantName}
                        onChange={(event) => {
                          updateDraft('merchantName', event)
                          setIsMerchantDropdownOpen(true)
                        }}
                        onFocus={() => setIsMerchantDropdownOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsMerchantDropdownOpen(false)
                          }, 120)
                        }}
                        placeholder="Merchant name"
                        className="min-h-12 w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 pr-12 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)]"
                      />
                      <button
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          setIsMerchantDropdownOpen((current) => !current)
                        }}
                        className="absolute inset-y-1.5 right-1.5 inline-flex w-10 items-center justify-center rounded-full text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-panel-subtle)] hover:text-[var(--color-text)]"
                        aria-label="Toggle merchant suggestions"
                      >
                        ▾
                      </button>
                      {isMerchantDropdownOpen ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel-strong)] shadow-[0_24px_64px_-36px_rgba(0,0,0,0.5)]">
                          <div className="max-h-52 overflow-y-auto p-2">
                            {filteredMerchants.length > 0 ? (
                              filteredMerchants.map((merchant) => (
                                <button
                                  key={merchant.id}
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault()
                                    setDraft((current) => ({
                                      ...current,
                                      merchantName: merchant.name,
                                    }))
                                    setIsMerchantDropdownOpen(false)
                                  }}
                                  className="flex min-h-11 w-full items-center rounded-[18px] px-3 text-left text-sm text-[var(--color-text)] transition hover:bg-[var(--color-panel-subtle)]"
                                >
                                  {merchant.name}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-3 text-sm text-[var(--color-muted)]">
                                No saved merchants match. Your typed value will be
                                used as-is.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </label>
                )}
                </div>

                <div className="space-y-5 lg:flex lg:flex-col">
                  {draft.mainCategoryId && filteredSubCategories.length > 0 ? (
                    <SelectField
                      label="Sub-category"
                      value={draft.subCategoryId}
                      onChange={(event) => updateDraft('subCategoryId', event)}
                    >
                      <option value="">Select sub-category</option>
                      {filteredSubCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </SelectField>
                  ) : null}

                  <label className="flex flex-col gap-2 text-left">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Official Txn ID
                    </span>
                    <input
                      value={draft.officialTxnId}
                      onChange={(event) => updateDraft('officialTxnId', event)}
                      placeholder="e.g. UPI ref / bank txn ID"
                      className="min-h-12 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-input)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)]"
                    />
                  </label>

                  <TextareaField
                    label="Description"
                    value={draft.description}
                    onChange={(event) => updateDraft('description', event)}
                    placeholder="Add a note about this financial record"
                    className="lg:min-h-[14rem]"
                  />

                  {submitError ? (
                    <p className="text-sm text-[var(--color-danger)]">
                      {submitError}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row lg:mt-auto">
                    <Button className="flex-1" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Record'}
                    </Button>
                    <Button
                      className="flex-1"
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsOpen(false)
                        setIsMerchantDropdownOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
                <span>Shortcut: Ctrl+Alt+N</span>
                <span>{isLoading ? 'Loading reference data...' : 'Ready'}</span>
              </div>
            </div>
          </div>
          {popupMessage ? (
            <div className="w-full rounded-[22px] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text)] shadow-[0_18px_48px_-28px_rgba(0,0,0,0.46)] lg:max-w-sm">
              {popupMessage}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (isOpen) {
                setIsOpen(false)
                setIsMerchantDropdownOpen(false)
                return
              }

              openComposer()
            }}
            className="pointer-events-auto inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[rgba(255,255,255,0.18)] bg-[var(--color-accent)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_22px_48px_-24px_rgba(0,113,227,0.88)] transition hover:scale-[1.01] hover:bg-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] lg:min-h-12"
            aria-expanded={isOpen}
            aria-label="Open quick add record panel"
          >
            <span className="text-xl leading-none">+</span>
            <span>New record</span>
          </button>
        </div>
      </div>
    </>
  )
}
