import { describe, expect, it } from 'vitest'
import { downscaleServiceImage, fittedSize } from './downscale-service-image'

describe('fittedSize', () => {
  it('shrinks the longest edge to 1920 px', () => {
    expect(fittedSize(4200, 1887)).toEqual({ width: 1920, height: 863 })
  })

  it('leaves a photo that already fits', () => {
    expect(fittedSize(80, 60)).toEqual({ width: 80, height: 60 })
  })
})

describe('downscaleServiceImage', () => {
  it('returns a file that is already small enough to upload', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'topo.jpg', { type: 'image/jpeg' })

    await expect(downscaleServiceImage(file)).resolves.toBe(file)
  })
})
