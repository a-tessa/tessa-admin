const defaultApiBaseUrl = 'http://localhost:3002'

function normalizeApiBaseUrl(value: string | undefined) {
  const trimmedValue = value?.trim()
  const candidate =
    trimmedValue === undefined || trimmedValue === '' ? defaultApiBaseUrl : trimmedValue

  try {
    return new URL(candidate).toString().replace(/\/$/, '')
  } catch {
    throw new Error('VITE_API_BASE_URL precisa ser uma URL absoluta válida.')
  }
}

export const env = {
  apiBaseUrl: normalizeApiBaseUrl(
    typeof import.meta.env['VITE_API_BASE_URL'] === 'string'
      ? import.meta.env['VITE_API_BASE_URL']
      : undefined,
  ),
}
