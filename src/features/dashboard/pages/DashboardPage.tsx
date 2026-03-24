import { Link } from '@tanstack/react-router'
import { ArrowRight, FileText, Shield, Users } from 'lucide-react'
import { HealthStatusCard } from '@/features/dashboard/components/HealthStatusCard'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

const quickLinks = [
  {
    to: '/conteudo' as const,
    label: 'Conteúdo',
    description: 'Gerenciar landing pages, rascunhos e publicações.',
    icon: FileText,
  },
  {
    to: '/usuarios' as const,
    label: 'Usuários',
    description: 'Administrar acessos, criar admins e controlar status.',
    icon: Users,
  },
] as const

export function DashboardPage() {
  const { session } = useAuth()
  const userName = session?.user.name ?? 'Equipe Tessa'
  const userRole = session?.user.role ?? 'ADMIN'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Olá, {userName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Painel administrativo da Tessa. Acesso como{' '}
          <span className="font-medium text-foreground">{userRole}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HealthStatusCard />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Papel ativo</CardTitle>
            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userRole}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {userRole === 'MASTER'
                ? 'Acesso total ao sistema'
                : 'Acesso a conteúdo e publicação'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Card key={link.to} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <link.icon className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{link.label}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link to={link.to}>
                  Acessar
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
