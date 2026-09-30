const MAX_EDGE_PX = 1920
const SAFE_UPLOAD_BYTES = 1024 * 1024
const EXPORT_QUALITIES = [0.82, 0.7, 0.58] as const

export function fittedSize(
  width: number,
  height: number,
  maxEdge = MAX_EDGE_PX,
): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= maxEdge || longest === 0) {
    return { width, height }
  }

  const scale = maxEdge / longest
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, type, quality)
  })
}

async function exportWithinLimit(
  canvas: HTMLCanvasElement,
  baseName: string,
): Promise<File | null> {
  for (const quality of EXPORT_QUALITIES) {
    const webp = await canvasToBlob(canvas, 'image/webp', quality)
    if (webp && webp.size > 0 && webp.size <= SAFE_UPLOAD_BYTES) {
      return new File([webp], `${baseName}.webp`, { type: 'image/webp' })
    }

    const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality)
    if (jpeg && jpeg.size > 0 && jpeg.size <= SAFE_UPLOAD_BYTES) {
      return new File([jpeg], `${baseName}.jpg`, { type: 'image/jpeg' })
    }
  }

  const fallback = await canvasToBlob(canvas, 'image/jpeg', EXPORT_QUALITIES[2])
  if (!fallback || fallback.size === 0) return null
  return new File([fallback], `${baseName}.jpg`, { type: 'image/jpeg' })
}

export async function downscaleServiceImage(file: File): Promise<File> {
  if (file.size <= SAFE_UPLOAD_BYTES && file.type !== 'image/gif') {
    return file
  }
  if (typeof createImageBitmap !== 'function') {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  try {
    const size = fittedSize(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')
    if (!context) return file

    context.drawImage(bitmap, 0, 0, size.width, size.height)
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagem'
    return (await exportWithinLimit(canvas, baseName)) ?? file
  } finally {
    bitmap.close()
  }
}
