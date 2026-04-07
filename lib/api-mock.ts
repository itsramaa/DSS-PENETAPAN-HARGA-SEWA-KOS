// =============================================
// DSS Kos - Mock API Service
// This simulates backend responses for development
// Replace with actual API calls in production
// =============================================

import type {
  User,
  KosData,
  AHPResult,
  CBPResult,
  IntegrationResult,
  ApiKey,
  DashboardStats,
  AHPInput,
  CBPInput,
  ApiResponse,
  DEFAULT_AHP_CRITERIA,
} from '@/types'

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data storage - Initialize with dummy data based on real kos listings
let mockKosData: KosData[] = [
  {
    id: 'kos-001',
    name: 'Kost Bhamakerti Tipe A',
    address: 'Cikarang Barat, Bekasi',
    type: 'campur',
    totalRooms: 10,
    availableRooms: 3,
    roomSize: { width: 3, length: 3 },
    currentPrice: 900000,
    ownerName: 'Danang Aris Budiyanto',
    ownerContact: '081234567890',
    rating: 5.0,
    totalReviews: 1,
    totalTransactions: 6,
    facilities: {
      room: ['ventilasi', 'jendela', 'dapur_pribadi', 'wastafel', 'exhaust_fan', 'colokan_antena_tv'],
      bathroom: ['kamar_mandi_dalam'],
      building: ['air_gratis', 'sampah_gratis'],
      parking: ['motor'],
    },
    electricity: { type: 'token', wattage: 900, included: false },
    policies: {
      depositPercent: 10,
      minStay: 1,
      maxStay: 7,
      ktpRequired: true,
      coupleAllowed: true,
      petAllowed: false,
      vehicleAllowed: true,
    },
    costs: {
      fixedCosts: [
        { name: 'Biaya Bangunan', amount: 150000000, category: 'building' },
        { name: 'Perabot Kamar', amount: 2000000, category: 'furniture' },
      ],
      variableCosts: [
        { name: 'Kebersihan', amount: 50000, category: 'maintenance' },
        { name: 'Internet', amount: 30000, category: 'utility' },
      ],
    },
    nearbyPlaces: [
      { name: 'CV Talent Smart Technology', distance: 500, type: 'industry' },
    ],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-10T10:30:00Z',
  },
  {
    id: 'kos-002',
    name: 'Kost Bpk Boin Tipe A',
    address: 'Cikarang Barat, Bekasi',
    type: 'campur',
    totalRooms: 8,
    availableRooms: 1,
    roomSize: { width: 3, length: 3 },
    currentPrice: 700000,
    ownerName: 'Ali Jakaria',
    ownerContact: '081234567891',
    rating: 5.0,
    totalReviews: 2,
    totalTransactions: 12,
    facilities: {
      room: ['ventilasi', 'jendela'],
      bathroom: ['kamar_mandi_dalam'],
      building: ['asuransi_penyewa', 'bisa_booking_langsung', 'bisa_survei'],
      parking: ['motor'],
    },
    electricity: { type: 'token', wattage: 900, included: false },
    policies: {
      depositPercent: 20,
      minStay: 0,
      maxStay: 21,
      ktpRequired: true,
      coupleAllowed: false,
      petAllowed: false,
      vehicleAllowed: true,
    },
    costs: {
      fixedCosts: [
        { name: 'Biaya Bangunan', amount: 120000000, category: 'building' },
        { name: 'Perabot Kamar', amount: 1500000, category: 'furniture' },
      ],
      variableCosts: [
        { name: 'Kebersihan', amount: 40000, category: 'maintenance' },
      ],
    },
    nearbyPlaces: [
      { name: 'CV Talent Smart Technology', distance: 300, type: 'industry' },
    ],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-12T14:20:00Z',
  },
  {
    id: 'kos-003',
    name: 'Kost Nur Residence Mekarwangi Executive',
    address: 'Cikarang Barat, Bekasi (Dekat MM2100)',
    type: 'campur',
    totalRooms: 15,
    availableRooms: 2,
    roomSize: { width: 3, length: 4 },
    currentPrice: 1100000,
    ownerName: 'Jihad',
    ownerContact: '081234567892',
    rating: 4.8,
    totalReviews: 5,
    totalTransactions: 20,
    facilities: {
      room: ['ac', 'kasur', 'meja', 'lemari', 'ventilasi', 'jendela', 'guling', 'bantal', 'kursi'],
      bathroom: ['kamar_mandi_dalam', 'kloset_duduk', 'shower'],
      building: ['wifi', 'pengurus_kos', 'asuransi', 'bisa_booking_langsung', 'bisa_survei'],
      parking: ['motor', 'sepeda'],
    },
    electricity: { type: 'token', wattage: 1300, included: false },
    policies: {
      depositPercent: 10,
      minStay: 0,
      maxStay: 60,
      ktpRequired: true,
      coupleAllowed: true,
      petAllowed: false,
      vehicleAllowed: true,
    },
    costs: {
      fixedCosts: [
        { name: 'Biaya Bangunan', amount: 300000000, category: 'building' },
        { name: 'Perabot Kamar (AC, Kasur, dll)', amount: 5000000, category: 'furniture' },
      ],
      variableCosts: [
        { name: 'Kebersihan', amount: 75000, category: 'maintenance' },
        { name: 'Internet/WiFi', amount: 50000, category: 'utility' },
        { name: 'Pengurus Kos', amount: 30000, category: 'staff' },
      ],
    },
    nearbyPlaces: [
      { name: 'Kawasan Industri MM2100', distance: 1000, type: 'industry' },
    ],
    createdAt: '2023-11-20T08:00:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
  },
  {
    id: 'kos-004',
    name: 'Kost Nur Residence Telajung Non AC',
    address: 'Cikarang Barat, Bekasi',
    type: 'putra',
    totalRooms: 12,
    availableRooms: 2,
    roomSize: { width: 3, length: 3 },
    currentPrice: 725000,
    ownerName: 'Jihad',
    ownerContact: '081234567892',
    rating: 4.5,
    totalReviews: 3,
    totalTransactions: 15,
    facilities: {
      room: ['kasur', 'meja', 'lemari', 'ventilasi', 'jendela'],
      bathroom: ['kamar_mandi_dalam'],
      building: ['asuransi', 'bisa_booking_langsung', 'bisa_survei'],
      parking: ['motor'],
    },
    electricity: { type: 'token', wattage: 900, included: false },
    policies: {
      depositPercent: 20,
      minStay: 0,
      maxStay: 60,
      ktpRequired: true,
      coupleAllowed: false,
      petAllowed: false,
      vehicleAllowed: true,
    },
    costs: {
      fixedCosts: [
        { name: 'Biaya Bangunan', amount: 180000000, category: 'building' },
        { name: 'Perabot Kamar', amount: 2500000, category: 'furniture' },
      ],
      variableCosts: [
        { name: 'Kebersihan', amount: 50000, category: 'maintenance' },
      ],
    },
    nearbyPlaces: [],
    createdAt: '2023-12-01T08:00:00Z',
    updatedAt: '2024-03-14T11:30:00Z',
  },
  {
    id: 'kos-005',
    name: 'Kost Amerta 1000 Tipe A1',
    address: 'Kecamatan Cikarang Utara, Bekasi (Dekat Jababeka 2)',
    type: 'campur',
    totalRooms: 20,
    availableRooms: 2,
    roomSize: { width: 3, length: 4 },
    currentPrice: 1100000,
    ownerName: 'Penni',
    ownerContact: '081234567893',
    rating: 4.7,
    totalReviews: 8,
    totalTransactions: 35,
    facilities: {
      room: ['ac', 'kasur', 'meja', 'lemari', 'ventilasi', 'jendela', 'guling', 'bantal', 'wastafel', 'kursi'],
      bathroom: ['kamar_mandi_dalam', 'kloset_duduk', 'ember_mandi', 'shower'],
      building: ['wifi', 'pengurus_kos'],
      parking: ['motor', 'sepeda'],
    },
    electricity: { type: 'token', wattage: 900, included: false },
    policies: {
      depositPercent: 10,
      minStay: 0,
      maxStay: 60,
      ktpRequired: true,
      coupleAllowed: true,
      petAllowed: false,
      vehicleAllowed: true,
      maxOccupants: 2,
      childrenAllowed: false,
      hasCurfew: true,
      lateFee: 50000,
    },
    costs: {
      fixedCosts: [
        { name: 'Biaya Bangunan', amount: 400000000, category: 'building' },
        { name: 'Perabot Kamar (AC, Kasur, Meja, Lemari, dll)', amount: 6000000, category: 'furniture' },
        { name: 'Instalasi WiFi', amount: 5000000, category: 'utility' },
      ],
      variableCosts: [
        { name: 'Kebersihan', amount: 60000, category: 'maintenance' },
        { name: 'Internet/WiFi', amount: 40000, category: 'utility' },
        { name: 'Gaji Pengurus', amount: 50000, category: 'staff' },
      ],
    },
    nearbyPlaces: [
      { name: 'Warteg Family', distance: 817, type: 'restaurant' },
      { name: 'Masjid Arrahman', distance: 1400, type: 'worship' },
      { name: 'Universitas Presiden', distance: 2200, type: 'education' },
      { name: 'RS Harapan Keluarga', distance: 1100, type: 'health' },
      { name: 'Living Plaza Jababeka', distance: 756, type: 'shopping' },
      { name: 'Kawasan Industri Jababeka 2', distance: 500, type: 'industry' },
      { name: 'Pasir Gombong', distance: 800, type: 'industry' },
    ],
    createdAt: '2023-10-15T08:00:00Z',
    updatedAt: '2024-03-16T08:00:00Z',
  },
]

