import { createContext, useContext } from 'react'
import type {
  MainCategory,
  Merchant,
  PaymentMode,
  SubCategory,
} from '../lib/reference-data'

export type ReferenceDataContextValue = {
  isReady: boolean
  isLoading: boolean
  mainCategories: MainCategory[]
  subCategories: SubCategory[]
  paymentModes: PaymentMode[]
  merchants: Merchant[]
  refresh: () => Promise<void>
}

export const ReferenceDataContext =
  createContext<ReferenceDataContextValue | null>(null)

export function useReferenceData() {
  const context = useContext(ReferenceDataContext)

  if (!context) {
    throw new Error(
      'useReferenceData must be used within ReferenceDataProvider',
    )
  }

  return context
}
