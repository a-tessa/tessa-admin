import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PublishFloatingBar } from './PublishFloatingBar'
import { PublicationReadinessProvider } from '../publication-readiness'
import * as publishService from '../publish.service'

vi.mock('../publish.service', () => ({
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
const mockedStatus = vi.mocked(publishService.fetchPublicationStatus)
const mockedRetry = vi.mocked(publishService.retryHomepageTranslations)

function renderBar() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const rootRoute = createRootRoute({
    component: () => (
      <PublicationReadinessProvider>
        <PublishFloatingBar />
      </PublicationReadinessProvider>
    ),
  })
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/pagina-inicial',
    validateSearch: (search: Record<string, unknown>) => ({
      aba: typeof search['aba'] === 'string' ? search['aba'] : 'secao-principal',
    }),
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute]),
    history: createMemoryHistory({
      initialEntries: ['/conteudo/pagina-inicial?aba=industria'],
    }),
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { queryClient, router }
}

describe('PublishFloatingBar brief', () => {
  beforeEach(() => {
    mockedFetchAdmin.mockResolvedValue({
      content: {
        heroSection: [{ title: 'Depois' }],
        industrySection: {
          titlePrefix: 'A força da',
          title: 'indústria',
          subtitle: 'Texto',
          videos: {
            'pt-BR': { url: 'https://youtube.com/watch?v=pt' },
          },
        },
        operationSection: {
          images: Array.from({ length: 6 }, (_, index) => ({
            url: `https://cdn.example.com/${String(index)}.webp`,
            alt: `Alt ${String(index)}`,
          })),
        },
      },
      publishedContent: {
        heroSection: [{ title: 'Antes' }],
        operationSection: {
          images: Array.from({ length: 6 }, (_, index) => ({
            url: `https://cdn.example.com/old-${String(index)}.webp`,
            alt: `Alt ${String(index)}`,
          })),
        },
      },
      status: 'draft',
      publishedAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-25T00:00:00.000Z',
    })
    mockedStatus.mockResolvedValue({
      translations: {
        configured: true,
        locales: [
          {
            locale: 'en',
            status: 'failed',
            attempts: 2,
            error: 'timeout',
            fields: ['industry.title'],
            updatedAt: '2026-07-25T00:00:00.000Z',
          },
          {
            locale: 'es',
            status: 'completed',
            attempts: 1,
            error: null,
            fields: ['industry.title'],
            updatedAt: '2026-07-25T00:00:00.000Z',
          },
        ],
      },
    })
    mockedPublish.mockResolvedValue({
      content: {},
      publishedContent: {},
      status: 'published',
      publishedAt: '2026-07-25T01:00:00.000Z',
      updatedAt: '2026-07-25T01:00:00.000Z',
    })
    mockedRetry.mockResolvedValue({
      translations: {
        configured: true,
        locales: [
          {
            locale: 'en',
            status: 'completed',
            attempts: 3,
            error: null,
            fields: ['industry.title'],
            updatedAt: '2026-07-25T01:05:00.000Z',
          },
          {
            locale: 'es',
            status: 'completed',
            attempts: 1,
            error: null,
            fields: ['industry.title'],
            updatedAt: '2026-07-25T00:00:00.000Z',
          },
        ],
      },
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('mostra o brief com seções, operações, vídeos e bloqueia envio duplicado', async () => {
    const user = userEvent.setup()
    renderBar()

    await user.click(await screen.findByRole('button', { name: 'Publicar' }))

    const brief = await screen.findByRole('alertdialog')
    expect(within(brief).getByText('Brief de publicação')).toBeInTheDocument()
    expect(within(brief).getByText('Seção Principal')).toBeInTheDocument()
    expect(within(brief).getByText('Indústria')).toBeInTheDocument()
    expect(
      within(brief).getAllByText('Operações').length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      within(brief).getByText(/6 adicionada\(s\), 6 removida\(s\)/),
    ).toBeInTheDocument()
    expect(
      within(brief).getByText(/Fallback pt-BR: Inglês/),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedStatus).toHaveBeenCalled()
      expect(brief.textContent).toMatch(/Inglês/)
      expect(brief.textContent).toMatch(/com falha/)
      expect(brief.textContent).toMatch(/timeout/)
    })

    await user.click(screen.getByRole('button', { name: 'Publicar agora' }))

    await waitFor(() => {
      expect(mockedPublish).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByText('Publicação concluída'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Abrir página inicial pública/ }),
    ).toHaveAttribute('href', 'http://localhost:3000/pt-BR')
    expect(screen.getByText(/até 60 segundos/)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Tentar traduções novamente' }),
    )
    await waitFor(() => {
      expect(mockedRetry).toHaveBeenCalledTimes(1)
    })
  })

  it('bloqueia a confirmação quando Operações tem menos de seis imagens', async () => {
    mockedFetchAdmin.mockResolvedValue({
      content: {
        operationSection: {
          images: Array.from({ length: 4 }, (_, index) => ({
            url: `https://cdn.example.com/${String(index)}.webp`,
            alt: `Alt ${String(index)}`,
          })),
        },
      },
      publishedContent: null,
      status: 'draft',
      publishedAt: null,
      updatedAt: '2026-07-25T00:00:00.000Z',
    })

    const user = userEvent.setup()
    renderBar()

    await user.click(await screen.findByRole('button', { name: 'Publicar' }))

    expect(
      await screen.findByText(/pelo menos seis imagens/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Publicar agora' }),
    ).toBeDisabled()
    expect(mockedPublish).not.toHaveBeenCalled()
  })
})
