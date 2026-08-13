export interface CompanyPhoneContact {
  phone: string
}

export interface CompanyInformation {
  name: string
  cnpj: string
  address: string
  zipCode: string
  email: string
  whatsapp?: string
  phoneContacts: CompanyPhoneContact[]
}

export interface CompanyInformationResponse {
  companyInformation: CompanyInformation
}
