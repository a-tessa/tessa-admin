import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { routeTree } from '@/app/router'
import { navigationItems } from '@/shared/navigation'

vi.mock('@/features/auth/components/ProtectedRoute', () => ({
  ProtectedRoute: Outlet,
}))

vi.mock('@/features/content/hero/pages/HeroSectionPage', () => ({
  HeroSectionPage: () => <div>Editor existente da Seção Principal</div>,
}))

vi.mock('@/features/dashboard/pages/DashboardPage', () => ({
  DashboardPage: () => <div>Painel de visão geral</div>,
}))

describe('navegação da Página inicial', () => {
  it('oferece Página inicial dentro de Conteúdos sem um item Hero separado', () => {
    const contentItem = navigationItems.find(
      (item) => item.label === 'Conteúdos',
    )

    expect(contentItem?.children?.[0]).toMatchObject({
      label: 'Página inicial',
      to: '/conteudo/pagina-inicial',
    })
    expect(
      contentItem?.children?.some(
        (item) => item.to === '/conteudo/hero',
      ),
    ).toBe(false)
  })

  it('redireciona o endereço legado para a aba Seção Principal', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo/hero'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByText('Editor existente da Seção Principal'),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/conteudo/pagina-inicial',
      )
      expect(router.state.location.search).toEqual({
        aba: 'secao-principal',
      })
    })
  })

  it('permite sair da Página inicial para outra rota', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo/pagina-inicial'],
      }),
    })

    render(<RouterProvider router={router} />)

    await screen.findByText('Editor existente da Seção Principal')
    await waitFor(() => {
      expect(router.state.location.searchStr).toBe('?aba=secao-principal')
    })

    await router.navigate({ to: '/dashboard' })

    expect(await screen.findByText('Painel de visão geral')).toBeInTheDocument()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/dashboard')
    })
    expect(router.state.location.pathname).toBe('/dashboard')
  })
})
