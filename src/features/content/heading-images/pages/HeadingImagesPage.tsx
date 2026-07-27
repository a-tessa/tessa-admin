import { Link } from '@tanstack/react-router'
import { ExternalLink, Image } from 'lucide-react'
import { HeadingImageCard } from '../components/HeadingImageCard'
import { useHeadingImages } from '../hooks/use-heading-images'
import { HEADING_IMAGE_PAGE_KEYS } from '../types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function HeadingImagesPage() {
  const headingImagesQuery = useHeadingImages()
  const headingImages = headingImagesQuery.data?.headingImages ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Imagens dos cabeçalhos
        </h2>
        <p className="text-sm text-muted-foreground">
          Defina a foto de fundo do cabeçalho compartilhado em cada página
          fixa. As alterações entram no rascunho global e só aparecem na
          landing após a publicação.
        </p>
      </div>

      {headingImagesQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-video w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {headingImagesQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{headingImagesQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {headingImagesQuery.isSuccess ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {HEADING_IMAGE_PAGE_KEYS.map((pageKey) => (
            <HeadingImageCard
              key={pageKey}
              pageKey={pageKey}
              entry={headingImages[pageKey]}
            />
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Image className="size-4" />
            Páginas dinâmicas
          </CardTitle>
          <CardDescription>
            Artigos do blog e páginas de serviço reutilizam as imagens já
            cadastradas nos seus próprios editores. Se o item não tiver
            imagem, o cabeçalho usa a imagem da página pai (Blog/Serviços) e,
            por fim, o fundo cinza.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            to="/conteudo/blog"
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            Abrir Blog
            <ExternalLink className="size-3.5" />
          </Link>
          <Link
            to="/conteudo/servicos"
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            Abrir Serviços
            <ExternalLink className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
