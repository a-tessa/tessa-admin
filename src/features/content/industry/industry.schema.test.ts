import { describe, expect, it } from 'vitest'
import {
  industrySectionFormSchema,
  toIndustrySectionInput,
} from './industry.schema'

const validValues = {
  titlePrefix: 'A força da',
  title: 'indústria brasileira',
  subtitle: 'Estruturas que transformam projetos em realidade.',
  videoUrl: 'https://www.youtube.com/watch?v=EeLYcZsdYrw',
  startSeconds: '8',
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
})
