export type NavigationIcon =
  | 'layout-dashboard'
  | 'file-text'
  | 'users'
  | 'image'

export interface NavigationChild {
  readonly to: string
  readonly label: string
  readonly icon: NavigationIcon
}

export interface NavigationItem {
  readonly to: string
  readonly label: string
  readonly summary: string
  readonly icon: NavigationIcon
  readonly children?: readonly NavigationChild[]
}

export const navigationItems = [
  {
    to: '/dashboard',
    label: 'Visão geral',
    summary: 'Panorama do projeto e health check da API.',
    icon: 'layout-dashboard',
  },
  {
    to: '/conteudo',
    label: 'Conteúdo',
    summary: 'Listar, editar e publicar páginas.',
    icon: 'file-text',
    children: [
      {
        to: '/conteudo',
        label: 'Páginas',
        icon: 'file-text',
      },
      {
        to: '/conteudo/hero',
        label: 'Seção Principal',
        icon: 'image',
      },
    ],
  },
  {
    to: '/usuarios',
    label: 'Usuários',
    summary: 'Gestão de admins e controle de acesso.',
    icon: 'users',
  },
] satisfies NavigationItem[]
