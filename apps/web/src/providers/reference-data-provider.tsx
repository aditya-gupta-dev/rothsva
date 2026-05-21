import { useEffect, useState, type ReactNode } from 'react'
import { apiRequest } from '../lib/api'
import type {
  MainCategory,
  Merchant,
  PaymentMode,
  SubCategory,
} from '../lib/reference-data'
import {
  REFERENCE_STORAGE_KEYS,
  readStoredJson,
  writeStoredJson,
} from '../lib/reference-data'
import { useAuth } from './auth-context'
import {
  ReferenceDataContext,
  type ReferenceDataContextValue,
} from './reference-data-context'

function readSnapshot() {
  return {
    mainCategories: readStoredJson<MainCategory[]>(
      REFERENCE_STORAGE_KEYS.mainCategories,
    ),
    subCategories: readStoredJson<SubCategory[]>(
      REFERENCE_STORAGE_KEYS.subCategories,
    ),
    paymentModes: readStoredJson<PaymentMode[]>(
      REFERENCE_STORAGE_KEYS.paymentModes,
    ),
    merchants: readStoredJson<Merchant[]>(REFERENCE_STORAGE_KEYS.merchants),
  }
}

export function ReferenceDataProvider({
  children,
}: {
  children: ReactNode
}) {
  const { isAuthenticated, token } = useAuth()
  const [mainCategories, setMainCategories] = useState<MainCategory[]>(() =>
    readStoredJson<MainCategory[]>(REFERENCE_STORAGE_KEYS.mainCategories) ?? [],
  )
  const [subCategories, setSubCategories] = useState<SubCategory[]>(() =>
    readStoredJson<SubCategory[]>(REFERENCE_STORAGE_KEYS.subCategories) ?? [],
  )
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>(() =>
    readStoredJson<PaymentMode[]>(REFERENCE_STORAGE_KEYS.paymentModes) ?? [],
  )
  const [merchants, setMerchants] = useState<Merchant[]>(() =>
    readStoredJson<Merchant[]>(REFERENCE_STORAGE_KEYS.merchants) ?? [],
  )
  const [hasStoredReferenceData, setHasStoredReferenceData] = useState(() => {
    const snapshot = readSnapshot()

    return Boolean(
      snapshot.mainCategories &&
        snapshot.subCategories &&
        snapshot.paymentModes &&
        snapshot.merchants &&
        snapshot.mainCategories.length > 0 &&
        snapshot.paymentModes.length > 0,
    )
  })
  const [isLoading, setIsLoading] = useState(false)

  async function fetchAndStoreReferenceData(activeToken: string) {
    const main = await apiRequest<MainCategory[]>('/categories/main', {
      method: 'GET',
      token: activeToken,
    })

    const subGroups = await Promise.all(
      main.map((category) =>
        apiRequest<SubCategory[]>(`/categories/${category.id}/sub`, {
          method: 'GET',
          token: activeToken,
        }),
      ),
    )

    const modes = await apiRequest<PaymentMode[]>('/payment-modes', {
      method: 'GET',
      token: activeToken,
    })

    const merchantList = await apiRequest<Merchant[]>('/merchants', {
      method: 'GET',
      token: activeToken,
    })

    const flattenedSubCategories = subGroups.flat()

    writeStoredJson(REFERENCE_STORAGE_KEYS.mainCategories, main)
    writeStoredJson(
      REFERENCE_STORAGE_KEYS.subCategories,
      flattenedSubCategories,
    )
    writeStoredJson(REFERENCE_STORAGE_KEYS.paymentModes, modes)
    writeStoredJson(REFERENCE_STORAGE_KEYS.merchants, merchantList)

    setMainCategories(main)
    setSubCategories(flattenedSubCategories)
    setPaymentModes(modes)
    setMerchants(merchantList)
    setHasStoredReferenceData(true)
  }

  async function refresh() {
    if (!token) {
      return
    }

    setIsLoading(true)

    try {
      await fetchAndStoreReferenceData(token)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return
    }

    const snapshot = readSnapshot()
    const hasStoredData = Boolean(
      snapshot.mainCategories &&
        snapshot.subCategories &&
        snapshot.paymentModes &&
        snapshot.merchants &&
        snapshot.mainCategories.length > 0 &&
        snapshot.paymentModes.length > 0,
    )

    if (hasStoredData) {
      return
    }

    const activeToken = token
    let cancelled = false

    async function hydrateReferenceData() {
      setIsLoading(true)

      try {
        if (cancelled) {
          return
        }

        await fetchAndStoreReferenceData(activeToken)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    hydrateReferenceData()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, token])

  const value: ReferenceDataContextValue = {
    isReady:
      hasStoredReferenceData &&
      mainCategories.length > 0 &&
      paymentModes.length > 0,
    isLoading,
    mainCategories,
    subCategories,
    paymentModes,
    merchants,
    refresh,
  }

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  )
}
