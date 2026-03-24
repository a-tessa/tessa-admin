import { env } from '@/shared/config/env'

interface ApiErrorPayload {
  error?: string
}

export class ApiError extends Error {
  public readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function buildRequestUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return new URL(normalizedPath, `${env.apiBaseUrl}/`).toString()
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
) {
  const headers = new Headers(init.headers)

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(buildRequestUrl(path), {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `A API respondeu com status ${String(response.status)}.`

    try {
      const payload = (await response.json()) as ApiErrorPayload

      if (typeof payload.error === 'string' && payload.error.trim()) {
        message = payload.error
      }
    } catch {
      // Fallback silencioso para respostas sem JSON válido.
    }

    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}
