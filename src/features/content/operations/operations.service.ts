import { upload } from '@vercel/blob/client'
import { readStoredAccessToken } from '@/features/auth/auth-storage'
import { env } from '@/shared/config/env'
import {
  ApiError,
  authenticatedRequest,
} from '@/shared/lib/api'
import type {
  OperationAssetUploadResponse,
  OperationSection,
  OperationSectionResponse,
} from './types'
import { MAX_OPERATION_IMAGE_BYTES } from './operations.schema'

const BASE_PATH = '/api/content/admin/operation-section'
const ASSETS_PATH = `${BASE_PATH}/assets`
const BLOB_UPLOAD_TOKEN_PATH = `${ASSETS_PATH}/blob/upload-token`
const FINALIZE_PATH = `${ASSETS_PATH}/finalize`
const OPERATION_SECTION_STAGING_PREFIX =
  'landing-page/home/operation-section/staging/'

function slugifyFilenameBase(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '')
  const normalized = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized.length > 0 ? normalized : 'image'
}

function buildOperationStagingPathname(originalFilename: string): string {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const filenameBase = slugifyFilenameBase(originalFilename)
  const extensionMatch = /\.(jpe?g|png|webp)$/i.exec(originalFilename)
  const extension = extensionMatch
    ? `.${extensionMatch[1]!.toLowerCase()}`
    : '.jpg'
  const safeExtension = extension === '.jpeg' ? '.jpg' : extension

  return `${OPERATION_SECTION_STAGING_PREFIX}${timestamp}-${filenameBase}${safeExtension}`
}

export async function fetchOperationSection(): Promise<OperationSection | null> {
  try {
    const response: OperationSectionResponse =
      await authenticatedRequest<OperationSectionResponse>(BASE_PATH)
    return response.operationSection
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createOperationSection(
  input: OperationSection,
): Promise<OperationSectionResponse> {
  return authenticatedRequest<OperationSectionResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateOperationSection(
  input: OperationSection,
): Promise<OperationSectionResponse> {
  return authenticatedRequest<OperationSectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteOperationSection(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

/**
 * Client-direct Blob upload + JSON finalize.
 * Avoids Vercel multipart 503 for bodies ≳ ~1MB on the serverless function.
 */
export async function uploadOperationAsset(
  file: File,
  index?: number,
  onProgress?: (percentage: number) => void,
): Promise<OperationAssetUploadResponse> {
  if (file.size <= 0) {
    throw new ApiError('Arquivo inválido.', 400)
  }

  if (file.size > MAX_OPERATION_IMAGE_BYTES) {
    throw new ApiError(
      `Arquivo maior do que o permitido. Limite: ${String(MAX_OPERATION_IMAGE_BYTES)} bytes.`,
      413,
    )
  }

  const accessToken = readStoredAccessToken()
  if (!accessToken) {
    throw new ApiError('Sessão expirada. Faça login novamente.', 401)
  }

  const pathname = buildOperationStagingPathname(file.name)
  onProgress?.(0)

  const blob = await upload(pathname, file, {
    access: 'public',
    ...(file.type ? { contentType: file.type } : {}),
    handleUploadUrl: `${env.apiBaseUrl}${BLOB_UPLOAD_TOKEN_PATH}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    onUploadProgress: ({ percentage }): void => {
      onProgress?.(Math.min(90, Math.round(percentage * 0.9)))
    },
  })

  onProgress?.(92)

  const finalized = await authenticatedRequest<OperationAssetUploadResponse>(
    FINALIZE_PATH,
    {
      method: 'POST',
      body: JSON.stringify({
        url: blob.url,
        pathname: blob.pathname,
        originalFilename: file.name,
        index: typeof index === 'number' ? index : 0,
      }),
    },
  )

  onProgress?.(100)
  return finalized
}
