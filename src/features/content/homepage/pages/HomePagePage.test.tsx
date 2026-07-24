import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { validateHomePageSearch } from '@/features/content/homepage/homepage-search'
import { HomePagePage } from '@/features/content/homepage/pages/HomePagePage'

vi.mock('@/features/content/hero/pages/HeroSectionPage', () => ({
  HeroSectionPage: () => <div>Editor existente da Seção Principal</div>,
}))

vi.mock(
  '@/features/content/industry/components/IndustrySectionEditor',
  () => ({
    IndustrySectionEditor: () => <div>Editor da seção Indústria</div>,
  }),
)

function renderPage(initialEntry: string) {
  const rootRoute = createRootRoute()
  const homepageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/pagina-inicial',
    validateSearch: validateHomePageSearch,
    component: HomePagePage,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([homepageRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })

  render(<RouterProvider router={router} />)

  return router
}

describe('editor da Página inicial', () => {
  it('abre a Seção Principal por padrão e identifica a aba na URL', async () => {
    const router = renderPage('/conteudo/pagina-inicial')
    const tabList = await screen.findByRole('tablist')
    const tabs = within(tabList).getAllByRole('tab')

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Seção Principal',
      'Indústria',
      'Operações',
    ])
    expect(screen.getByRole('tab', { name: 'Seção Principal' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByText('Editor existente da Seção Principal'),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(router.state.location.search).toEqual({
        aba: 'secao-principal',
      })
      expect(router.state.location.searchStr).toBe(
        '?aba=secao-principal',
      )
    })
  })

  it('restaura a aba de Operações por navegação direta', async () => {
    renderPage('/conteudo/pagina-inicial?aba=operacoes')

    expect(
      await screen.findByRole('tab', { name: 'Operações' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText('O editor de Operações será disponibilizado em breve.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Editor existente da Seção Principal'),
    ).not.toBeInTheDocument()
  })

  it('atualiza a URL quando o administrador troca de aba', async () => {
    const user = userEvent.setup()
    const router = renderPage(
      '/conteudo/pagina-inicial?aba=secao-principal',
    )

    await user.click(await screen.findByRole('tab', { name: 'Indústria' }))

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ aba: 'industria' })
      expect(router.state.location.searchStr).toBe('?aba=industria')
    })
    expect(
      screen.getByText('Editor da seção Indústria'),
    ).toBeInTheDocument()
  })
})
