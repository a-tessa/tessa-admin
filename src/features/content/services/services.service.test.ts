import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ServicePageAssetUploadResponse, ServicePageFormData } from './types'

vi.mock('@/shared/lib/api', () => ({
  authenticatedRequest: vi.fn(),
}))

import { authenticatedRequest } from '@/shared/lib/api'
import { createService } from './services.service'

const request = vi.mocked(authenticatedRequest)

function assetResponse(
  name: string,
  kind: ServicePageAssetUploadResponse['kind'],
  index: number | null,
): ServicePageAssetUploadResponse {
  return {
    url: `https://blob.example/${name}.webp`,
    pathname: `landing-page/services-pages/carport/${name}.webp`,
    mimeType: 'image/webp',
    sizeBytes: 100,
    originalFilename: `${name}.jpg`,
    kind,
    index,
  }
}

function formData(): ServicePageFormData {
  return {
    payload: {
      slug: 'carport',
      title: 'Carport',
      category: 'carport',
      subtitle: 'Cobertura para veículos.',
      exampleVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      backgroundImageAlt: 'Foto de topo',
      images: [{ alt: 'Foto da galeria' }],
    },
    backgroundImage: new File([new Uint8Array([1])], 'topo.jpg', { type: 'image/jpeg' }),
    galleryFiles: new Map([
      [0, new File([new Uint8Array([2])], 'galeria.jpg', { type: 'image/jpeg' })],
    ]),
  }
}

describe('createService uploads', () => {
  beforeEach(() => {
    request.mockReset()
  })

  it('sends the next image only after the previous upload finishes', async () => {
    let releaseBackground: (() => void) | undefined
    const backgroundGate = new Promise<void>((resolve) => {
      releaseBackground = resolve
    })
    let assetCalls = 0

    request.mockImplementation(async (path) => {
      if (path.endsWith('/assets')) {
        assetCalls += 1
        if (assetCalls === 1) {
          await backgroundGate
          return assetResponse('topo', 'background', null)
        }
        return assetResponse('galeria', 'image', 0)
      }

      return { item: { slug: 'carport' } }
    })

    const pending = createService(formData())
    await vi.waitFor(() => {
      expect(assetCalls).toBe(1)
    })
    await Promise.resolve()
    expect(assetCalls).toBe(1)

    releaseBackground?.()
    await pending

    expect(assetCalls).toBe(2)
    expect(request).toHaveBeenCalledTimes(3)
  })
})