let mockApiKeys: ApiKey[] = [
  {
    id: 'key-001',
    name: 'Production API Key',
    key: 'kos_prod_a1b2c3d4e5f6g7h8i9j0',
    maskedKey: 'kos_prod...j0',
    permissions: ['read', 'write', 'delete'],
    isActive: true,
    lastUsedAt: '2024-03-15T14:30:00Z',
    expiresAt: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'key-002',
    name: 'Development API Key',
    key: 'kos_dev_x1y2z3a4b5c6d7e8f9g0',
    maskedKey: 'kos_dev_...g0',
    permissions: ['read'],
    isActive: true,
    lastUsedAt: '2024-03-10T09:15:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-02-15T00:00:00Z',
  },
]

let mockAHPResults: AHPResult[] = []
let mockCBPResults: CBPResult[] = []
let mockIntegrationResults: IntegrationResult[] = []

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// =============================================
// AUTH API
// =============================================
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(500)
    
    if (email === 'demo@kos.id' && password === 'demo123') {
      return {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'demo@kos.id',
            name: 'Demo Owner',
            role: 'owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token-' + generateId(),
        },
      }
    }
    
    return {
      success: false,
      error: {
        code: 'AUTH_FAILED',
        message: 'Email atau password salah',
      },
    }
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    await delay(200)
    return { success: true }
  },
  
  validateToken: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    await delay(200)
    if (token.startsWith('mock-jwt-token')) {
      return {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'demo@kos.id',
            name: 'Demo Owner',
            role: 'owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      }
    }
    return {
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token tidak valid' },
    }
  },
}

