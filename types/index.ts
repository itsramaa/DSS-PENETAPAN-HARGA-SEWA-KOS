// =============================================
// DSS Kos - Type Definitions
// =============================================

// User & Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
    refreshToken: string
  }
  error?: string
}

// Kos Data Types
export interface RoomSize {
  width: number
  length: number
}

export interface Facilities {
  room: string[]
  bathroom: string[]
  building: string[]
  parking: string[]
}

export interface Electricity {
  type: 'token' | 'prepaid' | 'postpaid'
  wattage: number
  included: boolean
}

export interface Policies {
  depositPercent: number
  minStay: number
  maxStay: number
  ktpRequired: boolean
  coupleAllowed: boolean
  petAllowed: boolean
  vehicleAllowed: boolean
  maxOccupants?: number
  childrenAllowed?: boolean
  hasCurfew?: boolean
  lateFee?: number
}

export interface NearbyPlace {
  name: string
  distance: number // in meters
  type: 'industry' | 'restaurant' | 'worship' | 'education' | 'health' | 'shopping' | 'other'
}

export interface Cost {
  name: string
  amount: number
  category: string
}

export interface CostData {
  fixedCosts: Cost[]
  variableCosts: Cost[]
}

export interface KosData {
  id: string
  name: string
  address: string
  type: 'putra' | 'putri' | 'campur'
  totalRooms: number
  availableRooms: number
  roomSize: RoomSize
  currentPrice: number
  ownerName: string
  ownerContact: string
  rating: number
  totalReviews: number
  totalTransactions: number
  facilities: Facilities
  electricity: Electricity
  policies: Policies
  costs: CostData
  nearbyPlaces: NearbyPlace[]
  createdAt: string
  updatedAt: string
}

export interface Facility {
  id: string
  name: string
  category: 'basic' | 'comfort' | 'premium'
  available: boolean
}

// AHP Types
export interface AHPCriteria {
  id: string
  name: string
  description: string
}

export interface PairwiseComparison {
  criteriaA: string
  criteriaB: string
  value: number // 1-9 scale
}

export interface AHPResult {
  id: string
  kosId: string
  matrix: number[][]
  normalizedMatrix: number[][]
  eigenVector: number[]
  criteriaWeights: { [key: string]: number }
  lambdaMax: number
  consistencyIndex: number
  consistencyRatio: number
  isConsistent: boolean
  calculatedAt: string
}

export interface AHPInput {
  kosId: string
  comparisons: PairwiseComparison[]
  useBaselineWeights?: boolean
}

// CBP Types
export interface CBPInput {
  kosId: string
  occupancyRate: number // 0-100
  expectedProfit: number // percentage markup
  depreciationYears: number
}

export interface CBPResult {
  id: string
  kosId: string
  totalFixedCost: number
  totalVariableCost: number
  unitCost: number
  markupPercentage: number
  floorPrice: number
  recommendedPrice: number
  occupancyRate: number
  calculatedAt: string
}

// Integration Types
export interface IntegrationResult {
  id: string
  kosId: string
  ahpResult: AHPResult
  cbpResult: CBPResult
  ahpScore: number
  cbpFloorPrice: number
  finalRecommendedPrice: number
  priceRange: {
    min: number
    max: number
  }
  validationStatus: 'valid' | 'warning' | 'invalid'
  validationMessages: string[]
  calculatedAt: string
}

// API Key Types
export interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  permissions: string[]
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
  type: 'permanent' | 'temporary'
  usageCount?: number
  description?: string
}

export interface CreateApiKeyInput {
  name: string
  permissions: string[]
  expiresAt?: string
  type?: 'permanent' | 'temporary'
  description?: string
}

export type ApiKeyStatus = 'active' | 'expired' | 'revoked' | 'temporary'

export interface ApiKeyInfo extends ApiKey {
  status: ApiKeyStatus
  daysUntilExpiry?: number
  isExpired: boolean
  isExpiringSoon: boolean
}

