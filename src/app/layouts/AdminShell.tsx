import { Link, Outlet, useMatches } from '@tanstack/react-router'
import {
  Briefcase,
  ChevronDown,
  FileText,
  Image,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Tags,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { PublishFloatingBar } from '@/features/content/publish'
import { TessaLogo } from '@/shared/components/tessa-logo'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import type { NavigationIcon, NavigationItem } from '@/shared/navigation'
import { navigationItems } from '@/shared/navigation'
import { cn } from '@/shared/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible'

const iconMap: Record<NavigationIcon, typeof LayoutDashboard> = {
  'layout-dashboard': LayoutDashboard,
  'file-text': FileText,
  'image': Image,
  'tags': Tags,
  'briefcase': Briefcase,
  'layers': Layers,
  users: Users,
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function NavLink({
  to,
  icon,
  label,
  onNavigate,
  indent = false,
}: {
  to: string
  icon: NavigationIcon
  label: string
  onNavigate?: (() => void) | undefined
  indent?: boolean | undefined
}) {
  const Icon = iconMap[icon]
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact: true }}
      activeProps={{ className: 'bg-primary/10 text-primary font-semibold' }}
      inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        indent && 'pl-9',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

function NavGroup({
  item,
  currentPath,
  onNavigate,
}: {
  item: NavigationItem
  currentPath: string
  onNavigate?: (() => void) | undefined
}) {
  const isActive = currentPath.startsWith(item.to)
  const Icon = iconMap[item.icon]

  return (
    <Collapsible defaultOpen={isActive}>
      <CollapsibleTrigger className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
        isActive
          ? 'text-primary font-semibold'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}>
        <Icon className="size-4 shrink-0" />
        {item.label}
        <ChevronDown className="ml-auto size-4 shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-0.5 pt-0.5">
        {item.children?.map((child) => (
          <NavLink
            key={child.to}
            to={child.to}
            icon={child.icon}
            label={child.label}
            onNavigate={onNavigate}
            indent
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { session, signOut } = useAuth()
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname ?? ''
  const userName = session?.user.name ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const userRole = session?.user.role ?? 'ADMIN'

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <TessaLogo className="h-6 text-foreground" />
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navigationItems.map((item) =>
          item.children ? (
            <NavGroup key={item.to} item={item} currentPath={currentPath} onNavigate={onNavigate} />
          ) : (
            <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} onNavigate={onNavigate} />
          ),
        )}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider">
            {userRole}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start gap-2 text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

function PageTitle() {
  const matches = useMatches()
  const lastMatch = matches[matches.length - 1]
  const path = lastMatch?.pathname ?? ''

  if (path.startsWith('/dashboard')) return 'Visão geral'
  if (path === '/conteudo/hero') return 'Seção Principal'
  if (path === '/conteudo/categorias') return 'Categorias'
  if (path.startsWith('/conteudo/servicos')) return 'Serviços'
  if (path === '/conteudo/cenarios') return 'Cenários'
  if (path.startsWith('/conteudo')) return 'Conteúdo'
  if (path.startsWith('/usuarios')) return 'Usuários'
  return 'Tessa Admin'
}

export function AdminShell() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur lg:px-6">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de navegação</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">
            <PageTitle />
          </h1>
        </header>

        <main className={cn('flex-1 p-4 pb-20 lg:p-6 lg:pb-20')}>
          <Outlet />
        </main>

        <PublishFloatingBar />
      </div>
    </div>
  )
}
