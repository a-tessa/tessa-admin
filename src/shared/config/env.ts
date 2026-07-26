const defaultApiBaseUrl = 'http://localhost:3002'
const defaultPublicSiteUrl = 'http://localhost:3000'

function normalizeAbsoluteUrl(
  value: string | undefined,
  fallback: string,
  envName: string,
) {
  const trimmedValue = value?.trim()
  const candidate =
    trimmedValue === undefined || trimmedValue === '' ? fallback : trimmedValue

  try {
    return new URL(candidate).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${envName} precisa ser uma URL absoluta válida.`)
  }
}

export const env = {
  apiBaseUrl: normalizeAbsoluteUrl(
    typeof import.meta.env['VITE_API_BASE_URL'] === 'string'
      ? import.meta.env['VITE_API_BASE_URL']
      : undefined,
    defaultApiBaseUrl,
    'VITE_API_BASE_URL',
  ),
  publicSiteUrl: normalizeAbsoluteUrl(
    typeof import.meta.env['VITE_PUBLIC_SITE_URL'] === 'string'
      ? import.meta.env['VITE_PUBLIC_SITE_URL']
      : undefined,
    defaultPublicSiteUrl,
    'VITE_PUBLIC_SITE_URL',
  ),
}
