import { describe, expect, it } from 'vitest'
import {
  describeOperationFileRejection,
  isAcceptedOperationFile,
  MAX_OPERATION_ALT_LENGTH,
  MAX_OPERATION_CAPTION_LENGTH,
  MAX_OPERATION_IMAGE_BYTES,
  MAX_OPERATION_SECTION_IMAGES,
  MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH,
  operationSectionFormSchema,
  toOperationSectionInput,
} from './operations.schema'
import type { OperationGalleryItem } from './types'

function makeFile(
  name: string,
  options: { type?: string; size?: number } = {},
): File {
  const type = options.type ?? 'image/jpeg'
  const size = options.size ?? 1024
  const buffer = new Uint8Array(size)
  return new File([buffer], name, { type })
}

describe('schema da galeria de Operações', () => {
  it('aceita de 0 a 40 imagens com alt obrigatório e caption opcional', () => {
    expect(operationSectionFormSchema.parse({ images: [] })).toEqual({
      images: [],
    })

    const images = Array.from({ length: 6 }, (_, index) => ({
      url: `https://cdn.example.com/${String(index)}.webp`,
      alt: `Alt ${String(index)}`,
      caption: index % 2 === 0 ? `Legenda ${String(index)}` : '',
    }))

    expect(operationSectionFormSchema.parse({ images }).images).toHaveLength(6)
    expect(
      operationSectionFormSchema.safeParse({
        images: [
          {
            url: 'https://cdn.example.com/0.webp',
            alt: 'Alt sem caption',
          },
        ],
      }).success,
    ).toBe(true)
  })

  it('rejeita mais de 40 imagens, alt inválido e legenda igual ao alt', () => {
    const tooMany = Array.from(
      { length: MAX_OPERATION_SECTION_IMAGES + 1 },
      (_, index) => ({
        url: `https://cdn.example.com/${String(index)}.webp`,
        alt: `Alt ${String(index)}`,
        caption: '',
      }),
    )
    expect(operationSectionFormSchema.safeParse({ images: tooMany }).success).toBe(
      false,
    )

    expect(
      operationSectionFormSchema.safeParse({
        images: [
          {
            url: 'https://cdn.example.com/a.webp',
            alt: 'a'.repeat(MAX_OPERATION_ALT_LENGTH + 1),
            caption: '',
          },
        ],
      }).success,
    ).toBe(false)

    expect(
      operationSectionFormSchema.safeParse({
        images: [
          {
            url: 'https://cdn.example.com/a.webp',
            alt: 'Mesmo texto',
            caption: 'Mesmo texto',
          },
        ],
      }).success,
    ).toBe(false)

    expect(
      operationSectionFormSchema.safeParse({
        images: [
          {
            url: 'https://cdn.example.com/a.webp',
            alt: 'Alt',
            caption: 'c'.repeat(MAX_OPERATION_CAPTION_LENGTH + 1),
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('valida arquivos JPEG/PNG/WebP de até 3 MB antes do envio', () => {
    expect(
      isAcceptedOperationFile(makeFile('foto.jpg', { type: 'image/jpeg' })),
    ).toBe(true)
    expect(
      isAcceptedOperationFile(makeFile('foto.png', { type: 'image/png' })),
    ).toBe(true)
    expect(
      isAcceptedOperationFile(makeFile('foto.webp', { type: 'image/webp' })),
    ).toBe(true)
    expect(
      isAcceptedOperationFile(makeFile('doc.pdf', { type: 'application/pdf' })),
    ).toBe(false)
    expect(
      isAcceptedOperationFile(
        makeFile('grande.jpg', {
          type: 'image/jpeg',
          size: MAX_OPERATION_IMAGE_BYTES + 1,
        }),
      ),
    ).toBe(false)
    expect(
      describeOperationFileRejection(
        makeFile('grande.jpg', {
          type: 'image/jpeg',
          size: MAX_OPERATION_IMAGE_BYTES + 1,
        }),
      ),
    ).toContain('3 MB')
  })

  it('converte itens prontos para o payload de salvamento sem caption vazia', () => {
    const items: OperationGalleryItem[] = [
      {
        clientId: '1',
        url: 'https://cdn.example.com/a.webp',
        previewUrl: 'https://cdn.example.com/a.webp',
        alt: '  Alt A  ',
        caption: '  Legenda  ',
        status: 'ready',
        meta: {
          pathname: 'landing-page/home/operation-section/image-0/a.webp',
          mimeType: 'image/webp',
          sizeBytes: 12,
          originalFilename: 'a.jpg',
        },
      },
      {
        clientId: '2',
        url: 'https://cdn.example.com/b.webp',
        previewUrl: 'https://cdn.example.com/b.webp',
        alt: 'Alt B',
        caption: '   ',
        status: 'ready',
      },
      {
        clientId: '3',
        url: '',
        previewUrl: 'blob:local',
        alt: 'Alt C',
        caption: '',
        status: 'error',
        errorMessage: 'falhou',
      },
    ]

    expect(toOperationSectionInput(items)).toEqual({
      images: [
        {
          url: 'https://cdn.example.com/a.webp',
          alt: 'Alt A',
          caption: 'Legenda',
          meta: {
            pathname: 'landing-page/home/operation-section/image-0/a.webp',
            mimeType: 'image/webp',
            sizeBytes: 12,
            originalFilename: 'a.jpg',
          },
        },
        {
          url: 'https://cdn.example.com/b.webp',
          alt: 'Alt B',
        },
      ],
    })
    expect(MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH).toBe(6)
  })
})
