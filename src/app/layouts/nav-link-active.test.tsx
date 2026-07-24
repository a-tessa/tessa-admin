import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NavLink } from '@/app/layouts/AdminShell'
import { validateHomePageSearch } from '@/features/content/homepage/homepage-search'

const ACTIVE_CLASS = 'text-primary'

function renderNav(initialEntry: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <NavLink to="/conteudo/pagina-inicial" icon="image" label="Página inicial" />
        <Outlet />
      </div>
    ),
  })
  const homepageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/pagina-inicial',
    validateSearch: validateHomePageSearch,
    component: () => <div>conteúdo da página inicial</div>,
  })
  const otherRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <div>painel</div>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([homepageRoute, otherRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })

  render(<RouterProvider router={router} />)

  return router
}

describe('destaque do item Página inicial', () => {
  it('mantém o destaque mesmo com a aba na query da URL', async () => {
    renderNav('/conteudo/pagina-inicial?aba=secao-principal')

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Página inicial' }),
      ).toHaveClass(ACTIVE_CLASS)
    })
  })

  it('não destaca o item em outra rota', async () => {
    renderNav('/dashboard')

    expect(
      await screen.findByRole('link', { name: 'Página inicial' }),
    ).not.toHaveClass(ACTIVE_CLASS)
  })
})
