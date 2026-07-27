export interface UpdateProfileInput {
  name: string
  email: string
  cpf: string
  phone: string
  avatar?: File | null
  removeAvatar?: boolean
}
