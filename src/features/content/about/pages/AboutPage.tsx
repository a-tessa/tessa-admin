import { AboutSectionEditor } from '../components/AboutSectionEditor'

export function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quem Somos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Página institucional da landing com vídeo de capa, narrativa e
          pilares Missão, Visão e Valores.
        </p>
      </div>
      <AboutSectionEditor />
    </div>
  )
}
