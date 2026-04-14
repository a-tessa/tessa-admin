import { ExternalLink, ImageIcon, Info, Layers } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useScenerySection } from '../hooks/use-scenery-section'
import type { SceneryItem } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'

function SceneryCard({ item }: { item: SceneryItem }) {
  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 font-mono text-xs"
        >
          {item.category}
        </Badge>
      </div>
      <CardContent className="space-y-1 p-4">
        <p className="font-medium leading-tight">{item.title}</p>
        <p className="text-xs text-muted-foreground font-mono">/{item.slug}</p>
      </CardContent>
    </Card>
  )
}

function SceneryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ScenerySectionPage() {
  const sceneryQuery = useScenerySection()

  const items = sceneryQuery.data?.scenerySection
  const hasItems = items && items.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cenários</h2>
          <p className="text-sm text-muted-foreground">
            Cenários disponíveis na landing page, derivados dos serviços
            cadastrados.
          </p>
        </div>

        <Button variant="outline" className="gap-2" asChild>
          <Link to="/conteudo/servicos">
            <ExternalLink className="size-4" />
            Gerenciar serviços
          </Link>
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Os cenários são gerados automaticamente a partir dos{' '}
            <Link
              to="/conteudo/servicos"
              className="font-medium underline underline-offset-2"
            >
              serviços
            </Link>{' '}
            que possuem imagem cadastrada. Para adicionar ou remover cenários,
            gerencie as imagens dos serviços.
          </p>
        </CardContent>
      </Card>

      {sceneryQuery.isPending ? <SceneryGridSkeleton /> : null}

      {sceneryQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{sceneryQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {sceneryQuery.isSuccess && !hasItems ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Layers className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum cenário disponível.</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Cenários são criados automaticamente quando um serviço possui
              imagem. Adicione imagens aos serviços para gerar cenários.
            </p>
            <Button variant="outline" className="mt-2 gap-2" asChild>
              <Link to="/conteudo/servicos">
                <ImageIcon className="size-4" />
                Ir para serviços
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasItems ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <SceneryCard key={item.slug} item={item} />
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {String(items.length)} cenário(s) no total
          </p>
        </>
      ) : null}
    </div>
  )
}
