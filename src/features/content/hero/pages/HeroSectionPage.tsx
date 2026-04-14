import { Image, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useHeroSection } from '../hooks/use-hero-section'
import { useDeleteHeroSection } from '../hooks/use-delete-hero-section'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { HeroTopic } from '../types'

function HeroTopicCard({ topic, index }: { topic: HeroTopic; index: number }) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
          {topic.image ? (
            <img
              src={topic.image}
              alt={topic.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Image className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 text-xs">
              Tópico {String(index + 1)}
            </Badge>
          </div>
          <p className="truncate font-medium">{topic.title}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {topic.description}
          </p>
          <p className="text-xs text-muted-foreground">
            Botão: {topic.button.text} → {topic.button.url}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function HeroSectionPage() {
  const heroQuery = useHeroSection()
  const deleteMutation = useDeleteHeroSection()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const heroSection = heroQuery.data?.heroSection
  const hasHero = heroSection && heroSection.length > 0

  function handleDelete() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Seção hero removida.')
        setDeleteOpen(false)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Seção Hero</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os tópicos do banner principal da landing page.
          </p>
        </div>

        {hasHero ? (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Remover hero
          </Button>
        ) : null}
      </div>

      {heroQuery.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="size-24 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {heroQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{heroQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {heroQuery.isSuccess && !hasHero ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Image className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma seção hero cadastrada.</p>
            <p className="text-sm text-muted-foreground">
              Crie a primeira seção hero para o banner da landing page.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasHero ? (
        <div className="space-y-4">
          {heroSection.map((topic, index) => (
            <HeroTopicCard key={index} topic={topic} index={index} />
          ))}
        </div>
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover seção hero?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os tópicos e imagens serão removidos do rascunho.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
