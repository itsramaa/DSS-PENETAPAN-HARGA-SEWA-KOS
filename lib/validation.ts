// =============================================
// Data Validation Utilities
// =============================================

import type {
  KosData,
  KosValidation,
  ValidationError,
  CalculationValidation,
  AHPInput,
  CBPInput,
} from '@/types'

// Mandatory fields for AHP calculation
const AHP_MANDATORY_FIELDS = [
  'facilities',
  'nearbyPlaces',
  'policies',
] as const

// Mandatory fields for CBP calculation
const CBP_MANDATORY_FIELDS = [
  'costs',
  'totalRooms',
  'currentPrice',
  'policies',
] as const

/**
 * Validate KOS data for completeness
 */
export function validateKosData(kos: KosData): KosValidation {
  const errors: ValidationError[] = []
  const missingMandatoryFields: string[] = []

  // Check basic information
  if (!kos.name?.trim()) {
    errors.push({
      field: 'name',
      message: 'Nama kos harus diisi',
      severity: 'error',
    })
    missingMandatoryFields.push('name')
  }

  if (!kos.address?.trim()) {
    errors.push({
      field: 'address',
      message: 'Alamat harus diisi',
      severity: 'error',
    })
    missingMandatoryFields.push('address')
  }

  if (!kos.ownerName?.trim()) {
    errors.push({
      field: 'ownerName',
      message: 'Nama pemilik harus diisi',
      severity: 'error',
    })
    missingMandatoryFields.push('ownerName')
  }

  if (!kos.ownerContact?.trim()) {
    errors.push({
      field: 'ownerContact',
      message: 'Kontak pemilik harus diisi',
      severity: 'error',
    })
    missingMandatoryFields.push('ownerContact')
  }

  if (!kos.totalRooms || kos.totalRooms <= 0) {
    errors.push({
      field: 'totalRooms',
      message: 'Jumlah kamar harus diisi dengan nilai lebih dari 0',
      severity: 'error',
    })
    missingMandatoryFields.push('totalRooms')
  }

  if (!kos.currentPrice || kos.currentPrice <= 0) {
    errors.push({
      field: 'currentPrice',
      message: 'Harga saat ini harus diisi dengan nilai lebih dari 0',
      severity: 'error',
    })
    missingMandatoryFields.push('currentPrice')
  }

  // Check for AHP calculation requirements
  const ahpMissingFields: string[] = []
  if (!kos.facilities || Object.keys(kos.facilities).length === 0) {
    ahpMissingFields.push('facilities')
  }

  if (!kos.nearbyPlaces || kos.nearbyPlaces.length === 0) {
    ahpMissingFields.push('nearbyPlaces')
  }

  if (!kos.policies || Object.keys(kos.policies).length === 0) {
    ahpMissingFields.push('policies')
  }

  // Check for CBP calculation requirements
  const cbpMissingFields: string[] = []
  if (!kos.costs || !kos.costs.fixedCosts || kos.costs.fixedCosts.length === 0) {
    cbpMissingFields.push('costs')
  }

  if (!kos.costs || !kos.costs.variableCosts || kos.costs.variableCosts.length === 0) {
    cbpMissingFields.push('variableCosts')
  }

  const canCalculateAHP = ahpMissingFields.length === 0 && missingMandatoryFields.length === 0
  const canCalculateCBP = cbpMissingFields.length === 0 && missingMandatoryFields.length === 0

  return {
    isValid: errors.length === 0 && missingMandatoryFields.length === 0,
    errors,
    missingMandatoryFields,
    canCalculateAHP,
    canCalculateCBP,
  }
}

/**
 * Validate AHP input data
 */
export function validateAHPInput(input: AHPInput): CalculationValidation {
  const missingFields: string[] = []
  const warnings: string[] = []

  if (!input.kosId?.trim()) {
    missingFields.push('kosId')
  }

  if (!input.comparisons || input.comparisons.length === 0) {
    missingFields.push('comparisons')
  }

  if (input.comparisons && input.comparisons.length < 10) {
    warnings.push('Data perbandingan berpasangan mungkin tidak lengkap')
  }

  return {
    canProceed: missingFields.length === 0,
    missingFields,
    warnings,
    blockingReason: missingFields.length > 0 ? `Kolom yang hilang: ${missingFields.join(', ')}` : undefined,
  }
}

/**
 * Validate CBP input data
 */
export function validateCBPInput(input: CBPInput): CalculationValidation {
  const missingFields: string[] = []
  const warnings: string[] = []

  if (!input.kosId?.trim()) {
    missingFields.push('kosId')
  }

  if (input.occupancyRate === null || input.occupancyRate === undefined) {
    missingFields.push('occupancyRate')
  } else if (input.occupancyRate < 0 || input.occupancyRate > 100) {
    missingFields.push('occupancyRate - harus antara 0-100')
  }

  if (input.expectedProfit === null || input.expectedProfit === undefined) {
    missingFields.push('expectedProfit')
  } else if (input.expectedProfit < 0) {
    warnings.push('Keuntungan negatif mungkin tidak ideal')
  }

  if (input.depreciationYears === null || input.depreciationYears === undefined) {
    missingFields.push('depreciationYears')
  } else if (input.depreciationYears <= 0) {
    missingFields.push('depreciationYears - harus lebih dari 0')
  }

  return {
    canProceed: missingFields.length === 0,
    missingFields,
    warnings,
    blockingReason: missingFields.length > 0 ? `Kolom yang hilang: ${missingFields.join(', ')}` : undefined,
  }
}

/**
 * Get list of mandatory fields that are missing for specific operation
 */
export function getMissingMandatoryFields(
  kos: KosData,
  operation: 'ahp' | 'cbp' | 'both'
): string[] {
  const missing: string[] = []

  // Always required fields
  const basicRequired = ['name', 'address', 'ownerName', 'ownerContact', 'totalRooms', 'currentPrice']
  basicRequired.forEach(field => {
    const value = (kos as any)[field]
    if (!value || (typeof value === 'string' && !value.trim())) {
      missing.push(field)
    }
  })

  // AHP-specific requirements
  if (operation === 'ahp' || operation === 'both') {
    if (!kos.facilities || Object.keys(kos.facilities).length === 0) {
      missing.push('facilities')
    }
    if (!kos.nearbyPlaces || kos.nearbyPlaces.length === 0) {
      missing.push('nearbyPlaces')
    }
  }

  // CBP-specific requirements
  if (operation === 'cbp' || operation === 'both') {
    if (!kos.costs?.fixedCosts?.length) {
      missing.push('costs.fixedCosts')
    }
    if (!kos.costs?.variableCosts?.length) {
      missing.push('costs.variableCosts')
    }
  }

  return [...new Set(missing)] // Remove duplicates
}

/**
 * Get user-friendly field labels
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: 'Nama Kos',
    address: 'Alamat',
    ownerName: 'Nama Pemilik',
    ownerContact: 'Kontak Pemilik',
    totalRooms: 'Jumlah Kamar',
    currentPrice: 'Harga Saat Ini',
    facilities: 'Fasilitas',
    nearbyPlaces: 'Lokasi Terdekat',
    costs: 'Biaya',
    'costs.fixedCosts': 'Biaya Tetap',
    'costs.variableCosts': 'Biaya Variabel',
    policies: 'Kebijakan',
    electricity: 'Listrik',
    roomSize: 'Ukuran Kamar',
    availableRooms: 'Kamar Tersedia',
    type: 'Jenis Kos',
  }
  return labels[field] || field
}
