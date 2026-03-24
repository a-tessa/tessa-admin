export interface NavigationItem {
  readonly to: string
  readonly label: string
  readonly summary: string
  readonly icon: 'layout-dashboard' | 'file-text' | 'users'
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
  },
  {
    to: '/usuarios',
    label: 'Usuários',
    summary: 'Gestão de admins e controle de acesso.',
    icon: 'users',
  },
] satisfies NavigationItem[]
