import { useState } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { groupOperationPreviewSlides } from '../operations.schema'
import type { OperationGalleryItem } from '../types'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'

interface OperationSectionPreviewProps {
  readonly items: OperationGalleryItem[]
}

export function OperationSectionPreview({
  items,
}: OperationSectionPreviewProps) {
  const readyItems = items.filter(
    (item) => item.status === 'ready' && item.previewUrl.length > 0,
  )
  const slides = groupOperationPreviewSlides(readyItems)
  const [expanded, setExpanded] = useState<OperationGalleryItem | null>(null)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Prévia responsiva</CardTitle>
        <CardDescription>
          Ordem final da galeria, bento desktop, carrossel mobile e expansão com
          legenda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {readyItems.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl bg-muted/40 text-sm text-muted-foreground">
            <ImageIcon className="size-6" aria-hidden="true" />
            Adicione imagens para visualizar a prévia.
          </div>
        ) : (
          <Tabs defaultValue="desktop">
            <TabsList>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>
            <TabsContent value="desktop" className="mt-4">
              <div className="space-y-4 rounded-3xl bg-primary p-4 text-primary-foreground">
                {slides.map((slide, slideIndex) => (
                  <div
                    key={`slide-${String(slideIndex)}`}
                    className="grid grid-cols-2 gap-3"
                  >
                    {slide.map((item) => (
                      <button
                        key={item.clientId}
                        type="button"
                        className="relative aspect-4/3 overflow-hidden rounded-xl"
                        onClick={(): void => setExpanded(item)}
                        aria-label="Expandir imagem da prévia"
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.alt || 'Imagem da galeria'}
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="mobile" className="mt-4">
              <div className="overflow-hidden rounded-3xl bg-primary p-4 text-primary-foreground">
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                  {readyItems.map((item) => (
                    <button
                      key={item.clientId}
                      type="button"
                      className="relative aspect-4/3 w-56 shrink-0 snap-center overflow-hidden rounded-xl"
                      onClick={(): void => setExpanded(item)}
                      aria-label="Expandir imagem da prévia"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.alt || 'Imagem da galeria'}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {expanded ? (
          <div className="overflow-hidden rounded-xl border">
            <div className="relative aspect-4/3 bg-muted">
              <img
                src={expanded.previewUrl}
                alt={expanded.alt || 'Imagem expandida'}
                className="size-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-3 top-3"
                onClick={(): void => setExpanded(null)}
                aria-label="Fechar expansão"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            {expanded.caption.trim().length > 0 ? (
              <div className="bg-muted px-4 py-3 text-sm text-muted-foreground">
                {expanded.caption.trim()}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
