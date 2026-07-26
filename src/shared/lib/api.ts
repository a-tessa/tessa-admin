import { env } from '@/shared/config/env'
import { readStoredAccessToken } from '@/features/auth/auth-storage'

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

function buildRequestUrl(path: string): string {
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

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function authenticatedRequest<T>(
  path: string,
  init: RequestInit = {},
) {
  const token = readStoredAccessToken()

  if (!token) {
    throw new ApiError('Sessão expirada. Faça login novamente.', 401)
  }

  return apiRequest<T>(path, init, token)
}

function parseXhrPayload(xhr: XMLHttpRequest): unknown {
  if (xhr.response !== null && xhr.response !== undefined) {
    return xhr.response
  }

  if (!xhr.responseText) {
    return null
  }

  try {
    return JSON.parse(xhr.responseText) as unknown
  } catch {
    return null
  }
}

export async function authenticatedUploadRequest<T>(
  path: string,
  body: FormData,
  onProgress?: (percentage: number) => void,
): Promise<T> {
  const token = readStoredAccessToken()

  if (!token) {
    throw new ApiError('Sessão expirada. Faça login novamente.', 401)
  }

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', buildRequestUrl(path))
    xhr.responseType = 'json'
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.addEventListener('progress', (event: ProgressEvent): void => {
      if (!event.lengthComputable || event.total <= 0) return
      onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    })

    xhr.addEventListener('error', (): void => {
      reject(new ApiError('Não foi possível enviar o arquivo.', 0))
    })

    xhr.addEventListener('load', (): void => {
      const payload = parseXhrPayload(xhr)
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve(payload as T)
        return
      }

      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'error' in payload &&
        typeof payload.error === 'string' &&
        payload.error.trim()
          ? payload.error
          : `A API respondeu com status ${String(xhr.status)}.`
      reject(new ApiError(message, xhr.status))
    })

    onProgress?.(0)
    xhr.send(body)
  })
}
