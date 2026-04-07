'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calculator,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Sliders,
} from 'lucide-react'
import { kosApi, ahpApi } from '@/lib/api-mock'
import { DEFAULT_AHP_CRITERIA, AHP_SCALE, type AHPInput, type AHPResult, type PairwiseComparison } from '@/types'
import { formatPercentage } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function AHPPage() {
  const [selectedKosId, setSelectedKosId] = useState<string>('')
  const [comparisons, setComparisons] = useState<Record<string, number>>({})
  const [result, setResult] = useState<AHPResult | null>(null)
  const queryClient = useQueryClient()

  const { data: kosList, isLoading: kosLoading } = useQuery({
    queryKey: ['kos-list'],
    queryFn: async () => {
      const response = await kosApi.getAll()
      return response.data || []
    },
  })

  const criteria = DEFAULT_AHP_CRITERIA

  // Generate all pairwise comparison pairs
  const comparisonPairs = useMemo(() => {
    const pairs: { a: number; b: number }[] = []
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        pairs.push({ a: i, b: j })
      }
    }
    return pairs
  }, [criteria])

  // Initialize comparisons
  const initializeComparisons = () => {
    const initial: Record<string, number> = {}
    comparisonPairs.forEach(({ a, b }) => {
      initial[`${a}-${b}`] = 1 // Default: equally important
    })
    setComparisons(initial)
    setResult(null)
  }

  const calculateMutation = useMutation({
    mutationFn: async (input: AHPInput) => {
      const response = await ahpApi.calculate(input)
      return response
    },
    onSuccess: (response) => {
      if (response.data) {
        setResult(response.data)
        if (response.success) {
          toast.success('Perhitungan AHP berhasil!')
        } else {
          toast.warning(response.error?.message || 'Hasil tidak konsisten')
        }
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

    const pairwiseComparisons: PairwiseComparison[] = comparisonPairs.map(({ a, b }) => ({
      criteriaA: a.toString(),
      criteriaB: b.toString(),
      value: comparisons[`${a}-${b}`] || 1,
    }))

    calculateMutation.mutate({
      kosId: selectedKosId,
      comparisons: pairwiseComparisons,
    })
  }

  const handleKosSelect = (kosId: string) => {
    setSelectedKosId(kosId)
    initializeComparisons()
  }

  const getComparisonLabel = (value: number) => {
    if (value >= 1) {
      const scale = AHP_SCALE.find((s) => s.value === Math.round(value))
      return scale?.label || `${value.toFixed(1)}x lebih penting`
    } else {
      const inverse = 1 / value
      const scale = AHP_SCALE.find((s) => s.value === Math.round(inverse))
      return scale?.label || `${inverse.toFixed(1)}x lebih penting`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kalkulator AHP</h1>
        <p className="mt-1 text-gray-500">
          Analytic Hierarchy Process untuk menentukan bobot kriteria penetapan harga
        </p>
      </div>

      {/* AHP Info Card */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-white">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tentang AHP</h3>
            <p className="mt-1 text-sm text-gray-600">
              AHP adalah metode pengambilan keputusan yang menggunakan perbandingan berpasangan
              untuk menentukan prioritas kriteria. Skala perbandingan 1-9 digunakan untuk
              menilai tingkat kepentingan relatif antar kriteria. Hasil dianggap konsisten jika
              Consistency Ratio (CR) ≤ 10%.
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
                Pilih kos yang akan dihitung bobot kriterianya
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
                        {kos.name} - {kos.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Empty
                  icon={Calculator}
                  title="Belum ada data kos"
                  description="Tambahkan data kos terlebih dahulu"
                />
              )}
            </CardContent>
          </Card>

          {/* Pairwise Comparisons */}
          {selectedKosId && (
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sliders className="h-5 w-5 text-purple-600" />
                  Perbandingan Berpasangan
                </CardTitle>
                <CardDescription>
                  Bandingkan kepentingan relatif antar kriteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {comparisonPairs.map(({ a, b }) => {
                  const key = `${a}-${b}`
                  const value = comparisons[key] || 1
                  const displayValue = value >= 1 ? value : 1 / value
                  const leftFavored = value >= 1

                  return (
                    <div key={key} className="space-y-3 rounded-lg border border-purple-100 bg-purple-50/30 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${
                            leftFavored ? 'text-purple-700' : 'text-gray-500'
                          }`}
                        >
                          {criteria[a].name}
                        </span>
                        <Badge variant="secondary" className="bg-white">
                          {getComparisonLabel(value)}
                        </Badge>
                        <span
                          className={`font-medium ${
                            !leftFavored ? 'text-purple-700' : 'text-gray-500'
                          }`}
                        >
                          {criteria[b].name}
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="px-2">
                              <Slider
                                value={[value >= 1 ? value : -1 / value]}
                                min={-9}
                                max={9}
                                step={1}
                                onValueChange={([v]) => {
                                  const actualValue = v >= 0 ? Math.max(1, v) : -1 / v
                                  setComparisons((prev) => ({
                                    ...prev,
                                    [key]: actualValue,
                                  }))
                                }}
                                className="cursor-pointer"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Geser untuk membandingkan kepentingan</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>9x {criteria[a].name}</span>
                        <span>Sama</span>
                        <span>9x {criteria[b].name}</span>
                      </div>
                    </div>
                  )
                })}

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
                      Hitung Bobot AHP
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          {/* Criteria Reference */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Kriteria</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {criteria.map((c, i) => (
                  <AccordionItem key={c.id} value={c.id}>
                    <AccordionTrigger className="text-sm">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700">{i + 1}</Badge>
                        {c.name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-500">
                      {c.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Scale Reference */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Skala AHP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AHP_SCALE.map((s) => (
                  <div key={s.value} className="flex items-start gap-3 text-sm">
                    <Badge variant="outline" className="shrink-0">
                      {s.value}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-700">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card
              className={`border-2 ${
                result.isConsistent
                  ? 'border-green-200 bg-green-50/30'
                  : 'border-red-200 bg-red-50/30'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.isConsistent ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Hasil AHP
                </CardTitle>
                <CardDescription>
                  {result.isConsistent
                    ? 'Perbandingan Anda konsisten'
                    : 'Perbandingan tidak konsisten, silakan review kembali'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CR Value */}
                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Consistency Ratio (CR)</span>
                    <span
                      className={`font-bold ${
                        result.isConsistent ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(result.consistencyRatio * 100)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(result.consistencyRatio * 100, 100)}
                    className={`mt-2 h-2 ${
                      result.isConsistent ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Batas maksimum: 10%
                  </p>
                </div>

                {/* Weights */}
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Bobot Kriteria</p>
                  <div className="space-y-2">
                    {criteria.map((c, i) => {
                      const weight = result.eigenVector[i]
                      return (
                        <div key={c.id} className="flex items-center gap-3">
                          <span className="w-24 truncate text-sm text-gray-600">{c.name}</span>
                          <div className="flex-1">
                            <Progress
                              value={weight * 100}
                              className="h-2 [&>div]:bg-purple-500"
                            />
                          </div>
                          <span className="w-16 text-right text-sm font-medium">
                            {formatPercentage(weight * 100)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {!result.isConsistent && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-sm text-amber-700">
                      Hasil perbandingan tidak konsisten. Silakan review kembali perbandingan
                      yang telah Anda berikan dan pastikan logika kepentingan antar kriteria
                      tidak bertentangan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
