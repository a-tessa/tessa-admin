/**
 * Digits-only CPF/CNPJ helpers and Brazilian phone display helpers.
 */

export function normalizeCpfDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11)
}

export function formatCpfDisplay(digitsOrRaw: string): string {
  const d = normalizeCpfDigits(digitsOrRaw)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function normalizeCnpjDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 14)
}

export function formatCnpjDisplay(digitsOrRaw: string): string {
  const d = normalizeCnpjDigits(digitsOrRaw)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function isCompleteCnpj(raw: string): boolean {
  return normalizeCnpjDigits(raw).length === 14
}

function cpfCheckDigit(base: string, factorStart: number): number {
  let sum = 0

  for (let index = 0; index < base.length; index += 1) {
    sum += Number(base[index]) * (factorStart - index)
  }

  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(raw: string): boolean {
  const digits = normalizeCpfDigits(raw)

  if (digits.length !== 11) {
    return false
  }

  if (/^(\d)\1{10}$/.test(digits)) {
    return false
  }

  const first = cpfCheckDigit(digits.slice(0, 9), 10)
  const second = cpfCheckDigit(digits.slice(0, 10), 11)

  return first === Number(digits[9]) && second === Number(digits[10])
}

export function normalizeBrazilPhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '')

  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2, 13)
  } else {
    digits = digits.slice(0, 11)
  }

  return digits
}

export function formatBrazilPhoneDisplay(digitsOrRaw: string): string {
  const digits = normalizeBrazilPhoneDigits(digitsOrRaw)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const isMobile = rest[0] === '9'

  if (isMobile) {
    const sub = rest.slice(0, 9)
    if (sub.length <= 5) return `(${ddd}) ${sub}`
    return `(${ddd}) ${sub.slice(0, 5)}-${sub.slice(5)}`
  }

  const sub = rest.slice(0, 8)
  if (sub.length <= 4) return `(${ddd}) ${sub}`
  return `(${ddd}) ${sub.slice(0, 4)}-${sub.slice(4)}`
}

/** Celular nacional: (DD) 99999-9999 — 5 dígitos após o DDD, depois o hífen. */
export function formatBrazilMobileDisplay(digitsOrRaw: string): string {
  const digits = normalizeBrazilPhoneDigits(digitsOrRaw)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2, 11)

  if (rest.length <= 5) return `(${ddd}) ${rest}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}

export function isValidBrazilPhone(raw: string): boolean {
  const digits = normalizeBrazilPhoneDigits(raw)
  return digits.length === 10 || digits.length === 11
}

export function isValidBrazilMobile(raw: string): boolean {
  return normalizeBrazilPhoneDigits(raw).length === 11
}
