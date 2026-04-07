'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'
import type { KosData, AHPResult, CBPResult } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface KosDetailStatisticsProps {
  kos: KosData
  ahpResult?: AHPResult
  cbpResult?: CBPResult
}

const CHART_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']
const FACILITY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function KosDetailStatistics({ kos, ahpResult, cbpResult }: KosDetailStatisticsProps) {
  // Cost breakdown data
  const costBreakdownData = useMemo(() => {
    const categories: Record<string, number> = {}

    kos.costs.fixedCosts.forEach(cost => {
      categories[cost.category] = (categories[cost.category] || 0) + cost.amount
    })

    kos.costs.variableCosts.forEach(cost => {
      categories[cost.category] = (categories[cost.category] || 0) + cost.amount
    })

    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: 0,
    })).map(item => ({
      ...item,
      percentage: Math.round((item.value / Object.values(categories).reduce((a, b) => a + b, 0)) * 100),
    }))
  }, [kos])

  // Facility breakdown
  const facilityData = useMemo(() => {
    const categories = {
      room: kos.facilities.room.length,
      bathroom: kos.facilities.bathroom.length,
      building: kos.facilities.building.length,
      parking: kos.facilities.parking.length,
    }

    return Object.entries(categories).map(([name, count]) => ({
      name: name === 'bathroom' ? 'Kamar Mandi' : 
            name === 'building' ? 'Gedung' :
            name === 'parking' ? 'Parkir' : 'Kamar',
      value: count,
      category: name,
    }))
  }, [kos])

  // Occupancy trend (mock data)
  const occupancyTrendData = [
    { month: 'Jan', occupancy: 65 },
    { month: 'Feb', occupancy: 72 },
    { month: 'Mar', occupancy: 78 },
    { month: 'Apr', occupancy: 85 },
    { month: 'May', occupancy: 82 },
    { month: 'Jun', occupancy: 88 },
  ]

  // Revenue projection
  const currentOccupancy = (kos.availableRooms / kos.totalRooms) * 100
  const monthlyRevenue = kos.currentPrice * (kos.totalRooms - kos.availableRooms)
  const totalMonthlyVariable = kos.costs.variableCosts.reduce((sum, c) => sum + c.amount * (kos.totalRooms - kos.availableRooms), 0)
  const monthlyProfit = monthlyRevenue - totalMonthlyVariable
  const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0

  // ROI calculation
  const totalFixedCost = kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0)
  const estimatedYearlyProfit = monthlyProfit * 12
  const roi = totalFixedCost > 0 ? (estimatedYearlyProfit / totalFixedCost) * 100 : 0

  // Price positioning (mock comparison data)
  const marketData = [
    { price: 600000, market: 'Pasar Bawah', distance: 500 },
    { price: 750000, market: 'Pasar Rata-rata', distance: 1200 },
    { price: kos.currentPrice, market: 'Kos Anda', distance: 0, highlight: true },
    { price: 950000, market: 'Pasar Atas', distance: 1500 },
  ]

  return (
    <Tabs defaultValue="cost" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="cost">Biaya</TabsTrigger>
        <TabsTrigger value="occupancy">Okupansi</TabsTrigger>
        <TabsTrigger value="facilities">Fasilitas</TabsTrigger>
        <TabsTrigger value="pricing">Harga</TabsTrigger>
      </TabsList>

      {/* Cost Analysis Tab */}
      <TabsContent value="cost" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cost Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Breakdown Biaya</CardTitle>
              <CardDescription>
                Distribusi biaya berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdownData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Biaya</CardTitle>
              <CardDescription>
                Total biaya operasional per bulan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Biaya Tetap</span>
                  <span className="font-semibold">
                    {formatCurrency(kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0) / 12)}
                  </span>
                </div>
                <Progress
                  value={
                    (kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0) /
                      (kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0) +
                        totalMonthlyVariable)) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Biaya Variabel (per bulan)</span>
                  <span className="font-semibold">
                    {formatCurrency(totalMonthlyVariable)}
                  </span>
                </div>
                <Progress
                  value={
                    (totalMonthlyVariable /
                      (kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0) / 12 +
                        totalMonthlyVariable)) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Total Biaya Bulanan</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(kos.costs.fixedCosts.reduce((sum, c) => sum + c.amount, 0) / 12 + totalMonthlyVariable)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                    <p className="text-xs text-muted-foreground">Pendapatan Bulanan</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(monthlyRevenue)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
                    <p className="text-xs text-muted-foreground">Keuntungan Bulanan</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(monthlyProfit)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cost List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detail Biaya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Biaya Tetap</h4>
              <div className="space-y-2">
                {kos.costs.fixedCosts.map((cost, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{cost.name}</span>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(cost.amount)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Biaya Variabel (per bulan per kamar)</h4>
              <div className="space-y-2">
                {kos.costs.variableCosts.map((cost, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{cost.name}</span>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(cost.amount)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Occupancy Analysis Tab */}
      <TabsContent value="occupancy" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Okupansi Saat Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kamar Terisi</p>
                  <p className="text-3xl font-bold">
                    {kos.totalRooms - kos.availableRooms}/{kos.totalRooms}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tingkat Okupansi</p>
                  <p className="text-3xl font-bold text-primary">
                    {(((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Kapasitas</span>
                  <span className="text-sm text-muted-foreground">
                    {kos.availableRooms} kamar tersedia
                  </span>
                </div>
                <Progress
                  value={(((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100)}
                  className="h-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Status
                  </p>
                  <Badge variant={currentOccupancy > 80 ? 'default' : currentOccupancy > 50 ? 'secondary' : 'outline'}>
                    {currentOccupancy > 80 ? 'Tinggi' : currentOccupancy > 50 ? 'Sedang' : 'Rendah'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pendapatan Bulanan</p>
                  <p className="font-bold">{formatCurrency(monthlyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tren Okupansi</CardTitle>
              <CardDescription>
                Rata-rata 6 bulan terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={occupancyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Ocupansi (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Facilities Tab */}
      <TabsContent value="facilities" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Fasilitas</CardTitle>
            <CardDescription>
              Total {kos.facilities.room.length + kos.facilities.bathroom.length + kos.facilities.building.length + kos.facilities.parking.length} fasilitas tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8b5cf6" name="Jumlah Fasilitas" radius={[8, 8, 0, 0]}>
                  {facilityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={FACILITY_COLORS[index % FACILITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Facilities */}
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { title: 'Kamar', facilities: kos.facilities.room, icon: '🛏️' },
            { title: 'Kamar Mandi', facilities: kos.facilities.bathroom, icon: '🚿' },
            { title: 'Gedung', facilities: kos.facilities.building, icon: '🏢' },
            { title: 'Parkir', facilities: kos.facilities.parking, icon: '🚗' },
          ].map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {section.facilities.map((facility) => (
                    <Badge key={facility} variant="secondary" className="capitalize">
                      {facility.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Pricing Tab */}
      <TabsContent value="pricing" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Price Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posisi Harga di Pasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketData.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-3 ${item.highlight ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.market}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.distance > 0 ? `${item.distance}m jauhnya` : 'Kos Anda'}
                      </p>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                  </div>
                  {item.highlight && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                      <Badge variant="default" className="text-xs">Harga Anda</Badge>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Profitability Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metrik Profitabilitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Margin Keuntungan
                  </span>
                  <span className="font-bold text-green-600">{profitMargin.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(profitMargin, 100)} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    ROI (Tahunan)
                  </span>
                  <span className="font-bold text-amber-600">{roi.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(roi / 10, 100)} className="h-2" />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Proyeksi Keuntungan Tahunan</p>
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-4">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(estimatedYearlyProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Berdasarkan okupansi {(((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100).toFixed(0)}% dan harga {formatCurrency(kos.currentPrice)}/bulan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
