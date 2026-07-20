import { upload } from '@vercel/blob/client'
import { readStoredAccessToken } from '@/features/auth/auth-storage'
import { env } from '@/shared/config/env'
import { authenticatedRequest, ApiError } from '@/shared/lib/api'
import type { ContentLocale } from './types'
import type {
  DocumentAdminResponse,
  DocumentFormInput,
  DocumentsAdminListResponse,
  PersistDocumentFileInput,
} from './types'

const BASE_PATH = '/api/documents'
const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024

export async function fetchAdminDocuments(): Promise<DocumentsAdminListResponse> {
  return authenticatedRequest<DocumentsAdminListResponse>(`${BASE_PATH}/admin`)
}

export async function createDocument(
  input: DocumentFormInput,
): Promise<DocumentAdminResponse> {
  return authenticatedRequest<DocumentAdminResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateDocument(
  id: string,
  input: DocumentFormInput,
): Promise<DocumentAdminResponse> {
  return authenticatedRequest<DocumentAdminResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteDocument(id: string): Promise<undefined> {
  await authenticatedRequest<undefined>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

export async function persistDocumentFile(
  documentId: string,
  locale: ContentLocale,
  input: PersistDocumentFileInput,
): Promise<DocumentAdminResponse> {
  return authenticatedRequest<DocumentAdminResponse>(
    `${BASE_PATH}/${documentId}/files/${locale}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}

export async function deleteDocumentFile(
  documentId: string,
  locale: ContentLocale,
): Promise<DocumentAdminResponse> {
  return authenticatedRequest<DocumentAdminResponse>(
    `${BASE_PATH}/${documentId}/files/${locale}`,
    {
      method: 'DELETE',
    },
  )
}

function buildDocumentBlobPathname(
  documentId: string,
  locale: ContentLocale,
  originalFilename: string,
): string {
  const safeName = originalFilename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)

  const filename = safeName.endsWith('.pdf')
    ? safeName
    : `${safeName || 'document'}.pdf`

  return `documents/${documentId}/${locale}/${String(Date.now())}-${filename}`
}

export async function uploadDocumentPdf(
  documentId: string,
  locale: ContentLocale,
  file: File,
): Promise<DocumentAdminResponse> {
  if (file.type !== 'application/pdf') {
    throw new ApiError('Apenas arquivos PDF são aceitos.', 400)
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    const limitMb = Math.floor(MAX_DOCUMENT_BYTES / (1024 * 1024))
    throw new ApiError(
      `Arquivo maior do que o permitido. Limite: ${String(limitMb)} MB.`,
      400,
    )
  }

  const accessToken = readStoredAccessToken()
  if (!accessToken) {
    throw new ApiError('Sessão expirada. Faça login novamente.', 401)
  }

  const pathname = buildDocumentBlobPathname(documentId, locale, file.name)
  const blob = await upload(pathname, file, {
    access: 'public',
    contentType: 'application/pdf',
    handleUploadUrl: `${env.apiBaseUrl}${BASE_PATH}/blob/upload-token`,
    clientPayload: JSON.stringify({
      token: accessToken,
      documentId,
      locale,
    }),
  })

  return persistDocumentFile(documentId, locale, {
    url: blob.url,
    pathname: blob.pathname,
    mimeType: 'application/pdf',
    sizeBytes: file.size,
    originalFilename: file.name,
  })
}

export async function uploadDocumentCover(
  documentId: string,
  locale: ContentLocale,
  file: File,
): Promise<DocumentAdminResponse> {
  if (!file.type.startsWith('image/')) {
    throw new ApiError('Envie uma imagem JPG, PNG ou WebP.', 400)
  }

  const formData = new FormData()
  formData.append('coverImage', file)

  return authenticatedRequest<DocumentAdminResponse>(
    `${BASE_PATH}/${documentId}/files/${locale}/cover`,
    {
      method: 'PUT',
      body: formData,
    },
  )
}

export async function deleteDocumentCover(
  documentId: string,
  locale: ContentLocale,
): Promise<DocumentAdminResponse> {
  return authenticatedRequest<DocumentAdminResponse>(
    `${BASE_PATH}/${documentId}/files/${locale}/cover`,
    {
      method: 'DELETE',
    },
  )
}
