'use client'

import { useState } from 'react'
import { Settings, User, Bell, Shield, Database, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [notifications, setNotifications] = useState({
    email: true,
    calculation: true,
    reports: false,
  })

  const handleSaveProfile = () => {
    toast.success('Profil berhasil disimpan')
  }

  const handleSaveNotifications = () => {
    toast.success('Pengaturan notifikasi berhasil disimpan')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
        <p className="mt-1 text-gray-500">
          Kelola akun dan preferensi aplikasi Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Profil</CardTitle>
              <CardDescription>
                Perbarui informasi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Input
                    value={user?.role === 'owner' ? 'Pemilik Kos' : 'Admin'}
                    disabled
                    className="bg-gray-50"
                  />
                </Field>
              </FieldGroup>

              <Button
                onClick={handleSaveProfile}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Preferensi Notifikasi</CardTitle>
              <CardDescription>
                Atur notifikasi yang ingin Anda terima
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-gray-900">Notifikasi Email</p>
                    <p className="text-sm text-gray-500">
                      Terima notifikasi melalui email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-gray-900">Hasil Perhitungan</p>
                    <p className="text-sm text-gray-500">
                      Notifikasi saat perhitungan selesai
                    </p>
                  </div>
                  <Switch
                    checked={notifications.calculation}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, calculation: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-gray-900">Laporan Mingguan</p>
                    <p className="text-sm text-gray-500">
                      Ringkasan aktivitas setiap minggu
                    </p>
                  </div>
                  <Switch
                    checked={notifications.reports}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, reports: checked }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan Preferensi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Keamanan Akun</CardTitle>
              <CardDescription>
                Kelola password dan keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentPassword">Password Saat Ini</FieldLabel>
                  <Input id="currentPassword" type="password" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="newPassword">Password Baru</FieldLabel>
                  <Input id="newPassword" type="password" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Konfirmasi Password</FieldLabel>
                  <Input id="confirmPassword" type="password" />
                </Field>
              </FieldGroup>

              <Button
                onClick={() => toast.success('Password berhasil diubah')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Shield className="mr-2 h-4 w-4" />
                Ubah Password
              </Button>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900">Sesi Aktif</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Kelola perangkat yang sedang login ke akun Anda
                </p>
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Browser Saat Ini</p>
                      <p className="text-sm text-gray-500">Aktif sekarang</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg">Manajemen Data</CardTitle>
              <CardDescription>
                Export atau hapus data Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Export Data</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Download semua data kos dan hasil perhitungan dalam format JSON
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => toast.success('Data sedang disiapkan untuk diunduh')}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Export Semua Data
                </Button>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-medium text-red-900">Zona Berbahaya</h4>
                <p className="mt-1 text-sm text-red-700">
                  Hapus semua data secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-red-300 text-red-600 hover:bg-red-100"
                  onClick={() => toast.error('Fitur ini dinonaktifkan untuk keamanan')}
                >
                  Hapus Semua Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
