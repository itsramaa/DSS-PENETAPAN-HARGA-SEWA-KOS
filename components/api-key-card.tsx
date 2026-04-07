'use client'

import { useState } from 'react'
import {
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'
import type { ApiKey, ApiKeyInfo } from '@/types'
import {
  enhanceApiKeyInfo,
  maskApiKey,
  getStatusLabel,
  getStatusBadgeColor,
  formatLastUsedTime,
  getDaysUntilExpiry,
} from '@/lib/api-key-utils'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ApiKeyCardProps {
  apiKey: ApiKey
  onDelete?: (id: string) => void
  onRefresh?: (id: string) => void
  onCopy?: (key: string) => void
}

export function ApiKeyCard({
  apiKey,
  onDelete,
  onRefresh,
  onCopy,
}: ApiKeyCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const enhancedInfo = enhanceApiKeyInfo(apiKey)
  const statusColor = getStatusBadgeColor(enhancedInfo.status)
  const daysUntilExpiry = getDaysUntilExpiry(apiKey.expiresAt)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key)
      setCopied(true)
      toast.success('Kunci API disalin ke clipboard')
      onCopy?.(apiKey.key)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Gagal menyalin kunci API')
    }
  }

  const getStatusIcon = () => {
    switch (enhancedInfo.status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'revoked':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'temporary':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    }
  }

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{apiKey.name}</CardTitle>
              <Badge variant={statusColor} className="shrink-0 flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-xs">{getStatusLabel(enhancedInfo.status)}</span>
              </Badge>
              {apiKey.type === 'temporary' && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  Sementara
                </Badge>
              )}
            </div>
            {apiKey.description && (
              <CardDescription className="mt-1">{apiKey.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Salin Kunci
              </DropdownMenuItem>
              {onRefresh && (
                <DropdownMenuItem onClick={() => onRefresh(apiKey.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Perbaharui
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(apiKey.id)} className="text-red-600 dark:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* API Key Display */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Kunci API</label>
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 font-mono text-sm">
            <code className="flex-1 break-all">
              {revealed ? apiKey.key : maskApiKey(apiKey.maskedKey)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setRevealed(!revealed)}
              title={revealed ? 'Sembunyikan' : 'Tampilkan'}
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
              title="Salin"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Permissions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Izin ({apiKey.permissions.length})
            </label>
            <div className="flex flex-wrap gap-1">
              {apiKey.permissions.length > 0 ? (
                apiKey.permissions.map((perm) => (
                  <Badge key={perm} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Tidak ada izin</span>
              )}
            </div>
          </div>

          {/* Usage Info */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Penggunaan
            </label>
            <div className="space-y-1 text-sm">
              {enhancedInfo.usageCount !== undefined && (
                <p className="text-muted-foreground">
                  Digunakan: <span className="font-semibold">{enhancedInfo.usageCount}x</span>
                </p>
              )}
              <p className="text-muted-foreground">
                Terakhir: <span className="font-semibold">{formatLastUsedTime(apiKey.lastUsedAt)}</span>
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Expiration & Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Dibuat
            </label>
            <p className="text-sm">
              {new Date(apiKey.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Expiration Status */}
          {apiKey.expiresAt ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Berakhir
              </label>
              <div className="space-y-1">
                <p className="text-sm">
                  {new Date(apiKey.expiresAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                  <div className={`flex items-center gap-1 text-xs ${
                    enhancedInfo.isExpiringSoon
                      ? 'text-amber-600 dark:text-amber-400'
                      : daysUntilExpiry <= 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {daysUntilExpiry <= 0 
                      ? 'Kadaluarsa'
                      : daysUntilExpiry === 1
                        ? 'Berakhir besok'
                        : `${daysUntilExpiry} hari tersisa`}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Berakhir
              </label>
              <Badge variant="outline" className="w-fit text-xs">
                Permanen
              </Badge>
            </div>
          )}
        </div>

        {/* Expiration Warning */}
        {enhancedInfo.isExpiringSoon && !enhancedInfo.isExpired && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Kunci API akan berakhir dalam {daysUntilExpiry} hari. Pertimbangkan untuk membuat kunci baru.
              </p>
            </div>
          </div>
        )}

        {/* Expired Warning */}
        {enhancedInfo.isExpired && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">
                Kunci API ini telah kadaluarsa dan tidak dapat digunakan lagi.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
