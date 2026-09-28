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

vi.mock('@/features/content/footer/components/FooterSectionEditor', () => ({
  FooterSectionEditor: () => <div>Editor da seção Rodapé</div>,
}))

vi.mock('@/features/content/company-information', () => ({
  CompanyInformationPage: () => <div>Editor das informações da empresa</div>,
}))

vi.mock('@/features/content/seo', () => ({
  SeoSettingsPage: () => <div>Editor de SEO</div>,
}))

vi.mock('@/features/content/redirects', () => ({
  RedirectsPage: () => <div>Editor de redirecionamentos</div>,
}))

vi.mock('@/features/dashboard/pages/DashboardPage', () => ({
  DashboardPage: () => <div>Painel de visão geral</div>,
}))

vi.mock('@/features/moderation/contacts/pages/ContactsPage', () => ({
  ContactsPage: () => <div>Lista de contatos</div>,
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
    expect(
      contentItem?.children?.some(
        (item) => item.to === '/conteudo/rodape',
      ),
    ).toBe(false)
    expect(
      contentItem?.children?.some(
        (item) => item.to === '/conteudo/informacoes-da-empresa',
      ),
    ).toBe(true)
    expect(
      contentItem?.children?.some((item) => item.to === '/conteudo/seo'),
    ).toBe(false)
    expect(
      contentItem?.children?.some(
        (item) => item.to === '/conteudo/redirecionamentos',
      ),
    ).toBe(false)
  })

  it('agrupa SEO e redirecionamentos fora de Conteúdos', () => {
    const seoItem = navigationItems.find((item) => item.label === 'SEO e URLs')

    expect(seoItem?.children).toEqual([
      { to: '/conteudo/seo', label: 'SEO', icon: 'search' },
      {
        to: '/conteudo/redirecionamentos',
        label: 'Redirecionamentos',
        icon: 'arrow-right-left',
      },
    ])
  })

  it('abre SEO como página própria', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo/seo'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Editor de SEO')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/conteudo/seo')
  })

  it('abre Redirecionamentos como página própria', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo/redirecionamentos'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByText('Editor de redirecionamentos'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/conteudo/redirecionamentos')
  })

  it('abre Informações da empresa como página própria', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo/informacoes-da-empresa'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByText('Editor das informações da empresa'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(
      '/conteudo/informacoes-da-empresa',
    )
  })

  it('redireciona o endereço legado do rodapé para a aba Rodapé', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo/rodape'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByText('Editor da seção Rodapé'),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/conteudo/pagina-inicial',
      )
      expect(router.state.location.search).toEqual({
        aba: 'rodape',
      })
    })
  })

  it('redireciona a listagem antiga de conteúdos para a Página inicial', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/conteudo'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Página inicial')).toBeInTheDocument()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/conteudo/pagina-inicial')
    })
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

  it('redireciona o endereço das notificações de contato para Contatos', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/moderacao/notificacoes'],
      }),
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Lista de contatos')).toBeInTheDocument()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/moderacao/contatos')
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
