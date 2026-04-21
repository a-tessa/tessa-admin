export interface Representant {
  id: string
  name: string
  companyName: string
  segment: string
  phone: string
  city: string
  state: string
  email: string
}

export interface RepresentantInput {
  name: string
  companyName: string
  segment: string
  phone: string
  city: string
  state: string
  email: string
}

export interface RepresentantsResponse {
  representantsBase: Representant[]
}

export interface RepresentantItemResponse {
  item: Representant
}

export interface RepresentantSegmentsResponse {
  segments: string[]
}
