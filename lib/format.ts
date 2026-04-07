// Format currency to Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

// Format date to Indonesian locale
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date(date))
}

// Format datetime to Indonesian locale
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

// Mask sensitive API key for display
export function maskApiKey(key: string): string {
  if (key.length <= 8) return key
  const start = key.substring(0, 4)
  const end = key.substring(key.length - 4)
  return `${start}${'•'.repeat(key.length - 8)}${end}`
}
