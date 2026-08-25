import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

const AUTOMATIC_SIGNALS = [
  {
    title: 'Canonical e hreflang',
    body: 'O site gera a URL canônica e as versões pt-BR, en e es. Você pode sobrescrever a canonical por página; caminho interno segue o idioma do visitante, URL externa suprime o hreflang.',
  },
  {
    title: 'Open Graph e Twitter',
    body: 'Título, descrição e imagem viram cartão de compartilhamento. Título e descrição sociais, quando preenchidos, substituem o meta. O handle em twitter:site sai dos padrões globais.',
  },
  {
    title: 'Sitemap e robots',
    body: 'O sitemap lista as páginas publicáveis. Páginas com noIndex saem da lista. O dropdown de robots combina index/follow por página. Preview e localhost já bloqueiam indexação.',
  },
  {
    title: 'JSON-LD',
    body: 'Organization, WebSite, BreadcrumbList e os tipos de artigo/serviço/contato são gerados pelo código.',
  },
  {
    title: 'Palavras-chave meta',
    body: 'O Google ignora a meta keywords para ranqueamento. O campo existe para consistência e para outros buscadores; o termo principal no título importa mais.',
  },
] as const

export function SeoAutomaticCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O que o site já faz sozinho</CardTitle>
        <CardDescription>
          Canonical, cartões sociais e robots agora aceitam sobrescrita neste
          formulário. O restante continua gerado pelo site em toda página
          publicada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {AUTOMATIC_SIGNALS.map((signal) => (
            <li key={signal.title} className="space-y-0.5">
              <p className="text-sm font-medium">{signal.title}</p>
              <p className="text-xs text-muted-foreground">{signal.body}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
