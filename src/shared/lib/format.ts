const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatDateTime(value: string | Date): string {
  return dateFormatter.format(new Date(value))
}

const relativeDateFormatter = new Intl.RelativeTimeFormat('pt-BR', {
  numeric: 'auto',
})

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export function formatRelativeDate(value: string | Date): string {
  const date = new Date(value)
  const now = Date.now()
  const diffInSeconds = Math.round((date.getTime() - now) / 1000)

  if (Math.abs(diffInSeconds) < MINUTE) {
    return relativeDateFormatter.format(diffInSeconds, 'second')
  }

  if (Math.abs(diffInSeconds) < HOUR) {
    return relativeDateFormatter.format(Math.round(diffInSeconds / MINUTE), 'minute')
  }

  if (Math.abs(diffInSeconds) < DAY) {
    return relativeDateFormatter.format(Math.round(diffInSeconds / HOUR), 'hour')
  }

  return formatDateTime(value)
}
