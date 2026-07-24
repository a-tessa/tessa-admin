export async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const limit = Math.max(1, Math.floor(concurrency))
  const results: PromiseSettledResult<R>[] = Array.from({ length: items.length })
  let nextIndex = 0

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      const item = items[currentIndex]
      if (item === undefined) {
        continue
      }

      try {
        const value = await worker(item, currentIndex)
        results[currentIndex] = { status: 'fulfilled', value }
      } catch (error) {
        results[currentIndex] = {
          status: 'rejected',
          reason: error,
        }
      }
    }
  }

  const poolSize = Math.min(limit, items.length)
  await Promise.all(
    Array.from({ length: poolSize }, () => runWorker()),
  )

  return results
}
