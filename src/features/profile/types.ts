export interface UpdateProfileInput {
  name: string
  email: string
  avatar?: File | null
  removeAvatar?: boolean
}
