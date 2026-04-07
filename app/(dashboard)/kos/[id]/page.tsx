'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Users,
  Square,
  Zap,
  Calculator,
  DollarSign,
  GitMerge,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  BarChart3,
  Clock,
  Settings,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { kosApi, validationApi, statisticsApi, ahpApi, cbpApi, integrationApi } from '@/lib/api-mock'
import type { KosData, AHPInput, CBPInput, PairwiseComparison } from '@/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { toast } from 'sonner'

const CHART_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']

export default function KosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isCalculating, setIsCalculating] = useState<string | null>(null)

  const { data: kos, isLoading: kosLoading } = useQuery({
    queryKey: ['kos', id],
    queryFn: async () => {
      const response = await kosApi.getById(id)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
  })

  const { data: validation, isLoading: validationLoading } = useQuery({
    queryKey: ['kos-validation', id],
    queryFn: async () => {
      const response = await validationApi.validateKos(id)
      return response.data
    },
    enabled: !!kos,
  })

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['kos-statistics', id],
    queryFn: async () => {
      const response = await statisticsApi.getKosStatistics(id)
      return response.data
    },
    enabled: !!kos,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await kosApi.delete(id)
      if (!response.success) throw new Error(response.error?.message)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kos-list'] })
      toast.success('Data kos berhasil dihapus')
      router.push('/kos')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Quick calculation handlers
  const handleQuickAHP = async () => {
    if (!validation?.canCalculateAHP) {
      toast.error('Data tidak lengkap untuk perhitungan AHP')
      return
    }
    
    setIsCalculating('ahp')
    try {
      // Generate default comparisons (all equal = 1)
      const comparisons: PairwiseComparison[] = []
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          comparisons.push({ criteriaA: i.toString(), criteriaB: j.toString(), value: 1 })
        }
      }
      
      const response = await ahpApi.calculate({ kosId: id, comparisons })
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['kos-statistics', id] })
        toast.success('Perhitungan AHP berhasil (menggunakan bobot default)')
      } else {
        toast.warning(response.error?.message || 'Perhitungan selesai dengan peringatan')
      }
    } catch (error) {
      toast.error('Gagal menghitung AHP')
    } finally {
      setIsCalculating(null)
    }
  }

  const handleQuickCBP = async () => {
    if (!validation?.canCalculateCBP) {
      toast.error('Data tidak lengkap untuk perhitungan CBP')
      return
    }
    
    setIsCalculating('cbp')
    try {
      const response = await cbpApi.calculate({
        kosId: id,
        occupancyRate: 80,
        expectedProfit: 20,
        depreciationYears: 10,
      })
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['kos-statistics', id] })
        toast.success(`Harga rekomendasi CBP: ${formatCurrency(response.data.recommendedPrice)}`)
      } else {
        throw new Error(response.error?.message)
      }
    } catch (error) {
      toast.error('Gagal menghitung CBP')
    } finally {
      setIsCalculating(null)
    }
  }

  const handleQuickAll = async () => {
    if (!validation?.canCalculateAHP || !validation?.canCalculateCBP) {
      toast.error('Data tidak lengkap untuk perhitungan')
      return
    }
    
    setIsCalculating('all')
    try {
      // Calculate AHP
      const comparisons: PairwiseComparison[] = []
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          comparisons.push({ criteriaA: i.toString(), criteriaB: j.toString(), value: 1 })
        }
      }
      const ahpResponse = await ahpApi.calculate({ kosId: id, comparisons })
      
      // Calculate CBP
      const cbpResponse = await cbpApi.calculate({
        kosId: id,
        occupancyRate: 80,
        expectedProfit: 20,
        depreciationYears: 10,
      })
      
      if (ahpResponse.data && cbpResponse.data) {
        // Calculate Integration
        const intResponse = await integrationApi.calculate(id, ahpResponse.data.id, cbpResponse.data.id)
        if (intResponse.success && intResponse.data) {
          queryClient.invalidateQueries({ queryKey: ['kos-statistics', id] })
          toast.success(`Harga rekomendasi: ${formatCurrency(intResponse.data.finalRecommendedPrice)}`)
        }
      }
    } catch (error) {
      toast.error('Gagal menghitung')
    } finally {
      setIsCalculating(null)
    }
  }

  if (kosLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!kos) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-xl font-semibold">Data Kos Tidak Ditemukan</h2>
        <Button asChild className="mt-4">
          <Link href="/kos">Kembali ke Daftar Kos</Link>
        </Button>
      </div>
    )
  }

  const allFacilities = [
    ...kos.facilities.room,
    ...kos.facilities.bathroom,
    ...kos.facilities.building,
    ...kos.facilities.parking,
  ]

  const totalFixedCost = kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalVariableCost = kos.costs.variableCosts.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/kos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{kos.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{kos.address}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-primary/10 text-primary capitalize">{kos.type}</Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {kos.rating}
              </Badge>
              <Badge variant="outline">{kos.totalRooms} kamar</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/kos?edit=${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {validation && !validation.isComplete && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Data Belum Lengkap</h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Lengkapi data berikut untuk dapat melakukan perhitungan:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
                  {validation.missingFields.map((field, i) => (
                    <li key={i}>{field}</li>
                  ))}
                </ul>
                {validation.warnings.length > 0 && (
                  <div className="mt-2 border-t border-amber-200 pt-2 dark:border-amber-800">
                    <p className="text-xs text-amber-600 dark:text-amber-400">Peringatan:</p>
                    <ul className="list-inside list-disc text-xs text-amber-600 dark:text-amber-400">
                      {validation.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href={`/kos?edit=${id}`}>
                  Lengkapi Data
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" />
            Perhitungan Cepat
          </CardTitle>
          <CardDescription>
            Hitung harga rekomendasi menggunakan parameter default
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleQuickAHP}
              disabled={!validation?.canCalculateAHP || isCalculating !== null}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              {isCalculating === 'ahp' ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Calculator className="mr-2 h-4 w-4" />
              )}
              Hitung AHP
            </Button>
            <Button
              onClick={handleQuickCBP}
              disabled={!validation?.canCalculateCBP || isCalculating !== null}
              variant="outline"
              className="border-green-500/30 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/50"
            >
              {isCalculating === 'cbp' ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              Hitung CBP
            </Button>
            <Button
              onClick={handleQuickAll}
              disabled={!validation?.canCalculateAHP || !validation?.canCalculateCBP || isCalculating !== null}
              className="bg-primary hover:bg-primary/90"
            >
              {isCalculating === 'all' ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <GitMerge className="mr-2 h-4 w-4" />
              )}
              Hitung Semua
            </Button>
            <Separator orientation="vertical" className="h-9" />
            <Button variant="ghost" asChild>
              <Link href={`/ahp?kosId=${id}`}>
                <Settings className="mr-2 h-4 w-4" />
                AHP Lanjutan
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/cbp?kosId=${id}`}>
                <Settings className="mr-2 h-4 w-4" />
                CBP Lanjutan
              </Link>
            </Button>
          </div>
          {(!validation?.canCalculateAHP || !validation?.canCalculateCBP) && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              {!validation?.canCalculateAHP && !validation?.canCalculateCBP
                ? 'Lengkapi data kos untuk mengaktifkan perhitungan'
                : !validation?.canCalculateAHP
                  ? 'Tambahkan fasilitas untuk mengaktifkan AHP'
                  : 'Tambahkan data biaya untuk mengaktifkan CBP'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga Saat Ini</p>
                <p className="text-2xl font-bold">{formatCurrency(kos.currentPrice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kamar Tersedia</p>
                <p className="text-2xl font-bold">
                  {kos.availableRooms} <span className="text-sm font-normal text-muted-foreground">/ {kos.totalRooms}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Square className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukuran Kamar</p>
                <p className="text-2xl font-bold">{kos.roomSize.width}x{kos.roomSize.length} <span className="text-sm font-normal">m</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daya Listrik</p>
                <p className="text-2xl font-bold">{kos.electricity.wattage} <span className="text-sm font-normal">Watt</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
          <TabsTrigger value="costs">Biaya</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fasilitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Kamar</p>
                  <div className="flex flex-wrap gap-2">
                    {kos.facilities.room.map((f) => (
                      <Badge key={f} variant="secondary" className="capitalize">
                        {f.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Kamar Mandi</p>
                  <div className="flex flex-wrap gap-2">
                    {kos.facilities.bathroom.map((f) => (
                      <Badge key={f} variant="secondary" className="capitalize">
                        {f.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Bangunan</p>
                  <div className="flex flex-wrap gap-2">
                    {kos.facilities.building.map((f) => (
                      <Badge key={f} variant="secondary" className="capitalize">
                        {f.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Parkir</p>
                  <div className="flex flex-wrap gap-2">
                    {kos.facilities.parking.map((f) => (
                      <Badge key={f} variant="secondary" className="capitalize">
                        {f.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kebijakan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Deposit</p>
                    <p className="font-semibold">{kos.policies.depositPercent}%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Min. Sewa</p>
                    <p className="font-semibold">{kos.policies.minStay} bulan</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Max. Sewa</p>
                    <p className="font-semibold">{kos.policies.maxStay} bulan</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">KTP</p>
                    <p className="font-semibold">{kos.policies.ktpRequired ? 'Wajib' : 'Tidak Wajib'}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  {kos.policies.coupleAllowed && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Pasutri OK</Badge>}
                  {kos.policies.petAllowed && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Pet OK</Badge>}
                  {kos.policies.vehicleAllowed && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Kendaraan OK</Badge>}
                  {!kos.policies.coupleAllowed && <Badge variant="outline" className="text-muted-foreground">No Pasutri</Badge>}
                  {!kos.policies.petAllowed && <Badge variant="outline" className="text-muted-foreground">No Pet</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Nearby Places */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lokasi Sekitar</CardTitle>
              </CardHeader>
              <CardContent>
                {kos.nearbyPlaces.length > 0 ? (
                  <div className="space-y-3">
                    {kos.nearbyPlaces.map((place, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <div>
                          <p className="font-medium">{place.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {place.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{place.distance}m</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada data lokasi sekitar</p>
                )}
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pemilik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Nama Pemilik</p>
                    <p className="font-semibold">{kos.ownerName}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Kontak</p>
                    <p className="font-semibold">{kos.ownerContact}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Review</p>
                      <p className="font-semibold">{kos.totalReviews}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Transaksi</p>
                      <p className="font-semibold">{kos.totalTransactions}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : statistics ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Occupancy Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Tingkat Okupansi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={statistics.occupancyHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statistics.revenueHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="actual" name="Aktual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="projected" name="Proyeksi" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Competitor Prices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perbandingan Harga Kompetitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                      <div>
                        <p className="font-semibold text-primary">{kos.name}</p>
                        <p className="text-xs text-muted-foreground">Kos Anda</p>
                      </div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(kos.currentPrice)}</p>
                    </div>
                    {statistics.competitorPrices.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-xs text-muted-foreground">{comp.distance}m dari kos Anda</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(comp.price)}</p>
                          <p className={`text-xs ${comp.price > kos.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                            {comp.price > kos.currentPrice ? '+' : ''}{Math.round((comp.price - kos.currentPrice) / kos.currentPrice * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Facility Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skor Fasilitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.facilityScores.map((fs, i) => (
                      <div key={i}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{fs.facility}</span>
                          <span className="font-medium">{fs.score.toFixed(1)}/5</span>
                        </div>
                        <Progress value={fs.score * 20} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Biaya Tetap (Tahunan)
                </CardTitle>
                <CardDescription>Total: {formatCurrency(totalFixedCost)}</CardDescription>
              </CardHeader>
              <CardContent>
                {kos.costs.fixedCosts.length > 0 ? (
                  <div className="space-y-3">
                    {kos.costs.fixedCosts.map((cost, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div>
                          <p className="font-medium">{cost.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {cost.category}
                          </Badge>
                        </div>
                        <p className="font-semibold">{formatCurrency(cost.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada data biaya tetap</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Biaya Variabel (Bulanan/Kamar)
                </CardTitle>
                <CardDescription>Total: {formatCurrency(totalVariableCost)}</CardDescription>
              </CardHeader>
              <CardContent>
                {kos.costs.variableCosts.length > 0 ? (
                  <div className="space-y-3">
                    {kos.costs.variableCosts.map((cost, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                        <div>
                          <p className="font-medium">{cost.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {cost.category}
                          </Badge>
                        </div>
                        <p className="font-semibold">{formatCurrency(cost.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada data biaya variabel</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Riwayat Perhitungan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : statistics && statistics.calculationHistory.length > 0 ? (
                <div className="space-y-3">
                  {statistics.calculationHistory.map((calc) => (
                    <div key={calc.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          calc.type === 'AHP' 
                            ? 'bg-primary/10 text-primary' 
                            : calc.type === 'CBP'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {calc.type === 'AHP' ? (
                            <Calculator className="h-5 w-5" />
                          ) : calc.type === 'CBP' ? (
                            <DollarSign className="h-5 w-5" />
                          ) : (
                            <GitMerge className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{calc.type}</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(calc.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{calc.result}</p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${calc.type.toLowerCase()}?resultId=${calc.id}`}>
                            Lihat Detail
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-2">Belum ada riwayat perhitungan</p>
                  <p className="text-sm">Mulai perhitungan menggunakan tombol di atas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kos?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data kos &quot;{kos.name}&quot; beserta semua riwayat perhitungan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
