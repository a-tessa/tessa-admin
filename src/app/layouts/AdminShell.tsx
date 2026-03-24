import { Link, Outlet, useMatches } from '@tanstack/react-router'
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
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
import { navigationItems } from '@/shared/navigation'
import { cn } from '@/shared/lib/utils'

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'file-text': FileText,
  users: Users,
} as const

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { session, signOut } = useAuth()
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
        {navigationItems.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              activeProps={{ className: 'bg-primary/10 text-primary font-semibold' }}
              inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
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

        <main className={cn('flex-1 p-4 lg:p-6')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
