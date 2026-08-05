import { beforeEach, describe, expect, it, vi } from 'vitest'
import { upload } from '@vercel/blob/client'
import { readStoredAccessToken } from '@/features/auth/auth-storage'
import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import {
  createOperationSection,
  deleteOperationSection,
  fetchOperationSection,
  updateOperationSection,
  uploadOperationAsset,
} from './operations.service'
import type { OperationSection } from './types'

vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(),
}))

vi.mock('@/features/auth/auth-storage', () => ({
  readStoredAccessToken: vi.fn(),
}))

vi.mock('@/shared/config/env', () => ({
  env: {
    apiBaseUrl: 'https://api.example.com',
  },
}))

vi.mock('@/shared/lib/api', () => ({
  ApiError: class ApiError extends Error {
    public readonly status: number

    public constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  authenticatedRequest: vi.fn(),
}))

const mockedRequest = vi.mocked(authenticatedRequest)
const mockedUpload = vi.mocked(upload)
const mockedReadToken = vi.mocked(readStoredAccessToken)
const section: OperationSection = {
  images: [
    {
      url: 'https://cdn.example.com/a.webp',
      alt: 'Alt A',
      caption: 'Legenda',
    },
  ],
}

describe('serviço da seção Operações', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
    mockedUpload.mockReset()
    mockedReadToken.mockReset()
  })

  it('representa uma seção ainda não criada como nula', async () => {
    mockedRequest.mockRejectedValueOnce(
      new ApiError('Seção de operação não encontrada.', 404),
    )

    await expect(fetchOperationSection()).resolves.toBeNull()
  })

  it('consulta, cria, atualiza e remove pelo endpoint da seção', async () => {
    mockedRequest
      .mockResolvedValueOnce({ operationSection: section })
      .mockResolvedValueOnce({ operationSection: section })
      .mockResolvedValueOnce({ operationSection: section })
      .mockResolvedValueOnce(undefined)

    await fetchOperationSection()
    await createOperationSection(section)
    await updateOperationSection(section)
    await deleteOperationSection()

    expect(mockedRequest).toHaveBeenNthCalledWith(
      1,
      '/api/content/admin/operation-section',
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(
      2,
      '/api/content/admin/operation-section',
      {
        method: 'POST',
        body: JSON.stringify(section),
      },
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      '/api/content/admin/operation-section',
      {
        method: 'PUT',
        body: JSON.stringify(section),
      },
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(
      4,
      '/api/content/admin/operation-section',
      {
        method: 'DELETE',
      },
    )
  })

  it('envia upload unitário via Blob client e finaliza em JSON', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'foto.jpg', {
      type: 'image/jpeg',
    })
    mockedReadToken.mockReturnValue('access-token')
    mockedUpload.mockResolvedValueOnce({
      url: 'https://store.public.blob.vercel-storage.com/landing-page/home/operation-section/staging/foto.jpg',
      pathname:
        'landing-page/home/operation-section/staging/2026-foto.jpg',
      contentType: 'image/jpeg',
      contentDisposition: 'inline',
    } as Awaited<ReturnType<typeof upload>>)
    mockedRequest.mockResolvedValueOnce({
      url: 'https://cdn.example.com/foto.webp',
      pathname: 'landing-page/home/operation-section/image-2/foto.webp',
      mimeType: 'image/webp',
      sizeBytes: 12,
      originalFilename: 'foto.jpg',
      index: 2,
    })

    const handleProgress = vi.fn()
    await uploadOperationAsset(file, 2, handleProgress)

    expect(mockedUpload).toHaveBeenCalledTimes(1)
    const uploadCall = mockedUpload.mock.calls[0]
    expect(uploadCall).toBeDefined()
    if (!uploadCall) throw new Error('Expected blob upload call')

    const [pathname, uploadedFile, options] = uploadCall
    expect(pathname).toContain('landing-page/home/operation-section/staging/')
    expect(pathname).toContain('foto')
    expect(uploadedFile).toBe(file)
    expect(options?.handleUploadUrl).toBe(
      'https://api.example.com/api/content/admin/operation-section/assets/blob/upload-token',
    )
    expect(options?.headers).toEqual({
      Authorization: 'Bearer access-token',
    })

    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/content/admin/operation-section/assets/finalize',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://store.public.blob.vercel-storage.com/landing-page/home/operation-section/staging/foto.jpg',
          pathname:
            'landing-page/home/operation-section/staging/2026-foto.jpg',
          originalFilename: 'foto.jpg',
          index: 2,
        }),
      },
    )
    expect(handleProgress).toHaveBeenCalled()
  })
})
