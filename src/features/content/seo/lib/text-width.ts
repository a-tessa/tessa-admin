/**
 * Approximate SERP pixel budgets. Google truncates by rendered width, not
 * character count. Values are documented approximations of the desktop/mobile
 * result snippet, using Arial metrics.
 */
export const SERP_TITLE_FONT = '20px Arial, sans-serif'
export const SERP_DESCRIPTION_FONT = '14px Arial, sans-serif'
export const SERP_TITLE_DESKTOP_PX = 580
export const SERP_TITLE_MOBILE_PX = 430
export const SERP_DESCRIPTION_DESKTOP_PX = 920
export const SERP_DESCRIPTION_MOBILE_PX = 680

export const RECOMMENDED_TITLE_MIN = 30
export const RECOMMENDED_TITLE_MAX = 60
export const RECOMMENDED_DESCRIPTION_MIN = 120
export const RECOMMENDED_DESCRIPTION_MAX = 155
export const HARD_TITLE_MAX = 70
export const HARD_DESCRIPTION_MAX = 180

const DEFAULT_LOWER = 0.56
const DEFAULT_UPPER = 0.72
const CHAR_WIDTHS: Record<string, number> = {
  ' ': 0.28,
  i: 0.28,
  l: 0.28,
  I: 0.32,
  j: 0.3,
  t: 0.35,
  f: 0.35,
  r: 0.4,
  s: 0.5,
  e: 0.56,
  a: 0.56,
  n: 0.62,
  o: 0.62,
  u: 0.62,
  c: 0.54,
  m: 0.89,
  w: 0.89,
  M: 0.95,
  W: 1,
  '.': 0.28,
  ',': 0.28,
  '|': 0.3,
  '-': 0.36,
}

function parseFontSize(font: string): number {
  const match = /(\d+(?:\.\d+)?)px/.exec(font)
  return match ? Number(match[1]) : 16
}

function estimateCharacterWidth(character: string, fontSize: number): number {
  if (CHAR_WIDTHS[character] !== undefined) {
    return CHAR_WIDTHS[character] * fontSize
  }

  if (character.toLowerCase() === character) {
    return DEFAULT_LOWER * fontSize
  }

  return DEFAULT_UPPER * fontSize
}

function estimateTextWidth(text: string, font: string): number {
  const fontSize = parseFontSize(font)
  let width = 0
  for (const character of text) {
    width += estimateCharacterWidth(character, fontSize)
  }
  return width
}

function measureWithCanvas(text: string, font: string): number | null {
  if (typeof document === 'undefined') return null
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
    return null
  }

  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context || typeof context.measureText !== 'function') return null
    context.font = font
    const width = context.measureText(text).width
    return Number.isFinite(width) && width > 0 ? width : null
  } catch {
    return null
  }
}

export function measureTextWidth(text: string, font: string): number {
  return measureWithCanvas(text, font) ?? estimateTextWidth(text, font)
}

export function truncateToWidth(
  text: string,
  font: string,
  maxWidth: number,
): string {
  if (measureTextWidth(text, font) <= maxWidth) return text

  const ellipsis = '...'
  let truncated = text
  while (
    truncated.length > 0 &&
    measureTextWidth(`${truncated}${ellipsis}`, font) > maxWidth
  ) {
    truncated = truncated.slice(0, -1)
  }

  return truncated.length > 0 ? `${truncated.trimEnd()}${ellipsis}` : ellipsis
}

export function applyTitleTemplate(
  title: string,
  titleTemplate: string,
): string {
  if (titleTemplate.includes('%s')) {
    return titleTemplate.replaceAll('%s', title)
  }

  return title
}
