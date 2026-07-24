import { describe, expect, it, vi } from 'vitest'
import { mapPool } from './upload-queue'

describe('fila de upload com concorrência limitada', () => {
  it('respeita o limite de concorrência e preserva sucessos parciais', async () => {
    let active = 0
    let peak = 0
    const items = [1, 2, 3, 4, 5]

    const results = await mapPool(items, 2, async (item) => {
      active += 1
      peak = Math.max(peak, active)
      await new Promise((resolve) => {
        setTimeout(resolve, 15)
      })
      active -= 1
      if (item === 3) {
        throw new Error(`falha-${String(item)}`)
      }
      return item * 10
    })

    expect(peak).toBeLessThanOrEqual(2)
    expect(results).toHaveLength(5)
    expect(results[0]).toEqual({ status: 'fulfilled', value: 10 })
    expect(results[1]).toEqual({ status: 'fulfilled', value: 20 })
    expect(results[2]?.status).toBe('rejected')
    expect(results[3]).toEqual({ status: 'fulfilled', value: 40 })
    expect(results[4]).toEqual({ status: 'fulfilled', value: 50 })
  })

  it('processa lista vazia sem chamar o worker', async () => {
    const worker = vi.fn()
    await expect(mapPool([], 3, worker)).resolves.toEqual([])
    expect(worker).not.toHaveBeenCalled()
  })
})
