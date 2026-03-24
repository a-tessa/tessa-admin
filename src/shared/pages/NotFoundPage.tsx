import { Link } from '@tanstack/react-router'
import { TessaLogoMark } from '@/shared/components/tessa-logo'
import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <TessaLogoMark className="h-10" />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A rota que você tentou acessar não existe no painel.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </Button>
    </div>
  )
}
