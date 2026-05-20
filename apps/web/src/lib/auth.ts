export type AuthUser = {
  id: string
  name: string
  email: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export type MeResponse = {
  user: AuthUser
}

export type RegisterResponse = {
  user: AuthUser
}
