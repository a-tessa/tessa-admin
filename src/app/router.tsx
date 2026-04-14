import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { CategoriesPage } from '@/features/content/categories/pages/CategoriesPage'
import { HeroSectionPage } from '@/features/content/hero/pages/HeroSectionPage'
import { ContentPageEditPage } from '@/features/content/pages/ContentPageEditPage'
import { ContentPagesPage } from '@/features/content/pages/ContentPagesPage'
import { ScenerySectionPage } from '@/features/content/scenery/pages/ScenerySectionPage'
import { ServicesPage } from '@/features/content/services/pages/ServicesPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { NotFoundPage } from '@/shared/pages/NotFoundPage'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: ProtectedRoute,
})

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: () => <Navigate to="/dashboard" />,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'dashboard',
  component: DashboardPage,
})

const contentRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'conteudo',
  component: ContentPagesPage,
})

const contentHeroRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'conteudo/hero',
  component: HeroSectionPage,
})

const contentCategoriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'conteudo/categorias',
  component: CategoriesPage,
})

const contentServicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'conteudo/servicos',
  component: ServicesPage,
})

const contentSceneryRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'conteudo/cenarios',
  component: ScenerySectionPage,
})

const contentEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'conteudo/$slug',
  component: ContentPageEditPage,
})

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'usuarios',
  component: UsersPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    dashboardRoute,
    contentRoute,
    contentHeroRoute,
    contentCategoriesRoute,
    contentServicesRoute,
    contentSceneryRoute,
    contentEditRoute,
    usersRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