// =============================================
// KOS DATA API
// =============================================
export const kosApi = {
  getAll: async (): Promise<ApiResponse<KosData[]>> => {
    await delay(300)
    return { success: true, data: mockKosData }
  },
  
  getById: async (id: string): Promise<ApiResponse<KosData>> => {
    await delay(200)
    const kos = mockKosData.find(k => k.id === id)
    if (kos) {
      return { success: true, data: kos }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Data kos tidak ditemukan' },
    }
  },
  
  create: async (data: Omit<KosData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<KosData>> => {
    await delay(400)
    const newKos: KosData = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockKosData.push(newKos)
    return { success: true, data: newKos }
  },
  
  update: async (id: string, data: Partial<KosData>): Promise<ApiResponse<KosData>> => {
    await delay(300)
    const index = mockKosData.findIndex(k => k.id === id)
    if (index !== -1) {
      mockKosData[index] = {
        ...mockKosData[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return { success: true, data: mockKosData[index] }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Data kos tidak ditemukan' },
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(300)
    const index = mockKosData.findIndex(k => k.id === id)
    if (index !== -1) {
      mockKosData.splice(index, 1)
      return { success: true }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Data kos tidak ditemukan' },
    }
  },
}

// =============================================
// AHP CALCULATION API
// =============================================
export const ahpApi = {
  calculate: async (input: AHPInput): Promise<ApiResponse<AHPResult>> => {
    await delay(800) // Simulate calculation time
    
    const n = 5 // Number of criteria
    
    // Build pairwise comparison matrix
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1))
    
    // Fill matrix from comparisons (simplified simulation)
    input.comparisons.forEach(comp => {
      const i = parseInt(comp.criteriaA)
      const j = parseInt(comp.criteriaB)
      if (i < n && j < n) {
        matrix[i][j] = comp.value
        matrix[j][i] = 1 / comp.value
      }
    })
    
    // Normalize matrix
    const colSums = Array(n).fill(0)
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        colSums[j] += matrix[i][j]
      }
    }
    
    const normalizedMatrix = matrix.map((row, i) =>
      row.map((val, j) => val / colSums[j])
    )
    
    // Calculate eigenvector (priority vector)
    const eigenVector = normalizedMatrix.map(row =>
      row.reduce((sum, val) => sum + val, 0) / n
    )
    
    // Calculate lambda max
    let lambdaMax = 0
    for (let j = 0; j < n; j++) {
      let weightedSum = 0
      for (let i = 0; i < n; i++) {
        weightedSum += matrix[i][j] * eigenVector[i]
      }
      lambdaMax += weightedSum / eigenVector[j]
    }
    lambdaMax /= n
    
    // Calculate CI and CR
    const ci = (lambdaMax - n) / (n - 1)
    const ri = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49] // Random Index
    const cr = ci / ri[n]
    
    const criteriaNames = ['location', 'facilities', 'security', 'condition', 'accessibility']
    const criteriaWeights: { [key: string]: number } = {}
    criteriaNames.forEach((name, i) => {
      criteriaWeights[name] = eigenVector[i]
    })
    
    const result: AHPResult = {
      id: generateId(),
      kosId: input.kosId,
      matrix,
      normalizedMatrix,
      eigenVector,
      criteriaWeights,
      lambdaMax,
      consistencyIndex: ci,
      consistencyRatio: cr,
      isConsistent: cr <= 0.1,
      calculatedAt: new Date().toISOString(),
    }
    
    mockAHPResults.push(result)
    
    if (cr > 0.1) {
      return {
        success: false,
        error: {
          code: 'CR_EXCEEDED',
          message: `Consistency Ratio (${(cr * 100).toFixed(2)}%) melebihi batas 10%. Silakan periksa kembali perbandingan berpasangan Anda.`,
        },
        data: result,
      }
    }
    
    return { success: true, data: result }
  },
  
  getByKosId: async (kosId: string): Promise<ApiResponse<AHPResult[]>> => {
    await delay(200)
    const results = mockAHPResults.filter(r => r.kosId === kosId)
    return { success: true, data: results }
  },
}

