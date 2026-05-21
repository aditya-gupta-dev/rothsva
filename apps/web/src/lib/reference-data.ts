export type MainCategory = {
  id: number
  name: string
  parentId: null
}

export type SubCategory = {
  id: number
  name: string
  parentId: number
}

export type PaymentMode = {
  id: number
  name: string
}

export type Merchant = {
  id: number
  name: string
}

export const REFERENCE_STORAGE_KEYS = {
  mainCategories: 'zapisi.reference.main-categories',
  subCategories: 'zapisi.reference.sub-categories',
  paymentModes: 'zapisi.reference.payment-modes',
  merchants: 'zapisi.reference.merchants',
} as const

export function readStoredJson<T>(key: string): T | null {
  const value = window.localStorage.getItem(key)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function writeStoredJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
