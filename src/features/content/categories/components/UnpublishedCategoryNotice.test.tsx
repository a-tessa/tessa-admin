import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnpublishedCategoryNotice } from './UnpublishedCategoryNotice'
import * as publishService from '@/features/content/publish/publish.service'

vi.mock('@/features/content/publish/publish.service', () => ({
  fetchAdminContent: vi.fn(),
  publishMainContent: vi.fn(),
  fetchPublicationStatus: vi.fn(),
  retryHomepageTranslations: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockedFetchAdmin = vi.mocked(publishService.fetchAdminContent)
const mockedPublish = vi.mocked(publishService.publishMainContent)

function renderNotice(categorySlug: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <UnpublishedCategoryNotice categorySlug={categorySlug} />
    </QueryClientProvider>,
  )

  return queryClient
}

describe('aviso de categoria em rascunho', () => {
  beforeEach(() => {
    mockedFetchAdmin.mockResolvedValue({
      content: {
        categories: [
          { slug: 'estruturas', name: 'Estruturas' },
          { slug: 'galpoes', name: 'Galpões' },
        ],
      },
      publishedContent: {
        categories: [{ slug: 'estruturas', name: 'Estruturas' }],
      },
      status: 'published',
      publishedAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-27T00:00:00.000Z',
    })
    mockedPublish.mockResolvedValue({
      content: {},
      publishedContent: {
        categories: [
          { slug: 'estruturas', name: 'Estruturas' },
          { slug: 'galpoes', name: 'Galpões' },
        ],
      },
      status: 'published',
      publishedAt: '2026-09-27T00:00:00.000Z',
      updatedAt: '2026-09-27T00:00:00.000Z',
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('mostra a mensagem e o botão quando a categoria ainda não foi publicada', async () => {
    renderNotice('galpoes')

    expect(
      await screen.findByText(
        'Essa categoria está em rascunho, publique primeiro as alterações de nova categoria criada',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument()
  })

  it('não mostra o aviso para uma categoria já publicada', async () => {
    const queryClient = renderNotice('estruturas')

    await waitFor(() => {
      expect(queryClient.isFetching()).toBe(0)
    })
    expect(
      screen.queryByText(
        'Essa categoria está em rascunho, publique primeiro as alterações de nova categoria criada',
      ),
    ).not.toBeInTheDocument()
  })

  it('publica o conteúdo ao clicar no botão', async () => {
    const user = userEvent.setup()
    renderNotice('galpoes')

    await user.click(await screen.findByRole('button', { name: 'Publicar' }))

    expect(mockedPublish).toHaveBeenCalledOnce()
  })
})
