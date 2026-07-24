import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createIndustrySection,
  deleteIndustrySection,
  fetchIndustrySection,
  updateIndustrySection,
} from '../industry.service'
import { IndustrySectionEditor } from './IndustrySectionEditor'
import type { IndustrySection } from '../types'

vi.mock('../industry.service', () => ({
  fetchIndustrySection: vi.fn(),
  createIndustrySection: vi.fn(),
  updateIndustrySection: vi.fn(),
  deleteIndustrySection: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockedFetch = vi.mocked(fetchIndustrySection)
const mockedCreate = vi.mocked(createIndustrySection)
const mockedUpdate = vi.mocked(updateIndustrySection)
const mockedDelete = vi.mocked(deleteIndustrySection)
const section: IndustrySection = {
  titlePrefix: 'A força da',
  title: 'indústria brasileira',
  subtitle: 'Estruturas que transformam projetos em realidade.',
  videos: {
    'pt-BR': {
      url: 'https://www.youtube.com/watch?v=EeLYcZsdYrw',
      startSeconds: 8,
    },
  },
}

function renderEditor() {
  const rootRoute = createRootRoute()
  const editorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/pagina-inicial',
    component: IndustrySectionEditor,
  })
  const otherRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <div>Outra rota</div>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([editorRoute, otherRoute]),
    history: createMemoryHistory({
      initialEntries: ['/conteudo/pagina-inicial?aba=industria'],
    }),
  })
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return router
}

describe('editor da seção Indústria', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    mockedCreate.mockReset()
    mockedUpdate.mockReset()
    mockedDelete.mockReset()
    mockedFetch.mockResolvedValue(section)
    mockedCreate.mockResolvedValue({ industrySection: section })
    mockedUpdate.mockResolvedValue({ industrySection: section })
    mockedDelete.mockResolvedValue(undefined)
  })

  it('carrega o rascunho, mostra contadores e atualiza a prévia', async () => {
    const user = userEvent.setup()
    renderEditor()

    const titleInput = await screen.findByLabelText('Título principal')
    expect(titleInput).toHaveValue(section.title)
    expect(screen.getByText('20 / 100')).toBeInTheDocument()
    expect(
      screen.getByTitle('Prévia do vídeo da seção Indústria'),
    ).toHaveAttribute('src', expect.stringContaining('&start=8'))

    await user.clear(titleInput)
    await user.type(titleInput, 'indústria sob medida')

    expect(screen.getByText('indústria sob medida')).toBeInTheDocument()
  })

  it('valida junto ao campo e salva somente o rascunho', async () => {
    const user = userEvent.setup()
    renderEditor()

    const videoInput = await screen.findByLabelText('URL do YouTube — Português')
    await user.clear(videoInput)
    await user.type(videoInput, 'https://example.com/video')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    expect(
      await screen.findByText('Informe uma URL válida do YouTube.'),
    ).toBeInTheDocument()
    expect(mockedUpdate).not.toHaveBeenCalled()

    await user.clear(videoInput)
    await user.type(
      videoInput,
      'https://www.youtube.com/watch?v=EeLYcZsdYrw',
    )
    const titleInput = screen.getByLabelText('Título principal')
    await user.clear(titleInput)
    await user.type(titleInput, 'indústria brasileira renovada')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith({
        ...section,
        title: 'indústria brasileira renovada',
      })
    })
    expect(
      screen.getByText('Salvar atualiza o rascunho. A landing muda apenas após a publicação global.'),
    ).toBeInTheDocument()
  })

  it('oferece nova tentativa quando o carregamento falha', async () => {
    const user = userEvent.setup()
    mockedFetch
      .mockRejectedValueOnce(new Error('API indisponível'))
      .mockResolvedValueOnce(section)
    renderEditor()

    expect(
      await screen.findByText('Não foi possível carregar a seção Indústria'),
    ).toBeInTheDocument()
    expect(screen.getByText('API indisponível')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByLabelText('Título principal')).toHaveValue(
      section.title,
    )
  })

  it('cria e remove o rascunho pelos controles do editor', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce(null)
    renderEditor()

    await user.type(await screen.findByLabelText('Prefixo do título'), section.titlePrefix)
    await user.type(screen.getByLabelText('Título principal'), section.title)
    await user.type(screen.getByLabelText('Subtítulo'), section.subtitle)
    await user.type(
      screen.getByLabelText('URL do YouTube — Português'),
      section.videos['pt-BR'].url,
    )
    await user.type(screen.getByLabelText('Segundo inicial'), '8')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith(section)
    })

    cleanup()
    mockedFetch.mockResolvedValueOnce(section)
    renderEditor()
    await user.click(
      await screen.findByRole('button', { name: 'Remover rascunho' }),
    )
    const confirmation = await screen.findByRole('alertdialog')
    await user.click(
      within(confirmation).getByRole('button', { name: 'Remover rascunho' }),
    )

    await waitFor(() => {
      expect(mockedDelete).toHaveBeenCalledOnce()
    })
  })

  it('confirma antes de descartar alterações ao trocar de rota', async () => {
    const user = userEvent.setup()
    const router = renderEditor()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const titleInput = await screen.findByLabelText('Título principal')
    await user.type(titleInput, ' alterada')
    void router.navigate({ to: '/dashboard' })

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledOnce()
    })
    expect(router.state.location.pathname).toBe('/conteudo/pagina-inicial')

    confirmSpy.mockReturnValue(true)
    void router.navigate({ to: '/dashboard' })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/dashboard')
    })
    confirmSpy.mockRestore()
  })
})
