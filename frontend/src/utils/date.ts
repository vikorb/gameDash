
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

export function formatDateTime(dateString: string, locale: string = 'fr-FR', options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString(locale, options || { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
