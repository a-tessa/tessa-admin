import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/lib/api'
import { createAppQueryClient } from '@/shared/lib/query-client'
import { fetchBlogArticleBySlug } from '../blog.service'
import { BlogArticleEditPage } from './BlogArticleEditPage'

vi.mock('../blog.service', () => ({
  fetchBlogArticleBySlug: vi.fn(),
  updateBlogArticle: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockedFetch = vi.mocked(fetchBlogArticleBySlug)

function renderMissingArticle() {
  const rootRoute = createRootRoute()
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/blog',
    component: () => <div>Lista de artigos</div>,
  })
  const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/blog/$slug',
    component: BlogArticleEditPage,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([listRoute, editRoute]),
    history: createMemoryHistory({
      initialEntries: ['/conteudo/blog/id-inexistente-qa'],
    }),
  })
  const queryClient = createAppQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('BlogArticleEditPage', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('mostra artigo não encontrado quando o fetch responde 404', async () => {
    mockedFetch.mockRejectedValue(new ApiError('Artigo não encontrado.', 404))

    renderMissingArticle()

    expect(
      await screen.findByRole('heading', { name: 'Artigo não encontrado' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Voltar para a lista' }).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText('Erro ao carregar artigo')).not.toBeInTheDocument()
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenCalledWith('id-inexistente-qa')
  })
})
