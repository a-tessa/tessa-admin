import { describe, expect, it } from 'vitest'
import {
  industrySectionFormSchema,
  toIndustrySectionFormValues,
  toIndustrySectionInput,
} from './industry.schema'
import type { IndustrySection } from './types'

const validValues = {
  titlePrefix: 'A força da',
  title: 'indústria brasileira',
  subtitle: 'Estruturas que transformam projetos em realidade.',
  videoUrl: 'https://www.youtube.com/watch?v=EeLYcZsdYrw',
  startSeconds: '8',
  videoUrlEn: '',
  startSecondsEn: '',
  videoUrlEs: '',
  startSecondsEs: '',
}

describe('formulário da seção Indústria', () => {
  it('aceita URL do YouTube e transforma o segundo inicial inteiro', () => {
    const values = industrySectionFormSchema.parse(validValues)

    expect(toIndustrySectionInput(values)).toEqual({
      titlePrefix: validValues.titlePrefix,
      title: validValues.title,
      subtitle: validValues.subtitle,
      videos: {
        'pt-BR': {
          url: validValues.videoUrl,
          startSeconds: 8,
        },
      },
    })
  })

  it('omite o segundo inicial quando o campo fica vazio', () => {
    const values = industrySectionFormSchema.parse({
      ...validValues,
      startSeconds: '',
    })

    expect(toIndustrySectionInput(values).videos['pt-BR']).toEqual({
      url: validValues.videoUrl,
    })
  })

  it('expõe mensagens em português para limites e URL inválida', () => {
    const result = industrySectionFormSchema.safeParse({
      ...validValues,
      titlePrefix: 'a'.repeat(61),
      videoUrl: 'https://example.com/video',
      startSeconds: '-1',
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'O prefixo deve ter no máximo 60 caracteres.',
        'Informe uma URL válida do YouTube.',
        'O segundo inicial deve ser um número inteiro maior ou igual a zero.',
      ]),
    )
  })

  it('não exige URL de vídeo para inglês e espanhol', () => {
    const values = industrySectionFormSchema.parse(validValues)

    expect(toIndustrySectionInput(values).videos.en).toBeUndefined()
    expect(toIndustrySectionInput(values).videos.es).toBeUndefined()
  })

  it('valida e inclui os vídeos opcionais de inglês e espanhol quando preenchidos', () => {
    const values = industrySectionFormSchema.parse({
      ...validValues,
      videoUrlEn: 'https://youtu.be/EeLYcZsdYrw',
      videoUrlEs: 'https://www.youtube.com/watch?v=eGdFPCZYNYQ',
      startSecondsEs: '6',
    })

    expect(toIndustrySectionInput(values).videos).toEqual({
      'pt-BR': { url: validValues.videoUrl, startSeconds: 8 },
      en: { url: 'https://youtu.be/EeLYcZsdYrw' },
      es: { url: 'https://www.youtube.com/watch?v=eGdFPCZYNYQ', startSeconds: 6 },
    })
  })

  it('rejeita URL inválida para os vídeos opcionais de inglês e espanhol', () => {
    const result = industrySectionFormSchema.safeParse({
      ...validValues,
      videoUrlEn: 'https://example.com/not-youtube',
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Informe uma URL válida do YouTube.']),
    )
  })

  it('exige a URL do vídeo quando o segundo inicial opcional é informado', () => {
    const result = industrySectionFormSchema.safeParse({
      ...validValues,
      startSecondsEn: '5',
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(
      result.error.issues.some(
        (issue) =>
          issue.path.join('.') === 'startSecondsEn' &&
          issue.message === 'Informe a URL do vídeo em inglês para usar o segundo inicial.',
      ),
    ).toBe(true)
  })

  it('converte uma seção com vídeos localizados para os valores do formulário e de volta', () => {
    const section: IndustrySection = {
      titlePrefix: validValues.titlePrefix,
      title: validValues.title,
      subtitle: validValues.subtitle,
      videos: {
        'pt-BR': { url: validValues.videoUrl, startSeconds: 8 },
        en: { url: 'https://youtu.be/EeLYcZsdYrw' },
        es: { url: 'https://www.youtube.com/watch?v=eGdFPCZYNYQ', startSeconds: 6 },
      },
    }

    const formValues = toIndustrySectionFormValues(section)
    expect(formValues.videoUrlEn).toBe('https://youtu.be/EeLYcZsdYrw')
    expect(formValues.startSecondsEn).toBe('')
    expect(formValues.videoUrlEs).toBe('https://www.youtube.com/watch?v=eGdFPCZYNYQ')
    expect(formValues.startSecondsEs).toBe('6')

    expect(toIndustrySectionInput(industrySectionFormSchema.parse(formValues))).toEqual(
      section,
    )
  })
})
