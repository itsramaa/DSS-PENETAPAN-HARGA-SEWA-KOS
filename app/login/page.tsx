'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await login(email, password)
    
    if (result.success) {
      toast.success('Berhasil masuk!')
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Gagal masuk')
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <Spinner className="h-8 w-8 text-purple-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-12 text-white">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">DSS Kos</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Sistem Pendukung Keputusan Penetapan Harga Sewa Kos
          </h1>
          <p className="text-lg text-purple-100 text-pretty">
            Gunakan metode AHP dan Cost-Based Pricing untuk mendapatkan rekomendasi harga sewa yang optimal berdasarkan analisis data dan preferensi Anda.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              Analytic Hierarchy Process
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              Cost-Based Pricing
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              Visualisasi Data
            </div>
          </div>
        </div>

        <p className="text-sm text-purple-200">
          &copy; 2024 DSS Kos. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6 lg:w-1/2">
        <Card className="w-full max-w-md border-purple-100 shadow-xl shadow-purple-100/20">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-200 lg:hidden">
              <Building2 className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Selamat Datang</CardTitle>
            <CardDescription className="text-gray-500">
              Masuk ke akun Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 border-purple-200 pr-10 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-11 w-11 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-purple-800"
              >
                {isSubmitting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-purple-50 p-4">
              <p className="text-center text-sm text-gray-600">
                <span className="font-medium text-purple-700">Demo Account:</span>
              </p>
              <p className="mt-1 text-center text-sm text-gray-500">
                Email: demo@kos.id | Password: demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
