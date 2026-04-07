'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, Calculator, DollarSign, TrendingUp, ArrowRight, BarChart3, PieChart } from 'lucide-react'
import Link from 'next/link'
import { dashboardApi, kosApi, integrationApi } from '@/lib/api-mock'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'

export default function DashboardPage() {
  const { user } = useAuth()
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats()
      return response.data
    },
  })

  const { data: kosList, isLoading: kosLoading } = useQuery({
    queryKey: ['kos-list'],
    queryFn: async () => {
      const response = await kosApi.getAll()
      return response.data || []
    },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Selamat datang kembali, {user?.name}! Berikut adalah ringkasan aktivitas Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Kos"
          value={statsLoading ? undefined : stats?.totalKos || 0}
          description="Data kos yang tersimpan"
          icon={Building2}
          color="purple"
        />
        <StatsCard
          title="Total Kalkulasi"
          value={statsLoading ? undefined : stats?.totalCalculations || 0}
          description="Perhitungan yang dilakukan"
          icon={Calculator}
          color="blue"
        />
        <StatsCard
          title="Rata-rata Harga"
          value={statsLoading ? undefined : formatCurrency(stats?.averagePrice || 0)}
          description="Dari rekomendasi harga"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Konsistensi AHP"
          value={statsLoading ? undefined : `${(stats?.consistentAHPRate || 0).toFixed(1)}%`}
          description="Hasil yang konsisten"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg">Mulai Analisis</CardTitle>
          <CardDescription>
            Pilih langkah untuk memulai analisis penetapan harga kos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Input Data Kos"
              description="Tambah atau edit data kos"
              href="/kos"
              icon={Building2}
            />
            <QuickActionCard
              title="Kalkulator AHP"
              description="Hitung bobot kriteria"
              href="/ahp"
              icon={PieChart}
            />
            <QuickActionCard
              title="Kalkulator CBP"
              description="Hitung harga berdasarkan biaya"
              href="/cbp"
              icon={DollarSign}
            />
            <QuickActionCard
              title="Integrasi & Laporan"
              description="Lihat hasil akhir"
              href="/integration"
              icon={BarChart3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Kos */}
      <Card className="border-purple-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Data Kos Terbaru</CardTitle>
            <CardDescription>Daftar kos yang baru ditambahkan</CardDescription>
          </div>
          <Button asChild variant="ghost" className="text-purple-600 hover:text-purple-700">
            <Link href="/kos">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {kosLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : kosList && kosList.length > 0 ? (
            <div className="space-y-3">
              {kosList.slice(0, 5).map((kos) => (
                <div
                  key={kos.id}
                  className="flex items-center justify-between rounded-lg border border-purple-100 bg-white p-4 transition-colors hover:bg-purple-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{kos.name}</p>
                      <p className="text-sm text-gray-500">{kos.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {kos.totalRooms} Kamar
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <p className="mt-4 font-medium text-gray-900">Belum ada data kos</p>
              <p className="mt-1 text-sm text-gray-500">
                Mulai dengan menambahkan data kos pertama Anda
              </p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Link href="/kos">
                  Tambah Data Kos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string | number | undefined
  description: string
  icon: React.ElementType
  color: 'purple' | 'blue' | 'green' | 'orange'
}

function StatsCard({ title, value, description, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <Card className="border-purple-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {value === undefined ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  href: string
  icon: React.ElementType
}

function QuickActionCard({ title, description, href, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-purple-100 bg-white p-5 transition-all hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm transition-transform group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-3 flex items-center text-sm font-medium text-purple-600">
        Mulai
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