// =============================================
// CBP CALCULATION API
// =============================================
export const cbpApi = {
  calculate: async (input: CBPInput): Promise<ApiResponse<CBPResult>> => {
    await delay(600)
    
    const kos = mockKosData.find(k => k.id === input.kosId)
    if (!kos) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Data kos tidak ditemukan' },
      }
    }
    
    // Validate occupancy
    if (input.occupancyRate < 0 || input.occupancyRate > 100) {
      return {
        success: false,
        error: {
          code: 'INVALID_OCCUPANCY',
          message: 'Tingkat okupansi harus antara 0-100%',
        },
      }
    }
    
    // Calculate total fixed costs (yearly)
    const totalFixedCost = kos.costs.fixedCosts.reduce((sum, cost) => sum + cost.amount, 0)
    
    // Calculate total variable costs (monthly per room)
    const totalVariableCost = kos.costs.variableCosts.reduce((sum, cost) => sum + cost.amount, 0)
    
    // Calculate unit cost
    const monthlyFixedPerRoom = totalFixedCost / input.depreciationYears / 12 / kos.totalRooms
    const adjustedOccupancy = Math.max(input.occupancyRate / 100, 0.01) // Prevent division by zero
    const unitCost = (monthlyFixedPerRoom / adjustedOccupancy) + totalVariableCost
    
    // Calculate markup price
    const markupMultiplier = 1 + (input.expectedProfit / 100)
    const recommendedPrice = unitCost * markupMultiplier
    
    const result: CBPResult = {
      id: generateId(),
      kosId: input.kosId,
      totalFixedCost,
      totalVariableCost,
      unitCost,
      markupPercentage: input.expectedProfit,
      floorPrice: unitCost,
      recommendedPrice,
      occupancyRate: input.occupancyRate,
      calculatedAt: new Date().toISOString(),
    }
    
    mockCBPResults.push(result)
    return { success: true, data: result }
  },
  
  getByKosId: async (kosId: string): Promise<ApiResponse<CBPResult[]>> => {
    await delay(200)
    const results = mockCBPResults.filter(r => r.kosId === kosId)
    return { success: true, data: results }
  },
}

