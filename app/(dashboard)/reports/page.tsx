'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Building2,
  Search,
  Filter,
  Eye,
} from 'lucide-react'
import { kosApi, integrationApi } from '@/lib/api-mock'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const { data: kosList } = useQuery({
    queryKey: ['kos-list'],
    queryFn: async () => {
      const response = await kosApi.getAll()
      return response.data || []
    },
  })

  // In production, this would fetch all integration results
  // For now, we simulate with available kos data
  const reports = kosList?.map((kos) => ({
    id: kos.id,
    kosName: kos.name,
    kosAddress: kos.address,
    calculatedAt: kos.updatedAt,
    finalPrice: Math.round((Math.random() * 1500000 + 500000) / 50000) * 50000,
    status: Math.random() > 0.3 ? 'valid' : 'warning',
  }))

  const filteredReports = reports?.filter(
    (r) =>
      r.kosName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kosAddress.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    if (status === 'valid') {
      return <Badge className="bg-green-100 text-green-700">Valid</Badge>
    }
    return <Badge className="bg-amber-100 text-amber-700">Warning</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
        <p className="mt-1 text-gray-500">
          Lihat dan export hasil analisis penetapan harga
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Laporan</p>
                <p className="text-2xl font-bold text-gray-900">{reports?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hasil Valid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports?.filter((r) => r.status === 'valid').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">{reports?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-purple-100">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari laporan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Laporan</CardTitle>
          <CardDescription>
            Semua hasil analisis yang telah dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredReports || filteredReports.length === 0 ? (
            <Empty
              icon={FileText}
              title="Belum ada laporan"
              description="Lakukan integrasi AHP + CBP untuk membuat laporan"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kos</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Harga Rekomendasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.kosName}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-500">
                      {report.kosAddress}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDateTime(report.calculatedAt)}
                    </TableCell>
                    <TableCell className="font-medium text-purple-600">
                      {formatCurrency(report.finalPrice)}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.success('PDF sedang diunduh...')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.success('Link berhasil disalin!')}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription>
              Hasil analisis untuk {selectedReport?.kosName}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-center text-white">
                <p className="text-sm opacity-80">Harga Rekomendasi</p>
                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(selectedReport.finalPrice)}
                </p>
                <p className="mt-1 text-sm opacity-80">per bulan</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Nama Kos</p>
                  <p className="font-medium">{selectedReport.kosName}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Tanggal Analisis</p>
                  <p className="font-medium">{formatDateTime(selectedReport.calculatedAt)}</p>
                </div>
                <div className="rounded-lg border p-4 sm:col-span-2">
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium">{selectedReport.kosAddress}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => toast.success('PDF sedang diunduh...')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => toast.success('Link berhasil disalin!')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Bagikan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
