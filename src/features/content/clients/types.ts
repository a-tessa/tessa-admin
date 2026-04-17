export interface ClientLogo {
  id: string
  name: string
  alt: string
  logoUrl: string
  website?: string | undefined
}

export interface ClientInput {
  name: string
  alt: string
  website?: string | undefined
  logoUrl?: string | undefined
}

export interface ClientsResponse {
  clients: ClientLogo[]
}

export interface ClientItemResponse {
  item: ClientLogo
}

export interface ClientFormData {
  payload: ClientInput
  file?: File | undefined
}
