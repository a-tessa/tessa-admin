import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import { GalleryKindPanel } from '../components/GalleryKindPanel'
import {
  galleryRoutePath,
  galleryTabToKind,
  isGalleryTab,
  validateGallerySearch,
  type GalleryTab,
} from '../gallery-search'

export function GalleryPage() {
  const location = useLocation()
  const search: Record<string, unknown> = location.search
  const activeTab: GalleryTab = validateGallerySearch(search).aba
  const searchString: string = location.searchStr
  const navigate = useNavigate({ from: '/conteudo/galeria' })
  const pathname: string = location.pathname

  useEffect(() => {
    if (pathname !== galleryRoutePath) {
      return
    }

    const urlSearch = new URLSearchParams(searchString)
    if (urlSearch.get('aba') === activeTab) {
      return
    }

    void navigate({
      search: { aba: activeTab },
      replace: true,
    })
  }, [activeTab, navigate, pathname, searchString])

  function handleTabChange(value: string): void {
    if (!isGalleryTab(value)) {
      return
    }

    void navigate({
      search: { aba: value },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-balance text-2xl font-semibold tracking-tight">
          Galeria
        </h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Curadoria do acervo público de fotos e vídeos em /galeria.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-5 overflow-x-auto border-b pb-1"
        >
          <TabsTrigger
            value="fotos"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Fotos
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Vídeos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fotos" className="mt-6">
          <GalleryKindPanel kind={galleryTabToKind('fotos')} />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <GalleryKindPanel kind={galleryTabToKind('videos')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
