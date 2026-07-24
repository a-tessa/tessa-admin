import { useLocation, useNavigate } from '@tanstack/react-router'
import { Clock3 } from 'lucide-react'
import { useEffect } from 'react'
import { HeroSectionPage } from '@/features/content/hero/pages/HeroSectionPage'
import { IndustrySectionEditor } from '@/features/content/industry/components/IndustrySectionEditor'
import {
  homePageRoutePath,
  isHomePageSection,
  validateHomePageSearch,
} from '@/features/content/homepage/homepage-search'
import type { HomePageSection } from '@/features/content/homepage/homepage-search'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'

interface PendingSectionProps {
  readonly name: 'Indústria' | 'Operações'
}

function PendingSection({ name }: PendingSectionProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-base">Editor em preparação</CardTitle>
          <CardDescription className="text-pretty">
            O editor de {name} será disponibilizado em breve.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}

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
        </TabsList>

        <TabsContent value="secao-principal" className="mt-4 text-sm">
          <HeroSectionPage />
        </TabsContent>
        <TabsContent value="industria" className="mt-4 text-sm">
          <IndustrySectionEditor />
        </TabsContent>
        <TabsContent value="operacoes" className="mt-4 text-sm">
          <PendingSection name="Operações" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
