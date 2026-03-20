export function formatDate(dateString: string, locale: string = 'fr-FR', options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, options || { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(dateString: string, locale: string = 'fr-FR', options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString(locale, options || { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
