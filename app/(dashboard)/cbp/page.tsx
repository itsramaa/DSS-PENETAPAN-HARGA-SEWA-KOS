'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  DollarSign,
  Info,
  Calculator,
  TrendingUp,
  Percent,
  Building,
  Zap,
  PieChart,
} from 'lucide-react'
import { kosApi, cbpApi } from '@/lib/api-mock'
import type { CBPInput, CBPResult } from '@/types'
import { formatCurrency, formatPercentage } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Slider } from '@/components/ui/slider'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function CBPPage() {
  const [selectedKosId, setSelectedKosId] = useState<string>('')
  const [occupancyRate, setOccupancyRate] = useState<number>(80)
  const [expectedProfit, setExpectedProfit] = useState<number>(20)
  const [depreciationYears, setDepreciationYears] = useState<string>('10')
  const [result, setResult] = useState<CBPResult | null>(null)

  const { data: kosList, isLoading: kosLoading } = useQuery({
    queryKey: ['kos-list'],
    queryFn: async () => {
      const response = await kosApi.getAll()
      return response.data || []
    },
  })

  const selectedKos = kosList?.find((k) => k.id === selectedKosId)

  const calculateMutation = useMutation({
    mutationFn: async (input: CBPInput) => {
      const response = await cbpApi.calculate(input)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setResult(data)
        toast.success('Perhitungan CBP berhasil!')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleCalculate = () => {
    if (!selectedKosId) {
      toast.error('Pilih kos terlebih dahulu')
      return
    }

    calculateMutation.mutate({
      kosId: selectedKosId,
      occupancyRate,
      expectedProfit,
      depreciationYears: parseInt(depreciationYears) || 10,
    })
  }

  const handleKosSelect = (kosId: string) => {
    setSelectedKosId(kosId)
    setResult(null)
  }

  // Calculate totals for selected kos
  const totalFixedCost =
    selectedKos?.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0) || 0
  const totalVariableCost =
    selectedKos?.costs.variableCosts.reduce((sum, c) => sum + c.amount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kalkulator CBP</h1>
        <p className="mt-1 text-gray-500">
          Cost-Based Pricing untuk menghitung harga berdasarkan biaya operasional
        </p>
      </div>

      {/* CBP Info Card */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <Info className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tentang Cost-Based Pricing</h3>
            <p className="mt-1 text-sm text-gray-600">
              CBP adalah metode penetapan harga berdasarkan perhitungan biaya. Formula yang
              digunakan:{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                Harga = (Biaya Tetap/Bulan + Biaya Variabel) × (1 + Markup%)
              </code>
              . Tingkat okupansi mempengaruhi pembagian biaya tetap per kamar.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Input */}
        <div className="space-y-6 lg:col-span-2">
          {/* Kos Selection */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Pilih Data Kos</CardTitle>
              <CardDescription>
                Pilih kos yang akan dihitung harga sewanya
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kosLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : kosList && kosList.length > 0 ? (
                <Select value={selectedKosId} onValueChange={handleKosSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kos..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kosList.map((kos) => (
                      <SelectItem key={kos.id} value={kos.id}>
                        {kos.name} - {kos.totalRooms} kamar
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Empty
                  icon={DollarSign}
                  title="Belum ada data kos"
                  description="Tambahkan data kos dan biaya terlebih dahulu"
                />
              )}
            </CardContent>
          </Card>

          {/* Cost Summary */}
          {selectedKos && (
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Biaya</CardTitle>
                <CardDescription>
                  Data biaya dari kos {selectedKos.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Biaya Tetap (Tahunan)</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(totalFixedCost)}
                        </p>
                      </div>
                    </div>
                    {selectedKos.costs.fixedCosts.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-blue-100 pt-3">
                        {selectedKos.costs.fixedCosts.map((cost) => (
                          <div key={cost.id} className="flex justify-between text-sm">
                            <span className="text-gray-500">{cost.name}</span>
                            <span className="text-gray-700">{formatCurrency(cost.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <Zap className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Biaya Variabel (Bulanan/Kamar)</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(totalVariableCost)}
                        </p>
                      </div>
                    </div>
                    {selectedKos.costs.variableCosts.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-orange-100 pt-3">
                        {selectedKos.costs.variableCosts.map((cost) => (
                          <div key={cost.id} className="flex justify-between text-sm">
                            <span className="text-gray-500">{cost.name}</span>
                            <span className="text-gray-700">{formatCurrency(cost.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parameters */}
          {selectedKosId && (
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg">Parameter Perhitungan</CardTitle>
                <CardDescription>
                  Sesuaikan parameter untuk kalkulasi harga
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Occupancy Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Tingkat Okupansi</FieldLabel>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                      {occupancyRate}%
                    </span>
                  </div>
                  <Slider
                    value={[occupancyRate]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={([v]) => setOccupancyRate(v)}
                    className="[&>span]:bg-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>10%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Perkiraan tingkat hunian kamar. Semakin rendah okupansi, semakin tinggi
                    harga per kamar untuk menutup biaya tetap.
                  </p>
                </div>

                {/* Expected Profit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Target Profit (Markup)</FieldLabel>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      {expectedProfit}%
                    </span>
                  </div>
                  <Slider
                    value={[expectedProfit]}
                    min={5}
                    max={50}
                    step={5}
                    onValueChange={([v]) => setExpectedProfit(v)}
                    className="[&>span]:bg-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>5%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Persentase keuntungan yang diinginkan di atas biaya dasar.
                  </p>
                </div>

                {/* Depreciation Years */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="depreciation">Periode Depresiasi (Tahun)</FieldLabel>
                    <Select
                      value={depreciationYears}
                      onValueChange={setDepreciationYears}
                    >
                      <SelectTrigger id="depreciation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Tahun</SelectItem>
                        <SelectItem value="10">10 Tahun</SelectItem>
                        <SelectItem value="15">15 Tahun</SelectItem>
                        <SelectItem value="20">20 Tahun</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-gray-500">
                      Periode untuk membagi biaya tetap (investasi awal).
                    </p>
                  </Field>
                </FieldGroup>

                <Button
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Menghitung...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Hitung Harga CBP
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          {/* Formula Card */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Formula CBP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">1. Unit Cost per Kamar</p>
                <div className="rounded-lg bg-gray-50 p-3 font-mono text-xs">
                  UC = (FC / T / 12 / R / O) + VC
                </div>
                <div className="text-xs text-gray-500">
                  <p>FC = Biaya Tetap Tahunan</p>
                  <p>T = Tahun Depresiasi</p>
                  <p>R = Jumlah Kamar</p>
                  <p>O = Tingkat Okupansi</p>
                  <p>VC = Biaya Variabel</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">2. Harga Rekomendasi</p>
                <div className="rounded-lg bg-gray-50 p-3 font-mono text-xs">
                  Harga = UC × (1 + Markup%)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Hasil Perhitungan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recommended Price */}
                <div className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-center text-white">
                  <p className="text-sm opacity-80">Harga Rekomendasi per Bulan</p>
                  <p className="mt-1 text-3xl font-bold">
                    {formatCurrency(result.recommendedPrice)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-white p-3">
                    <span className="text-sm text-gray-500">Biaya Tetap Total</span>
                    <span className="font-medium">{formatCurrency(result.totalFixedCost)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white p-3">
                    <span className="text-sm text-gray-500">Biaya Variabel/Kamar</span>
                    <span className="font-medium">{formatCurrency(result.totalVariableCost)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white p-3">
                    <span className="text-sm text-gray-500">Unit Cost</span>
                    <span className="font-medium">{formatCurrency(result.unitCost)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white p-3">
                    <span className="text-sm text-gray-500">Floor Price (BEP)</span>
                    <span className="font-medium text-amber-600">
                      {formatCurrency(result.floorPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white p-3">
                    <span className="text-sm text-gray-500">Markup</span>
                    <span className="font-medium text-green-600">
                      +{formatPercentage(result.markupPercentage)}
                    </span>
                  </div>
                </div>

                {/* Visual Breakdown */}
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">Komposisi Harga</p>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Unit Cost</span>
                        <span>
                          {formatPercentage(
                            (result.unitCost / result.recommendedPrice) * 100
                          )}
                        </span>
                      </div>
                      <Progress
                        value={(result.unitCost / result.recommendedPrice) * 100}
                        className="h-2 [&>div]:bg-blue-500"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Profit</span>
                        <span>
                          {formatPercentage(
                            ((result.recommendedPrice - result.unitCost) /
                              result.recommendedPrice) *
                              100
                          )}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((result.recommendedPrice - result.unitCost) /
                            result.recommendedPrice) *
                          100
                        }
                        className="h-2 [&>div]:bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
