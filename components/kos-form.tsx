'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { kosApi } from '@/lib/api-mock'
import type { KosData, Facility, FixedCost, VariableCost } from '@/types'
import { DEFAULT_FACILITIES } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldGroup, Field, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface KosFormProps {
  initialData?: KosData
  onSuccess?: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export function KosForm({ initialData, onSuccess }: KosFormProps) {
  const isEditing = !!initialData

  // Basic Info
  const [name, setName] = useState(initialData?.name || '')
  const [address, setAddress] = useState(initialData?.address || '')
  const [totalRooms, setTotalRooms] = useState(initialData?.totalRooms?.toString() || '')
  const [roomSize, setRoomSize] = useState(initialData?.roomSize?.toString() || '')

  // Facilities
  const [facilities, setFacilities] = useState<Facility[]>(
    initialData?.facilities ||
      DEFAULT_FACILITIES.map((f) => ({
        id: generateId(),
        ...f,
        available: false,
      }))
  )

  // Costs
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(
    initialData?.costs.fixedCosts || [
      { id: generateId(), name: '', amount: 0, category: 'building' },
    ]
  )
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>(
    initialData?.costs.variableCosts || [
      { id: generateId(), name: '', amount: 0, category: 'utilities' },
    ]
  )

  const createMutation = useMutation({
    mutationFn: async (data: Omit<KosData, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await kosApi.create(data)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Data kos berhasil ditambahkan')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<KosData> }) => {
      const response = await kosApi.update(id, data)
      if (!response.success) throw new Error(response.error?.message)
      return response.data
    },
    onSuccess: () => {
      toast.success('Data kos berhasil diperbarui')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const kosData = {
      name,
      address,
      totalRooms: parseInt(totalRooms) || 0,
      roomSize: parseInt(roomSize) || 0,
      facilities,
      costs: {
        fixedCosts: fixedCosts.filter((c) => c.name && c.amount > 0),
        variableCosts: variableCosts.filter((c) => c.name && c.amount > 0),
      },
    }

    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: kosData })
    } else {
      createMutation.mutate(kosData)
    }
  }

  const toggleFacility = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, available: !f.available } : f))
    )
  }

  const addFixedCost = () => {
    setFixedCosts((prev) => [
      ...prev,
      { id: generateId(), name: '', amount: 0, category: 'building' },
    ])
  }

  const removeFixedCost = (id: string) => {
    setFixedCosts((prev) => prev.filter((c) => c.id !== id))
  }

  const updateFixedCost = (id: string, field: keyof FixedCost, value: string | number) => {
    setFixedCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const addVariableCost = () => {
    setVariableCosts((prev) => [
      ...prev,
      { id: generateId(), name: '', amount: 0, category: 'utilities' },
    ])
  }

  const removeVariableCost = (id: string) => {
    setVariableCosts((prev) => prev.filter((c) => c.id !== id))
  }

  const updateVariableCost = (id: string, field: keyof VariableCost, value: string | number) => {
    setVariableCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info Dasar</TabsTrigger>
          <TabsTrigger value="facilities">Fasilitas</TabsTrigger>
          <TabsTrigger value="costs">Biaya</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="info" className="mt-4 space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama Kos</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kos Mawar Indah"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Alamat</FieldLabel>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap kos"
                rows={2}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="totalRooms">Jumlah Kamar</FieldLabel>
                <Input
                  id="totalRooms"
                  type="number"
                  min="1"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(e.target.value)}
                  placeholder="10"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="roomSize">Ukuran Kamar (m²)</FieldLabel>
                <Input
                  id="roomSize"
                  type="number"
                  min="1"
                  value={roomSize}
                  onChange={(e) => setRoomSize(e.target.value)}
                  placeholder="12"
                  required
                />
              </Field>
            </div>
          </FieldGroup>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="mt-4">
          <FieldSet>
            <FieldLegend>Pilih Fasilitas yang Tersedia</FieldLegend>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    facility.available
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={facility.available}
                    onCheckedChange={() => toggleFacility(facility.id)}
                  />
                  <span className="text-sm font-medium text-gray-700">{facility.name}</span>
                </label>
              ))}
            </div>
          </FieldSet>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="mt-4 space-y-6">
          {/* Fixed Costs */}
          <FieldSet>
            <FieldLegend>Biaya Tetap (Tahunan)</FieldLegend>
            <p className="mb-3 text-sm text-gray-500">
              Biaya yang tidak berubah terlepas dari tingkat okupansi
            </p>
            <div className="space-y-3">
              {fixedCosts.map((cost, index) => (
                <div key={cost.id} className="flex items-end gap-2">
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`fixed-name-${index}`}>Nama Biaya</FieldLabel>
                    <Input
                      id={`fixed-name-${index}`}
                      value={cost.name}
                      onChange={(e) => updateFixedCost(cost.id, 'name', e.target.value)}
                      placeholder="Contoh: Pajak Bangunan"
                    />
                  </Field>
                  <Field className="w-40">
                    <FieldLabel htmlFor={`fixed-amount-${index}`}>Jumlah (Rp)</FieldLabel>
                    <Input
                      id={`fixed-amount-${index}`}
                      type="number"
                      min="0"
                      value={cost.amount || ''}
                      onChange={(e) =>
                        updateFixedCost(cost.id, 'amount', parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </Field>
                  <Field className="w-36">
                    <FieldLabel htmlFor={`fixed-cat-${index}`}>Kategori</FieldLabel>
                    <Select
                      value={cost.category}
                      onValueChange={(v) => updateFixedCost(cost.id, 'category', v)}
                    >
                      <SelectTrigger id={`fixed-cat-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="building">Bangunan</SelectItem>
                        <SelectItem value="equipment">Peralatan</SelectItem>
                        <SelectItem value="license">Izin</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFixedCost(cost.id)}
                    className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    disabled={fixedCosts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFixedCost}
                className="w-full border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Biaya Tetap
              </Button>
            </div>
          </FieldSet>

          {/* Variable Costs */}
          <FieldSet>
            <FieldLegend>Biaya Variabel (Bulanan per Kamar)</FieldLegend>
            <p className="mb-3 text-sm text-gray-500">
              Biaya yang bervariasi berdasarkan penggunaan
            </p>
            <div className="space-y-3">
              {variableCosts.map((cost, index) => (
                <div key={cost.id} className="flex items-end gap-2">
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`var-name-${index}`}>Nama Biaya</FieldLabel>
                    <Input
                      id={`var-name-${index}`}
                      value={cost.name}
                      onChange={(e) => updateVariableCost(cost.id, 'name', e.target.value)}
                      placeholder="Contoh: Listrik"
                    />
                  </Field>
                  <Field className="w-40">
                    <FieldLabel htmlFor={`var-amount-${index}`}>Jumlah (Rp)</FieldLabel>
                    <Input
                      id={`var-amount-${index}`}
                      type="number"
                      min="0"
                      value={cost.amount || ''}
                      onChange={(e) =>
                        updateVariableCost(cost.id, 'amount', parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </Field>
                  <Field className="w-36">
                    <FieldLabel htmlFor={`var-cat-${index}`}>Kategori</FieldLabel>
                    <Select
                      value={cost.category}
                      onValueChange={(v) => updateVariableCost(cost.id, 'category', v)}
                    >
                      <SelectTrigger id={`var-cat-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilities">Utilitas</SelectItem>
                        <SelectItem value="maintenance">Perawatan</SelectItem>
                        <SelectItem value="service">Layanan</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariableCost(cost.id)}
                    className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    disabled={variableCosts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addVariableCost}
                className="w-full border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Biaya Variabel
              </Button>
            </div>
          </FieldSet>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Menyimpan...
            </>
          ) : isEditing ? (
            'Perbarui Data'
          ) : (
            'Simpan Data'
          )}
        </Button>
      </div>
    </form>
  )
}
