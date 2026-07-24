import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import {
  createIndustrySection,
  deleteIndustrySection,
  fetchIndustrySection,
  updateIndustrySection,
} from './industry.service'
import type { IndustrySection } from './types'

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
const section: IndustrySection = {
  titlePrefix: 'A força da',
  title: 'indústria brasileira',
  subtitle: 'Estruturas que transformam projetos.',
  videos: {
    'pt-BR': { url: 'https://youtu.be/EeLYcZsdYrw' },
  },
}

describe('serviço da seção Indústria', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('representa uma seção ainda não criada como nula', async () => {
    mockedRequest.mockRejectedValueOnce(
      new ApiError('Seção Indústria não encontrada.', 404),
    )

    await expect(fetchIndustrySection()).resolves.toBeNull()
  })

  it('consulta, cria, atualiza e remove pelo endpoint da seção', async () => {
    mockedRequest
      .mockResolvedValueOnce({ industrySection: section })
      .mockResolvedValueOnce({ industrySection: section })
      .mockResolvedValueOnce({ industrySection: section })
      .mockResolvedValueOnce(undefined)

    await fetchIndustrySection()
    await createIndustrySection(section)
    await updateIndustrySection(section)
    await deleteIndustrySection()

    expect(mockedRequest).toHaveBeenNthCalledWith(
      1,
      '/api/content/admin/industry-section',
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(
      2,
      '/api/content/admin/industry-section',
      {
        method: 'POST',
        body: JSON.stringify(section),
      },
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      '/api/content/admin/industry-section',
      {
        method: 'PUT',
        body: JSON.stringify(section),
      },
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(
      4,
      '/api/content/admin/industry-section',
      {
        method: 'DELETE',
      },
    )
  })
})
