'use client'

import Link from 'next/link'
import { AlertTriangle, ChevronRight, Lock } from 'lucide-react'
import type { CalculationValidation } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getFieldLabel } from '@/lib/validation'

interface CalculationBlockingCardProps {
  kosId: string
  operation: 'ahp' | 'cbp' | 'both'
  validation: CalculationValidation
  title?: string
  description?: string
}

export function CalculationBlockingCard({
  kosId,
  operation,
  validation,
  title,
  description,
}: CalculationBlockingCardProps) {
  if (validation.canProceed) {
    return null
  }

  const isAHPBlocked = operation === 'ahp' || operation === 'both'
  const isCBPBlocked = operation === 'cbp' || operation === 'both'

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-900 dark:from-amber-950/50 dark:to-orange-950/50">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title || 'Data Tidak Lengkap'}
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              {description || 'Lengkapi data berikut sebelum melakukan perhitungan'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Missing Fields Alert */}
        {validation.missingFields.length > 0 && (
          <div className="rounded-lg bg-white/50 dark:bg-gray-900/50 p-4">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Kolom yang Harus Diisi
            </h4>
            <div className="space-y-2">
              {validation.missingFields.map((field) => (
                <div key={field} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                  <span className="text-amber-400">•</span>
                  <span>{getFieldLabel(field)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <div className="rounded-lg bg-white/50 dark:bg-gray-900/50 p-4">
            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Peringatan
            </h4>
            <div className="space-y-2">
              {validation.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-orange-800 dark:text-orange-200">
                  <span className="text-orange-400 mt-1">!</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-amber-200/50 dark:bg-amber-900/50" />

        {/* Action Section */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Kunjungi halaman edit data untuk melengkapi informasi yang diperlukan.
            </p>
          </div>
          <Button asChild className="shrink-0 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800">
            <Link href={`/kos?edit=${kosId}`}>
              Lengkapi Data
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Calculation Type Info */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase">
            Perhitungan yang Terpengaruh:
          </p>
          <div className="flex flex-wrap gap-2">
            {isAHPBlocked && (
              <Badge variant="outline" className="border-amber-300 bg-white/50 dark:bg-gray-900/50">
                AHP Terganggu
              </Badge>
            )}
            {isCBPBlocked && (
              <Badge variant="outline" className="border-amber-300 bg-white/50 dark:bg-gray-900/50">
                CBP Terganggu
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
