'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  GitMerge,
  Info,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  FileText,
  Copy,
  MessageCircle,
  ArrowRight,
} from 'lucide-react'
import { kosApi, ahpApi, cbpApi, integrationApi, exportApi } from '@/lib/api-mock'
import type { IntegrationResult } from '@/types'
import { formatCurrency, formatPercentage } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function IntegrationPage() {
  const [selectedKosId, setSelectedKosId] = useState<string>('')
  const [result, setResult] = useState<IntegrationResult | null>(null)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const { data: kosList, isLoading: kosLoading } = useQuery({
    queryKey: ['kos-list'],
    queryFn: async () => {
      const response = await kosApi.getAll()
      return response.data || []
    },
  })

  const { data: ahpResults } = useQuery({
    queryKey: ['ahp-results', selectedKosId],
    queryFn: async () => {
      if (!selectedKosId) return []
      const response = await ahpApi.getByKosId(selectedKosId)
      return response.data || []
    },
    enabled: !!selectedKosId,
  })

  const { data: cbpResults } = useQuery({
    queryKey: ['cbp-results', selectedKosId],
    queryFn: async () => {
      if (!selectedKosId) return []
      const response = await cbpApi.getByKosId(selectedKosId)
      return response.data || []
    },
    enabled: !!selectedKosId,
  })

  const integrateMutation = useMutation({
    mutationFn: async ({
      kosId,
      ahpId,
      cbpId,
    }: {
      kosId: string
      ahpId: string
      cbpId: string
    }) => {
      const response = await integrationApi.calculate(kosId, ahpId, cbpId)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setResult(data)
        toast.success('Integrasi berhasil!')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const exportMutation = useMutation({
    mutationFn: async (resultId: string) => {
      const response = await exportApi.generatePDF(resultId)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('PDF berhasil dibuat!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const shareMutation = useMutation({
    mutationFn: async (resultId: string) => {
      const response = await exportApi.getShareUrl(resultId)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setShareUrl(data.shareUrl)
        setIsShareDialogOpen(true)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleIntegrate = () => {
    if (!selectedKosId || !ahpResults?.length || !cbpResults?.length) {
      toast.error('Pilih kos dan pastikan sudah ada hasil AHP dan CBP')
      return
    }

    // Use the latest results
    const latestAHP = ahpResults[ahpResults.length - 1]
    const latestCBP = cbpResults[cbpResults.length - 1]

    integrateMutation.mutate({
      kosId: selectedKosId,
      ahpId: latestAHP.id,
      cbpId: latestCBP.id,
    })
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link berhasil disalin!')
  }

  const handleShareWhatsApp = () => {
    const text = `Hasil analisis harga sewa kos: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const selectedKos = kosList?.find((k) => k.id === selectedKosId)
  const hasAHPResult = ahpResults && ahpResults.length > 0
  const hasCBPResult = cbpResults && cbpResults.length > 0
  const latestAHP = hasAHPResult ? ahpResults[ahpResults.length - 1] : null
  const latestCBP = hasCBPResult ? cbpResults[cbpResults.length - 1] : null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      default:
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-amber-200 bg-amber-50'
      default:
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrasi AHP + CBP</h1>
        <p className="mt-1 text-gray-500">
          Gabungkan hasil AHP dan CBP untuk rekomendasi harga final
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-white">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tentang Integrasi</h3>
            <p className="mt-1 text-sm text-gray-600">
              Integrasi menggabungkan bobot kriteria dari AHP dengan floor price dari CBP untuk
              menghasilkan harga rekomendasi yang optimal. Harga final mempertimbangkan nilai
              preferensi dan biaya operasional secara bersamaan.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Kos Selection */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Pilih Data Kos</CardTitle>
              <CardDescription>
                Pilih kos yang sudah memiliki hasil AHP dan CBP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kosLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : kosList && kosList.length > 0 ? (
                <Select value={selectedKosId} onValueChange={setSelectedKosId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kos..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kosList.map((kos) => (
                      <SelectItem key={kos.id} value={kos.id}>
                        {kos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Empty
                  icon={GitMerge}
                  title="Belum ada data kos"
                  description="Tambahkan data kos terlebih dahulu"
                />
              )}
            </CardContent>
          </Card>

          {/* Prerequisites Status */}
          {selectedKosId && (
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg">Status Prasyarat</CardTitle>
                <CardDescription>
                  Pastikan sudah ada hasil perhitungan AHP dan CBP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    hasAHPResult ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasAHPResult ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Hasil AHP</p>
                      {latestAHP && (
                        <p className="text-sm text-gray-500">
                          CR: {formatPercentage(latestAHP.consistencyRatio * 100)} -{' '}
                          {latestAHP.isConsistent ? 'Konsisten' : 'Tidak Konsisten'}
                        </p>
                      )}
                    </div>
                  </div>
                  {!hasAHPResult && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/ahp">
                        Hitung AHP
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <div
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    hasCBPResult ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasCBPResult ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Hasil CBP</p>
                      {latestCBP && (
                        <p className="text-sm text-gray-500">
                          Floor Price: {formatCurrency(latestCBP.floorPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  {!hasCBPResult && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/cbp">
                        Hitung CBP
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleIntegrate}
                  disabled={!hasAHPResult || !hasCBPResult || integrateMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {integrateMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Mengintegrasikan...
                    </>
                  ) : (
                    <>
                      <GitMerge className="mr-2 h-4 w-4" />
                      Integrasi & Hitung Harga Final
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card className={`border-2 ${getStatusColor(result.validationStatus)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon(result.validationStatus)}
                    Hasil Integrasi
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareMutation.mutate(result.id)}
                      disabled={shareMutation.isPending}
                    >
                      <Share2 className="mr-1 h-4 w-4" />
                      Bagikan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportMutation.mutate(result.id)}
                      disabled={exportMutation.isPending}
                    >
                      <FileText className="mr-1 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Final Price */}
                <div className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-center text-white">
                  <p className="text-sm opacity-80">Harga Rekomendasi Final</p>
                  <p className="mt-2 text-4xl font-bold">
                    {formatCurrency(result.finalRecommendedPrice)}
                  </p>
                  <p className="mt-2 text-sm opacity-80">per bulan</p>
                </div>

                {/* Price Range */}
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">Range Harga</p>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Minimum</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(result.priceRange.min)}
                      </p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="relative h-2 rounded-full bg-gray-200">
                        <div
                          className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-600 bg-white shadow"
                          style={{
                            left: `${
                              ((result.finalRecommendedPrice - result.priceRange.min) /
                                (result.priceRange.max - result.priceRange.min)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Maximum</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(result.priceRange.max)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm text-gray-500">Skor AHP</p>
                    <p className="mt-1 text-2xl font-bold text-purple-600">
                      {(result.ahpScore * 100).toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm text-gray-500">Floor Price (CBP)</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {formatCurrency(result.cbpFloorPrice)}
                    </p>
                  </div>
                </div>

                {/* Validation Messages */}
                {result.validationMessages.length > 0 && (
                  <div className="space-y-2">
                    {result.validationMessages.map((msg, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-white p-3"
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                        <p className="text-sm text-gray-600">{msg}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="space-y-6">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Cara Kerja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5 shrink-0 bg-purple-100 text-purple-700">1</Badge>
                <div>
                  <p className="font-medium text-gray-900">Input Data Kos</p>
                  <p className="text-sm text-gray-500">
                    Masukkan data kos, biaya, dan fasilitas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5 shrink-0 bg-purple-100 text-purple-700">2</Badge>
                <div>
                  <p className="font-medium text-gray-900">Hitung AHP</p>
                  <p className="text-sm text-gray-500">
                    Tentukan bobot kriteria melalui perbandingan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5 shrink-0 bg-purple-100 text-purple-700">3</Badge>
                <div>
                  <p className="font-medium text-gray-900">Hitung CBP</p>
                  <p className="text-sm text-gray-500">
                    Kalkulasi harga berdasarkan biaya
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5 shrink-0 bg-purple-100 text-purple-700">4</Badge>
                <div>
                  <p className="font-medium text-gray-900">Integrasi</p>
                  <p className="text-sm text-gray-500">
                    Gabungkan AHP + CBP untuk harga optimal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Formula Integrasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gray-50 p-3 font-mono text-xs">
                Final = CBP × (1 + (AHP_Score - 0.2) × 0.5)
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Harga final disesuaikan berdasarkan skor AHP. Semakin tinggi bobot kriteria
                yang terpenuhi, semakin tinggi pula harga yang dapat ditetapkan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bagikan Hasil</DialogTitle>
            <DialogDescription>
              Bagikan hasil analisis melalui link atau media sosial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button variant="outline" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleShareWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
