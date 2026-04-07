// =============================================
// API Key Management Utilities
// =============================================

import type { ApiKey, ApiKeyInfo, ApiKeyStatus } from '@/types'

/**
 * Get the status of an API key
 */
export function getApiKeyStatus(apiKey: ApiKey): ApiKeyStatus {
  if (!apiKey.isActive) {
    return 'revoked'
  }

  if (apiKey.expiresAt) {
    const expiryDate = new Date(apiKey.expiresAt)
    const now = new Date()

    if (expiryDate <= now) {
      return 'expired'
    }
  }

  if (apiKey.type === 'temporary') {
    return 'temporary'
  }

  return 'active'
}

/**
 * Calculate days until API key expiration
 */
export function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null

  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if API key is expiring soon (within 7 days)
 */
export function isExpiringsSoon(expiresAt: string | null): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(expiresAt)
  if (daysUntilExpiry === null) return false
  return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
}

/**
 * Check if API key is expired
 */
export function isExpired(expiresAt: string | null): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(expiresAt)
  if (daysUntilExpiry === null) return false
  return daysUntilExpiry < 0
}

/**
 * Format API key for display (mask sensitive parts)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return key
  const start = key.substring(0, 4)
  const end = key.substring(key.length - 4)
  return `${start}...${end}`
}

/**
 * Generate a mock API key
 */
export function generateApiKey(prefix: string = 'kos'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let key = `${prefix}_`
  
  for (let i = 0; i < 20; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return key
}

/**
 * Get enhanced API key info
 */
export function enhanceApiKeyInfo(apiKey: ApiKey): ApiKeyInfo {
  const status = getApiKeyStatus(apiKey)
  const daysUntilExpiry = getDaysUntilExpiry(apiKey.expiresAt)
  const isExpirySoon = isExpiringsSoon(apiKey.expiresAt)
  const isExpiredKey = isExpired(apiKey.expiresAt)

  return {
    ...apiKey,
    status,
    daysUntilExpiry: daysUntilExpiry ?? undefined,
    isExpired: isExpiredKey,
    isExpiringSoon: isExpirySoon,
  }
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: ApiKeyStatus): string {
  const labels: Record<ApiKeyStatus, string> = {
    active: 'Aktif',
    expired: 'Kadaluarsa',
    revoked: 'Dibatalkan',
    temporary: 'Sementara',
  }
  return labels[status]
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(
  status: ApiKeyStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'expired':
      return 'destructive'
    case 'revoked':
      return 'destructive'
    case 'temporary':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * Format last used time
 */
export function formatLastUsedTime(lastUsedAt: string | null): string {
  if (!lastUsedAt) return 'Belum pernah digunakan'

  const date = new Date(lastUsedAt)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      return `${diffMinutes} menit yang lalu`
    }
    return `${diffHours} jam yang lalu`
  }

  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`

  return date.toLocaleDateString('id-ID')
}

/**
 * Check if user can delete API key
 */
export function canDeleteApiKey(apiKey: ApiKey): boolean {
  // Cannot delete if it's the only active key
  // (This check would need context of all keys)
  return apiKey.status !== 'active' || !apiKey.isActive
}

/**
 * Get permission display names
 */
export function getPermissionLabel(permission: string): string {
  const labels: Record<string, string> = {
    read: 'Baca',
    write: 'Tulis',
    delete: 'Hapus',
    admin: 'Admin',
  }
  return labels[permission] || permission
}