// =============================================
// INTEGRATION API
// =============================================
export const integrationApi = {
  calculate: async (
    kosId: string,
    ahpResultId: string,
    cbpResultId: string
  ): Promise<ApiResponse<IntegrationResult>> => {
    await delay(500)
    
    const ahpResult = mockAHPResults.find(r => r.id === ahpResultId)
    const cbpResult = mockCBPResults.find(r => r.id === cbpResultId)
    
    if (!ahpResult || !cbpResult) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Hasil AHP atau CBP tidak ditemukan' },
      }
    }
    
    // Calculate AHP score (weighted average)
    const ahpScore = Object.values(ahpResult.criteriaWeights).reduce((sum, w) => sum + w, 0) / 
                     Object.keys(ahpResult.criteriaWeights).length
    
    // Calculate final price with AHP adjustment
    const priceAdjustment = 1 + ((ahpScore - 0.2) * 0.5) // Adjust based on AHP score
    const finalPrice = cbpResult.recommendedPrice * priceAdjustment
    
    // Validation
    const validationMessages: string[] = []
    let validationStatus: 'valid' | 'warning' | 'invalid' = 'valid'
    
    if (finalPrice < cbpResult.floorPrice * 0.95) {
      validationMessages.push('Harga akhir di bawah 95% dari floor price')
      validationStatus = 'invalid'
    }
    
    if (!ahpResult.isConsistent) {
      validationMessages.push('Hasil AHP tidak konsisten (CR > 10%)')
      validationStatus = validationStatus === 'invalid' ? 'invalid' : 'warning'
    }
    
    const result: IntegrationResult = {
      id: generateId(),
      kosId,
      ahpResult,
      cbpResult,
      ahpScore,
      cbpFloorPrice: cbpResult.floorPrice,
      finalRecommendedPrice: Math.round(finalPrice / 50000) * 50000, // Round to nearest 50k
      priceRange: {
        min: Math.round((finalPrice * 0.9) / 50000) * 50000,
        max: Math.round((finalPrice * 1.1) / 50000) * 50000,
      },
      validationStatus,
      validationMessages,
      calculatedAt: new Date().toISOString(),
    }
    
    mockIntegrationResults.push(result)
    return { success: true, data: result }
  },
  
  getByKosId: async (kosId: string): Promise<ApiResponse<IntegrationResult[]>> => {
    await delay(200)
    const results = mockIntegrationResults.filter(r => r.kosId === kosId)
    return { success: true, data: results }
  },
}

// =============================================
// API KEY MANAGEMENT
// =============================================
export const apiKeyApi = {
  getAll: async (): Promise<ApiResponse<ApiKey[]>> => {
    await delay(200)
    return { success: true, data: mockApiKeys }
  },
  
  create: async (name: string, permissions: string[]): Promise<ApiResponse<ApiKey>> => {
    await delay(400)
    const fullKey = 'kos_' + generateId() + generateId()
    const newKey: ApiKey = {
      id: generateId(),
      name,
      key: fullKey,
      maskedKey: fullKey.substring(0, 8) + '...' + fullKey.substring(fullKey.length - 4),
      permissions,
      isActive: true,
      lastUsedAt: null,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    }
    mockApiKeys.push(newKey)
    return { success: true, data: newKey }
  },
  
  revoke: async (id: string): Promise<ApiResponse<null>> => {
    await delay(300)
    const index = mockApiKeys.findIndex(k => k.id === id)
    if (index !== -1) {
      mockApiKeys[index].isActive = false
      return { success: true }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'API Key tidak ditemukan' },
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(300)
    const index = mockApiKeys.findIndex(k => k.id === id)
    if (index !== -1) {
      mockApiKeys.splice(index, 1)
      return { success: true }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'API Key tidak ditemukan' },
    }
  },
}

// =============================================
// DASHBOARD API
// =============================================
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(300)
    
    const consistentResults = mockAHPResults.filter(r => r.isConsistent).length
    const totalAHPResults = mockAHPResults.length
    
    return {
      success: true,
      data: {
        totalKos: mockKosData.length,
        totalCalculations: mockIntegrationResults.length,
        averagePrice: mockIntegrationResults.length > 0
          ? mockIntegrationResults.reduce((sum, r) => sum + r.finalRecommendedPrice, 0) / mockIntegrationResults.length
          : 0,
        consistentAHPRate: totalAHPResults > 0 ? (consistentResults / totalAHPResults) * 100 : 0,
      },
    }
  },
}

// =============================================
// EXPORT API
// =============================================
export const exportApi = {
  generatePDF: async (integrationResultId: string): Promise<ApiResponse<{ url: string }>> => {
    await delay(1000)
    // In production, this would generate actual PDF
    return {
      success: true,
      data: {
        url: `/api/reports/${integrationResultId}.pdf`,
      },
    }
  },
  
  getShareUrl: async (integrationResultId: string): Promise<ApiResponse<{ shareUrl: string }>> => {
    await delay(300)
    return {
      success: true,
      data: {
        shareUrl: `https://kos-dss.vercel.app/share/${integrationResultId}`,
      },
    }
  },
}
