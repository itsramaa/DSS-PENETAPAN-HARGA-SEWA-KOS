'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { KosData, DetailedReportData, IntegrationResult } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

interface DetailedReportViewProps {
  kos: KosData
  integrationResult?: IntegrationResult
  onExport?: (format: 'pdf' | 'json') => void
  onShare?: () => void
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export function DetailedReportView({
  kos,
  integrationResult,
  onExport,
  onShare,
}: DetailedReportViewProps) {
  // Generate detailed report data
  const reportData = useMemo((): DetailedReportData => {
    const fixedTotal = kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0)
    const variableTotal = kos.costs.variableCosts.reduce((sum, c) => sum + c.amount, 0)
    const monthlyVariable = (variableTotal / 12) * (kos.totalRooms - kos.availableRooms)
    const revenue = kos.currentPrice * (kos.totalRooms - kos.availableRooms)
    const profit = revenue - monthlyVariable
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    return {
      kosId: kos.id,
      kosName: kos.name,
      period: {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      metrics: {
        occupancyRate: ((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100,
        revenue,
        costBreakdown: {
          fixed: fixedTotal / 12,
          variable: monthlyVariable,
        },
        roi: fixedTotal > 0 ? (profit * 12 / fixedTotal) * 100 : 0,
        margin,
      },
      comparison: {
        marketAverage: 800000,
        competitorAverage: 850000,
        yourPrice: kos.currentPrice,
        pricingStrategy: kos.currentPrice < 800000 ? 'below' : kos.currentPrice > 850000 ? 'above' : 'equal',
      },
      ahpAnalysis: {
        topCriteria: [
          { name: 'Lokasi', weight: 0.35 },
          { name: 'Fasilitas', weight: 0.25 },
          { name: 'Keamanan', weight: 0.20 },
          { name: 'Kondisi', weight: 0.15 },
          { name: 'Aksesibilitas', weight: 0.05 },
        ],
        consistencyScore: 0.92,
      },
      cbpAnalysis: {
        floorPrice: fixedTotal / 12 + monthlyVariable,
        recommendedPrice: Math.round((fixedTotal / 12 + monthlyVariable + profit * 0.5) / 50000) * 50000,
        profitMargin: margin,
      },
    }
  }, [kos])

  // Generate trend data
  const trendData = [
    { month: 'Jan', revenue: reportData.metrics.revenue * 0.85, profit: reportData.metrics.revenue * 0.85 - reportData.metrics.costBreakdown.variable * 0.8 },
    { month: 'Feb', revenue: reportData.metrics.revenue * 0.88, profit: reportData.metrics.revenue * 0.88 - reportData.metrics.costBreakdown.variable * 0.82 },
    { month: 'Mar', revenue: reportData.metrics.revenue * 0.92, profit: reportData.metrics.revenue * 0.92 - reportData.metrics.costBreakdown.variable * 0.85 },
    { month: 'Apr', revenue: reportData.metrics.revenue * 0.95, profit: reportData.metrics.revenue * 0.95 - reportData.metrics.costBreakdown.variable * 0.88 },
    { month: 'May', revenue: reportData.metrics.revenue * 0.98, profit: reportData.metrics.revenue * 0.98 - reportData.metrics.costBreakdown.variable * 0.90 },
    { month: 'Jun', revenue: reportData.metrics.revenue, profit: reportData.metrics.revenue - reportData.metrics.costBreakdown.variable },
  ]

  // Generate insights
  const insights = useMemo(() => {
    const insights = []

    // Pricing strategy
    if (reportData.comparison.pricingStrategy === 'below') {
      insights.push({
        title: 'Harga Kompetitif',
        description: 'Harga Anda di bawah rata-rata pasar, memposisikan kos Anda sebagai pilihan nilai terbaik',
        type: 'positive' as const,
      })
    } else if (reportData.comparison.pricingStrategy === 'above') {
      insights.push({
        title: 'Harga Premium',
        description: 'Harga Anda di atas rata-rata pasar. Pastikan fasilitas dan kondisi mendukung positioning ini',
        type: 'warning' as const,
      })
    }

    // Occupancy
    if (reportData.metrics.occupancyRate >= 90) {
      insights.push({
        title: 'Tingkat Okupansi Tinggi',
        description: 'Kos Anda mencapai 90% atau lebih - pertimbangkan kenaikan harga',
        type: 'positive' as const,
      })
    } else if (reportData.metrics.occupancyRate < 70) {
      insights.push({
        title: 'Okupansi Rendah',
        description: 'Tingkat okupansi di bawah 70% - pertimbangkan penurunan harga atau peningkatan fasilitas',
        type: 'warning' as const,
      })
    }

    // Margin
    if (reportData.metrics.margin < 30) {
      insights.push({
        title: 'Margin Keuntungan Rendah',
        description: 'Margin keuntungan di bawah 30% - tinjau kembali struktur biaya operasional',
        type: 'warning' as const,
      })
    }

    // Facility count
    const facilityCount = Object.values(kos.facilities).reduce((sum, arr) => sum + arr.length, 0)
    if (facilityCount >= 15) {
      insights.push({
        title: 'Fasilitas Lengkap',
        description: 'Fasilitas Anda tergolong lengkap - gunakan ini sebagai keunggulan kompetitif dalam promosi',
        type: 'positive' as const,
      })
    }

    return insights
  }, [kos, reportData])

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = []

    if (reportData.metrics.occupancyRate < 80) {
      recs.push('Tingkatkan strategi pemasaran untuk menarik lebih banyak penyewa')
    }

    if (reportData.metrics.margin < 35) {
      recs.push('Analisis dan optimalkan biaya operasional bulanan')
    }

    if (reportData.comparison.pricingStrategy === 'above' && reportData.metrics.occupancyRate < 85) {
      recs.push('Pertimbangkan penyesuaian harga atau peningkatan nilai proposisi')
    }

    if (integrationResult?.ahpResult?.consistencyRatio > 0.1) {
      recs.push('Review penilaian kriteria AHP untuk konsistensi yang lebih baik')
    }

    recs.push('Lakukan survei kepuasan penyewa secara berkala')
    recs.push('Rencanakan perawatan preventif untuk menjaga kondisi bangunan')

    return recs
  }, [kos, reportData, integrationResult])

  const costBreakdownData = Object.entries(reportData.metrics.costBreakdown).map(([name, value]) => ({
    name: name === 'fixed' ? 'Biaya Tetap' : 'Biaya Variabel',
    value,
  }))

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{kos.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Periode: {new Date(reportData.period.startDate).toLocaleDateString('id-ID')} - {new Date(reportData.period.endDate).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Bagikan
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Eksekutif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pendapatan Bulanan</p>
              <p className="text-2xl font-bold">{formatCurrency(reportData.metrics.revenue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tingkat Okupansi</p>
              <p className="text-2xl font-bold">{reportData.metrics.occupancyRate.toFixed(1)}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Margin Keuntungan</p>
              <p className="text-2xl font-bold text-green-600">{reportData.metrics.margin.toFixed(1)}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">ROI Tahunan</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.metrics.roi.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analisis</TabsTrigger>
          <TabsTrigger value="pricing">Harga</TabsTrigger>
          <TabsTrigger value="insights">Wawasan</TabsTrigger>
          <TabsTrigger value="recommendations">Rekomendasi</TabsTrigger>
        </TabsList>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue & Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tren Pendapatan & Keuntungan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Pendapatan" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" name="Keuntungan" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribusi Biaya</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${formatCurrency(value as number)}`}
                      outerRadius={100}
                      fill="#8b5cf6"
                      dataKey="value"
                    >
                      {costBreakdownData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metrik Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Biaya Tetap Bulanan</span>
                    <Badge variant="outline">{formatCurrency(reportData.metrics.costBreakdown.fixed)}</Badge>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Biaya Variabel Bulanan</span>
                    <Badge variant="outline">{formatCurrency(reportData.metrics.costBreakdown.variable)}</Badge>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Keuntungan Bersih</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {formatCurrency(reportData.metrics.revenue - reportData.metrics.costBreakdown.variable - reportData.metrics.costBreakdown.fixed)}
                    </Badge>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analisis Posisi Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">Harga Anda</p>
                      <p className="text-sm text-muted-foreground mt-1">Harga yang Anda tetapkan saat ini</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(reportData.comparison.yourPrice)}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Rata-rata Pasar</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                      {formatCurrency(reportData.comparison.marketAverage)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                      {reportData.comparison.yourPrice < reportData.comparison.marketAverage ? '↓' : '↑'} {Math.abs(reportData.comparison.yourPrice - reportData.comparison.marketAverage)} dari rata-rata
                    </p>
                  </div>

                  <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-4">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Pesaing Terdekat</p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mt-1">
                      {formatCurrency(reportData.comparison.competitorAverage)}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-2">
                      {reportData.comparison.yourPrice < reportData.comparison.competitorAverage ? '↓' : '↑'} {Math.abs(reportData.comparison.yourPrice - reportData.comparison.competitorAverage)} dari kompetitor
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Analisis CBP</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Harga Dasar (Floor Price)</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(reportData.cbpAnalysis.floorPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Harga Rekomendasi</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(reportData.cbpAnalysis.recommendedPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.map((insight, idx) => (
            <Card key={idx} className={insight.type === 'positive' ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30' : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${insight.type === 'positive' ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {insight.type === 'positive' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${insight.type === 'positive' ? 'text-green-900 dark:text-green-100' : 'text-amber-900 dark:text-amber-100'}`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${insight.type === 'positive' ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Rekomendasi Tindakan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm">{rec}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
