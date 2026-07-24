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

describe('navegação da Página inicial', () => {
  it('oferece Página inicial dentro de Conteúdo sem um item Hero separado', () => {
    const contentItem = navigationItems.find(
      (item) => item.label === 'Conteúdo',
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
})
