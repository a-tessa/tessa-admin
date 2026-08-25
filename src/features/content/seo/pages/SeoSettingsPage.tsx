import { SeoSettingsEditor } from '../components/SeoSettingsEditor'

export function SeoSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">SEO</h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Padrões globais e títulos das páginas fixas da landing. O assistente
          ao lado mostra o que o Google espera nesses campos. Título social,
          canonical e robots agora aceitam sobrescrita; sitemap e dados
          estruturados o site continua gerando sozinho.
        </p>
      </div>
      <SeoSettingsEditor />
    </div>
  )
}
