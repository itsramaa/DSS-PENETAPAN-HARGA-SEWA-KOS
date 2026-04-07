'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  MoreHorizontal,
  Calendar,
  Activity,
} from 'lucide-react'
import { apiKeyApi } from '@/lib/api-mock'
import type { ApiKey } from '@/types'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldGroup, Field, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

const AVAILABLE_PERMISSIONS = [
  { id: 'read:kos', label: 'Baca Data Kos', description: 'Akses untuk membaca data kos' },
  { id: 'write:kos', label: 'Tulis Data Kos', description: 'Akses untuk menambah/edit data kos' },
  { id: 'read:ahp', label: 'Baca Hasil AHP', description: 'Akses untuk membaca hasil perhitungan AHP' },
  { id: 'write:ahp', label: 'Hitung AHP', description: 'Akses untuk melakukan perhitungan AHP' },
  { id: 'read:cbp', label: 'Baca Hasil CBP', description: 'Akses untuk membaca hasil perhitungan CBP' },
  { id: 'write:cbp', label: 'Hitung CBP', description: 'Akses untuk melakukan perhitungan CBP' },
  { id: 'read:integration', label: 'Baca Integrasi', description: 'Akses untuk membaca hasil integrasi' },
  { id: 'write:integration', label: 'Hitung Integrasi', description: 'Akses untuk melakukan integrasi' },
]

export default function ApiKeysPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await apiKeyApi.getAll()
      return response.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async ({ name, permissions }: { name: string; permissions: string[] }) => {
      const response = await apiKeyApi.create(name, permissions)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      if (data) {
        setNewlyCreatedKey(data.key)
      }
      toast.success('API Key berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiKeyApi.revoke(id)
      if (!response.success) throw new Error(response.error?.message)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API Key berhasil direvoke')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiKeyApi.delete(id)
      if (!response.success) throw new Error(response.error?.message)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API Key berhasil dihapus')
      setDeleteId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      toast.error('Nama API Key harus diisi')
      return
    }
    if (selectedPermissions.length === 0) {
      toast.error('Pilih minimal satu permission')
      return
    }
    createMutation.mutate({
      name: newKeyName,
      permissions: selectedPermissions,
    })
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API Key berhasil disalin!')
  }

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    )
  }

  const resetCreateForm = () => {
    setNewKeyName('')
    setSelectedPermissions([])
    setNewlyCreatedKey(null)
  }

  const activeKeys = apiKeys?.filter((k) => k.isActive).length || 0
  const revokedKeys = apiKeys?.filter((k) => !k.isActive).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-1 text-gray-500">
            Kelola API Key untuk integrasi dengan sistem eksternal
          </p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open)
            if (!open) resetCreateForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate API Key Baru</DialogTitle>
              <DialogDescription>
                Buat API Key untuk mengakses DSS Kos API
              </DialogDescription>
            </DialogHeader>
            
            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-medium">API Key Berhasil Dibuat!</p>
                  </div>
                </div>
                
                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="flex items-start gap-2 text-amber-700">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">
                      Simpan API Key ini dengan aman. Anda tidak akan bisa melihatnya lagi setelah menutup dialog ini.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel>API Key</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={newlyCreatedKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyKey(newlyCreatedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetCreateForm()
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Selesai
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="keyName">Nama API Key</FieldLabel>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Contoh: Integrasi Web Utama"
                    />
                  </Field>
                </FieldGroup>

                <FieldSet>
                  <FieldLegend>Permissions</FieldLegend>
                  <div className="mt-2 space-y-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          selectedPermissions.includes(perm.id)
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{perm.label}</p>
                          <p className="text-xs text-gray-500">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </FieldSet>

                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Generate Key
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Penggunaan API Key</h3>
            <p className="mt-1 text-sm text-gray-600">
              Sertakan API Key pada header request:{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                X-API-Key: your_api_key_here
              </code>
              . API Key digunakan untuk autentikasi dan otorisasi akses ke endpoint API.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total API Keys</p>
                <p className="text-2xl font-bold text-gray-900">{apiKeys?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{activeKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revoked</p>
                <p className="text-2xl font-bold text-gray-900">{revokedKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg">Daftar API Keys</CardTitle>
          <CardDescription>
            Kelola semua API Key yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <Empty
              icon={Key}
              title="Belum ada API Key"
              description="Generate API Key pertama untuk memulai integrasi"
            >
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate API Key
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                          {revealedKeys.has(apiKey.id) ? apiKey.key : apiKey.maskedKey}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleReveal(apiKey.id)}
                        >
                          {revealedKeys.has(apiKey.id) ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.slice(0, 2).map((perm) => (
                          <Badge
                            key={perm}
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 text-xs"
                          >
                            {perm}
                          </Badge>
                        ))}
                        {apiKey.permissions.length > 2 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                            +{apiKey.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {apiKey.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                          Revoked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(apiKey.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {apiKey.isActive && (
                            <DropdownMenuItem
                              onClick={() => revokeMutation.mutate(apiKey.id)}
                              className="text-amber-600"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Revoke
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setDeleteId(apiKey.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. API Key akan dihapus secara permanen
              dan tidak dapat digunakan lagi.
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