// Report Types
export interface ReportInsight {
  title: string
  description: string
  value?: string | number
  type: 'positive' | 'warning' | 'neutral'
  actionable: boolean
}

export interface Report {
  id: string
  kosId: string
  integrationResult: IntegrationResult
  generatedAt: string
  format: 'pdf' | 'json'
  shareUrl?: string
  insights: ReportInsight[]
  summary: string
  recommendations: string[]
}

export interface DetailedReportData {
  kosId: string
  kosName: string
  period: {
    startDate: string
    endDate: string
  }
  metrics: {
    occupancyRate: number
    revenue: number
    costBreakdown: Record<string, number>
    roi: number
    margin: number
  }
  comparison: {
    marketAverage: number
    competitorAverage: number
    yourPrice: number
    pricingStrategy: 'above' | 'equal' | 'below' | 'neutral'
  }
  ahpAnalysis: {
    topCriteria: Array<{ name: string; weight: number }>
    consistencyScore: number
  }
  cbpAnalysis: {
    floorPrice: number
    recommendedPrice: number
    profitMargin: number
  }
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface KosValidation {
  isValid: boolean
  errors: ValidationError[]
  missingMandatoryFields: string[]
  canCalculateAHP: boolean
  canCalculateCBP: boolean
}

export interface CalculationValidation {
  canProceed: boolean
  missingFields: string[]
  warnings: string[]
  blockingReason?: string
}

// Dashboard Types
export interface DashboardStats {
  totalKos: number
  totalCalculations: number
  averagePrice: number
  consistentAHPRate: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

// Form States
export interface FormState {
  isLoading: boolean
  isSubmitting: boolean
  errors: Record<string, string>
}

// Default AHP Criteria for Kos Pricing
export const DEFAULT_AHP_CRITERIA: AHPCriteria[] = [
  { id: 'location', name: 'Lokasi', description: 'Kedekatan dengan fasilitas umum' },
  { id: 'facilities', name: 'Fasilitas', description: 'Kelengkapan fasilitas kamar dan kos' },
  { id: 'security', name: 'Keamanan', description: 'Tingkat keamanan lingkungan' },
  { id: 'condition', name: 'Kondisi Bangunan', description: 'Kualitas dan kondisi bangunan' },
  { id: 'accessibility', name: 'Aksesibilitas', description: 'Kemudahan akses transportasi' },
]

// AHP Scale Reference
export const AHP_SCALE = [
  { value: 1, label: 'Sama Penting', description: 'Kedua elemen sama pentingnya' },
  { value: 3, label: 'Sedikit Lebih Penting', description: 'Elemen satu sedikit lebih penting dari yang lain' },
  { value: 5, label: 'Lebih Penting', description: 'Elemen satu lebih penting dari yang lain' },
  { value: 7, label: 'Sangat Lebih Penting', description: 'Elemen satu sangat lebih penting dari yang lain' },
  { value: 9, label: 'Mutlak Lebih Penting', description: 'Elemen satu mutlak lebih penting dari yang lain' },
]

// Default Facilities List
export const DEFAULT_FACILITIES: Omit<Facility, 'id' | 'available'>[] = [
  { name: 'AC', category: 'comfort' },
  { name: 'WiFi', category: 'basic' },
  { name: 'Kamar Mandi Dalam', category: 'basic' },
  { name: 'Kasur', category: 'basic' },
  { name: 'Lemari', category: 'basic' },
  { name: 'Meja Belajar', category: 'basic' },
  { name: 'TV', category: 'comfort' },
  { name: 'Kulkas', category: 'comfort' },
  { name: 'Dapur Bersama', category: 'basic' },
  { name: 'Parkir Motor', category: 'basic' },
  { name: 'Parkir Mobil', category: 'comfort' },
  { name: 'Laundry', category: 'premium' },
  { name: 'Cleaning Service', category: 'premium' },
  { name: 'CCTV', category: 'comfort' },
  { name: 'Security 24 Jam', category: 'premium' },
]
