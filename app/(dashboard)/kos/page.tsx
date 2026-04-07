'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  DoorOpen,
  Square,
  Eye,
} from 'lucide-react'
import { kosApi } from '@/lib/api-mock'
import type { KosData, Facility, FixedCost, VariableCost, DEFAULT_FACILITIES } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { toast } from 'sonner'
import { KosForm } from '@/components/kos-form'

export default function KosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingKos, setEditingKos] = useState<KosData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: kosList, isLoading } = useQuery({
    queryKey: ['kos-list'],
    queryFn: async () => {
      const response = await kosApi.getAll()
      return response.data || []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await kosApi.delete(id)
      if (!response.success) throw new Error(response.error?.message)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kos-list'] })
      toast.success('Data kos berhasil dihapus')
      setDeleteId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const filteredKos = kosList?.filter(
    (kos) =>
      kos.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kos.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Kos</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Kelola data kos untuk analisis penetapan harga
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Data Kos Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi kos, biaya, dan fasilitas
              </DialogDescription>
            </DialogHeader>
            <KosForm
              onSuccess={() => {
                setIsCreateOpen(false)
                queryClient.invalidateQueries({ queryKey: ['kos-list'] })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Cari kos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kos List */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-purple-100">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <div className="mt-4 flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredKos && filteredKos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredKos.map((kos) => (
            <Card
              key={kos.id}
              className="group border-purple-100 transition-all hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 dark:border-purple-900/30 dark:hover:border-purple-700 dark:hover:shadow-purple-950/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white dark:from-purple-600 dark:to-purple-800">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate dark:text-gray-100">{kos.name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/kos/${kos.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingKos(kos)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(kos.id)}
                          className="text-red-600 focus:text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{kos.address}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <DoorOpen className="h-4 w-4" />
                    <span>{kos.totalRooms} kamar</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <Square className="h-4 w-4" />
                    <span>{kos.roomSize.width}x{kos.roomSize.length} m</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const allFacilities = [
                      ...kos.facilities.room,
                      ...kos.facilities.bathroom,
                      ...kos.facilities.building,
                      ...kos.facilities.parking,
                    ]
                    return (
                      <>
                        {allFacilities.slice(0, 4).map((facility) => (
                          <Badge
                            key={facility}
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 capitalize"
                          >
                            {facility.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {allFacilities.length > 4 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            +{allFacilities.length - 4}
                          </Badge>
                        )}
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-purple-100">
          <CardContent className="py-16">
            <Empty
              icon={Building2}
              title="Belum ada data kos"
              description="Mulai dengan menambahkan data kos pertama Anda untuk analisis harga"
            >
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kos
              </Button>
            </Empty>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingKos} onOpenChange={(open) => !open && setEditingKos(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Kos</DialogTitle>
            <DialogDescription>
              Perbarui informasi kos, biaya, dan fasilitas
            </DialogDescription>
          </DialogHeader>
          {editingKos && (
            <KosForm
              initialData={editingKos}
              onSuccess={() => {
                setEditingKos(null)
                queryClient.invalidateQueries({ queryKey: ['kos-list'] })
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kos?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data kos dan semua perhitungan
              terkait akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
