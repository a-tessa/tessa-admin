import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  authenticatedRequest,
  authenticatedUploadRequest,
} from '@/shared/lib/api'
import {
  createOperationSection,
  deleteOperationSection,
  fetchOperationSection,
  updateOperationSection,
  uploadOperationAsset,
} from './operations.service'
import type { OperationSection } from './types'

vi.mock('@/shared/lib/api', () => ({
  ApiError: class ApiError extends Error {
    public readonly status: number

    public constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  authenticatedRequest: vi.fn(),
  authenticatedUploadRequest: vi.fn(),
}))

const mockedRequest = vi.mocked(authenticatedRequest)
const mockedUploadRequest = vi.mocked(authenticatedUploadRequest)
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
    mockedUploadRequest.mockReset()
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

  it('envia upload unitário como multipart FormData', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'foto.jpg', {
      type: 'image/jpeg',
    })
    mockedUploadRequest.mockResolvedValueOnce({
      url: 'https://cdn.example.com/foto.webp',
      pathname: 'landing-page/home/operation-section/image-2/foto.webp',
      mimeType: 'image/webp',
      sizeBytes: 12,
      originalFilename: 'foto.jpg',
      index: 2,
    })

    const handleProgress = vi.fn()
    await uploadOperationAsset(file, 2, handleProgress)

    expect(mockedUploadRequest).toHaveBeenCalledTimes(1)
    const call = mockedUploadRequest.mock.calls[0]
    expect(call).toBeDefined()
    const [path, formData, onProgress] = call ?? []
    expect(path).toBe('/api/content/admin/operation-section/assets')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('file')).toBe(file)
    expect(formData.get('index')).toBe('2')
    expect(onProgress).toBe(handleProgress)
  })
})
