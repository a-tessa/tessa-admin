import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Clock,
  FileDown,
  FileText,
  GlobeIcon,
  Image,
  Inbox,
  MessageSquareQuote,
  Newspaper,
  Shield,
  Star,
  Users,
} from 'lucide-react'
import { HealthStatusCard } from '@/features/dashboard/components/HealthStatusCard'
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard'
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

const quickLinks = [
  {
    to: '/moderacao/contatos' as const,
    label: 'Contatos',
    description: 'Responder pedidos enviados pela landing.',
    icon: Inbox,
  },
  {
    to: '/moderacao/depoimentos' as const,
    label: 'Avaliações',
    description: 'Moderar avaliações enviadas pelos visitantes.',
    icon: MessageSquareQuote,
  },
  {
    to: '/conteudo/blog' as const,
    label: 'Blog',
    description: 'Criar, editar e publicar artigos.',
    icon: Newspaper,
  },
  {
    to: '/usuarios' as const,
    label: 'Usuários',
    description: 'Administrar acessos e controlar status.',
    icon: Users,
  },
] as const

function formatAverageRating(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value.toFixed(1)
}

export function DashboardPage() {
  const { session } = useAuth()
  const statsQuery = useDashboardStats()
  const stats = statsQuery.data?.stats
  const isLoading = statsQuery.isPending

  const userName = session?.user.name ?? 'Equipe Tessa'
  const userRole = session?.user.role ?? 'ADMIN'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Olá, {userName}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          Painel administrativo da Tessa. Acesso como{' '}
          <span className="font-medium text-foreground">{userRole}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Contatos pendentes"
          value={stats?.pendingContacts}
          description={
            stats
              ? `${String(stats.totalContacts)} no total`
              : 'Aguardando retorno'
          }
          icon={Clock}
          isLoading={isLoading}
          accent={
            stats && stats.pendingContacts > 0 ? 'warning' : 'default'
          }
          to="/moderacao/contatos"
        />
        <DashboardStatCard
          label="Avaliações pendentes"
          value={stats?.pendingTestimonials}
          description="Aguardando moderação"
          icon={MessageSquareQuote}
          isLoading={isLoading}
          accent={
            stats && stats.pendingTestimonials > 0 ? 'warning' : 'default'
          }
          to="/moderacao/depoimentos"
        />
        <DashboardStatCard
          label="Média agregada"
          value={formatAverageRating(stats?.averageRating)}
          description={
            stats
              ? `${String(stats.approvedTestimonials)} avaliação(ões) aprovada(s)`
              : 'Entre avaliações aprovadas'
          }
          icon={Star}
          isLoading={isLoading}
          accent="success"
          to="/moderacao/depoimentos"
        />
        <DashboardStatCard
          label="Artigos publicados"
          value={stats?.publishedArticles}
          description={
            stats
              ? `${String(stats.draftArticles)} rascunho(s)`
              : 'No blog'
          }
          icon={Newspaper}
          isLoading={isLoading}
          to="/conteudo/blog"
        />
        <DashboardStatCard
          label="Documentos"
          value={stats?.documents}
          description="Disponíveis para download"
          icon={FileDown}
          isLoading={isLoading}
          to="/conteudo/documentos"
        />
        <DashboardStatCard
          label="Itens na galeria"
          value={stats?.galleryItems}
          description="Fotos e vídeos"
          icon={Image}
          isLoading={isLoading}
          to="/conteudo/galeria"
        />
        <DashboardStatCard
          label="Usuários ativos"
          value={stats?.activeUsers}
          description="Com acesso ao admin"
          icon={Users}
          isLoading={isLoading}
          to="/usuarios"
        />
        <DashboardStatCard
          label="Instagram"
          value={
            isLoading
              ? undefined
              : stats?.instagramConnected
                ? 'Conectado'
                : 'Desconectado'
          }
          description="Conta oficial"
          isLoading={isLoading}
          icon={GlobeIcon}
          accent={
            stats?.instagramConnected ? 'success' : 'warning'
          }
          to="/conteudo/instagram"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Conteúdos</CardTitle>
              <CardDescription>
                Gerenciar landing pages, rascunhos e publicações.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link to="/conteudo">
              Acessar
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
