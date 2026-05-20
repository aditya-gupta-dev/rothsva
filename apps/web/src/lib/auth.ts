export type AuthUser = {
  id: number
  name: string
  email: string
}

export type ApiEnvelope<T> = {
  data: T | null
  err: string | null
}

export type LoginData = {
  token: string
  user: AuthUser
}

export type MeData = {
  user: AuthUser
}

export type RegisterData = {
  user: AuthUser
  message: string
}
