import type { ApiEnvelope } from './auth'

export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

type RequestOptions = RequestInit & {
  token?: string
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || payload?.err) {
    const message =
      payload?.err || 'Request failed'

    throw new Error(message)
  }

  if (!payload?.data) {
    throw new Error('Missing response data')
  }

  return payload.data
}

export async function getTransactions(token: string) {
  return apiRequest<unknown[]>('/transactions', { token })
}

export async function getTransactionDetail(id: string, token: string) {
  return apiRequest<unknown>(`/transactions/${id}`, { token })
}

export async function getMonthlyStats(token: string) {
  return apiRequest<unknown[]>('/stats/monthly', { token })
}
