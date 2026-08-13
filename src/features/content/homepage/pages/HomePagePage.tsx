import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { HeroSectionPage } from '@/features/content/hero/pages/HeroSectionPage'
import { IndustrySectionEditor } from '@/features/content/industry/components/IndustrySectionEditor'
import { OperationSectionEditor } from '@/features/content/operations/components/OperationSectionEditor'
import { ResultsSectionEditor } from '@/features/content/results/components/ResultsSectionEditor'
import { FooterSectionEditor } from '@/features/content/footer/components/FooterSectionEditor'
import {
  homePageRoutePath,
  isHomePageSection,
  validateHomePageSearch,
} from '@/features/content/homepage/homepage-search'
import type { HomePageSection } from '@/features/content/homepage/homepage-search'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'

export function HomePagePage() {
  const location = useLocation()
  const search: Record<string, unknown> = location.search
  const activeSection: HomePageSection =
    validateHomePageSearch(search).aba
  const searchString: string = location.searchStr
  const navigate = useNavigate({ from: '/conteudo/pagina-inicial' })

  const pathname: string = location.pathname

  useEffect(() => {
    if (pathname !== homePageRoutePath) {
      return
    }

    const urlSearch: URLSearchParams = new URLSearchParams(searchString)

    if (urlSearch.get('aba') === activeSection) {
      return
    }

    void navigate({
      search: { aba: activeSection },
      replace: true,
    })
  }, [activeSection, navigate, pathname, searchString])

  function handleSectionChange(value: string): void {
    if (!isHomePageSection(value)) {
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
          Página inicial
        </h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Edite as seções exibidas na página inicial da landing.
        </p>
      </div>

      <Tabs value={activeSection} onValueChange={handleSectionChange}>
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-5 overflow-x-auto border-b pb-1"
        >
          <TabsTrigger
            value="secao-principal"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Seção Principal
          </TabsTrigger>
          <TabsTrigger
            value="industria"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Indústria
          </TabsTrigger>
          <TabsTrigger
            value="operacoes"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Operações
          </TabsTrigger>
          <TabsTrigger
            value="resultados"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Resultados
          </TabsTrigger>
          <TabsTrigger
            value="rodape"
            className="min-h-10 flex-none px-1.5 text-sm"
          >
            Rodapé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="secao-principal" className="mt-4 text-sm">
          <HeroSectionPage />
        </TabsContent>
        <TabsContent value="industria" className="mt-4 text-sm">
          <IndustrySectionEditor />
        </TabsContent>
        <TabsContent value="operacoes" className="mt-4 text-sm">
          <OperationSectionEditor />
        </TabsContent>
        <TabsContent value="resultados" className="mt-4 text-sm">
          <ResultsSectionEditor />
        </TabsContent>
        <TabsContent value="rodape" className="mt-4 text-sm">
          <FooterSectionEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
