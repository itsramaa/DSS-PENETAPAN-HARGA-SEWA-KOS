# DSS Kos - Backend API Specification

## Overview

Backend API untuk Decision Support System penetapan harga sewa kos menggunakan metode AHP (Analytic Hierarchy Process) dan CBP (Cost-Based Pricing).

**Tech Stack:**
- Backend: Golang (Fiber)
- Database: MariaDB
- Auth: JWT + RBAC

---

## Base URL

```
Production: https://api.kos-dss.com/v1
Development: http://localhost:3000/v1
```

---

## Authentication

### Headers

```
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
```

### Endpoints

#### POST /auth/login

**Request:**
```json
{
  "email": "owner@kos.id",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "owner@kos.id",
      "name": "Budi Santoso",
      "role": "owner"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Email atau password salah"
  }
}
```

#### POST /auth/refresh

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/logout

**Headers:** `Authorization: Bearer <token>`

---

## Kos Data Management

#### GET /kos

List all kos data

**Query Parameters:**
- `page` (int): Page number, default 1
- `limit` (int): Items per page, default 10
- `search` (string): Search by name or address

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "kos_abc123",
      "name": "Kos Mawar Indah",
      "address": "Jl. Mawar No. 10, Bandung",
      "total_rooms": 10,
      "room_size": 12,
      "facilities": [
        {"id": "fac_1", "name": "AC", "category": "comfort", "available": true},
        {"id": "fac_2", "name": "WiFi", "category": "basic", "available": true}
      ],
      "costs": {
        "fixed_costs": [
          {"id": "fc_1", "name": "Pajak Bangunan", "amount": 5000000, "category": "license"}
        ],
        "variable_costs": [
          {"id": "vc_1", "name": "Listrik", "amount": 150000, "category": "utilities"}
        ]
      },
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### POST /kos

Create new kos

**Request:**
```json
{
  "name": "Kos Mawar Indah",
  "address": "Jl. Mawar No. 10, Bandung",
  "total_rooms": 10,
  "room_size": 12,
  "facilities": [
    {"name": "AC", "category": "comfort", "available": true},
    {"name": "WiFi", "category": "basic", "available": true}
  ],
  "costs": {
    "fixed_costs": [
      {"name": "Pajak Bangunan", "amount": 5000000, "category": "license"}
    ],
    "variable_costs": [
      {"name": "Listrik", "amount": 150000, "category": "utilities"}
    ]
  }
}
```

**Validation Rules:**
- `name`: required, min 3 chars
- `total_rooms`: required, min 1
- `room_size`: required, min 1
- `costs.fixed_costs[].amount`: must be >= 0
- `costs.variable_costs[].amount`: must be >= 0

#### GET /kos/:id

#### PUT /kos/:id

#### DELETE /kos/:id

---

## AHP Calculation

#### POST /ahp/calculate

Calculate AHP weights

**Request:**
```json
{
  "kos_id": "kos_abc123",
  "comparisons": [
    {"criteria_a": "location", "criteria_b": "facilities", "value": 3},
    {"criteria_a": "location", "criteria_b": "security", "value": 5},
    {"criteria_a": "location", "criteria_b": "condition", "value": 2},
    {"criteria_a": "location", "criteria_b": "accessibility", "value": 4},
    {"criteria_a": "facilities", "criteria_b": "security", "value": 3},
    {"criteria_a": "facilities", "criteria_b": "condition", "value": 2},
    {"criteria_a": "facilities", "criteria_b": "accessibility", "value": 3},
    {"criteria_a": "security", "criteria_b": "condition", "value": 0.5},
    {"criteria_a": "security", "criteria_b": "accessibility", "value": 2},
    {"criteria_a": "condition", "criteria_b": "accessibility", "value": 3}
  ],
  "use_baseline_weights": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ahp_xyz789",
    "kos_id": "kos_abc123",
    "matrix": [
      [1.0, 3.0, 5.0, 2.0, 4.0],
      [0.33, 1.0, 3.0, 2.0, 3.0],
      [0.2, 0.33, 1.0, 0.5, 2.0],
      [0.5, 0.5, 2.0, 1.0, 3.0],
      [0.25, 0.33, 0.5, 0.33, 1.0]
    ],
    "normalized_matrix": [...],
    "eigen_vector": [0.42, 0.26, 0.10, 0.16, 0.06],
    "criteria_weights": {
      "location": 0.42,
      "facilities": 0.26,
      "security": 0.10,
      "condition": 0.16,
      "accessibility": 0.06
    },
    "lambda_max": 5.21,
    "consistency_index": 0.053,
    "consistency_ratio": 0.047,
    "is_consistent": true,
    "calculated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 - Inconsistent):**
```json
{
  "success": false,
  "error": {
    "code": "CR_EXCEEDED",
    "message": "Consistency Ratio (12.5%) melebihi batas 10%"
  },
  "data": {
    "consistency_ratio": 0.125,
    "is_consistent": false
  }
}
```

**Validation Rules:**
- Matrix must be reciprocal: a[i][j] = 1 / a[j][i]
- Comparison values: 1-9 scale (or 1/9 to 1/1)
- CR must be <= 0.1 for valid result

#### GET /ahp/results/:kos_id

Get AHP calculation history for a kos

---

## CBP Calculation

#### POST /cbp/calculate

Calculate Cost-Based Pricing

**Request:**
```json
{
  "kos_id": "kos_abc123",
  "occupancy_rate": 80,
  "expected_profit": 20,
  "depreciation_years": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cbp_def456",
    "kos_id": "kos_abc123",
    "total_fixed_cost": 50000000,
    "total_variable_cost": 350000,
    "unit_cost": 868750,
    "markup_percentage": 20,
    "floor_price": 868750,
    "recommended_price": 1042500,
    "occupancy_rate": 80,
    "calculated_at": "2024-01-15T10:35:00Z"
  }
}
```

**Validation Rules:**
- `occupancy_rate`: 0-100%
- `expected_profit`: must be >= 0
- `depreciation_years`: must be > 0
- All costs must be >= 0

#### GET /cbp/results/:kos_id

---

## Integration

#### POST /integration/calculate

Combine AHP and CBP results

**Request:**
```json
{
  "kos_id": "kos_abc123",
  "ahp_result_id": "ahp_xyz789",
  "cbp_result_id": "cbp_def456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "int_ghi012",
    "kos_id": "kos_abc123",
    "ahp_result": {...},
    "cbp_result": {...},
    "ahp_score": 0.42,
    "cbp_floor_price": 868750,
    "final_recommended_price": 1100000,
    "price_range": {
      "min": 1000000,
      "max": 1200000
    },
    "validation_status": "valid",
    "validation_messages": [],
    "calculated_at": "2024-01-15T10:40:00Z"
  }
}
```

**Validation Rules:**
- Final price must be >= 95% of floor_price
- AHP result must be consistent (CR <= 0.1)

---

## API Key Management

#### GET /api-keys

List all API keys

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "key_abc123",
      "name": "Production API",
      "masked_key": "kos_abc1...xyz9",
      "permissions": ["read:kos", "write:ahp", "read:cbp"],
      "is_active": true,
      "last_used_at": "2024-01-15T09:00:00Z",
      "expires_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api-keys

Create new API key

**Request:**
```json
{
  "name": "Production API",
  "permissions": ["read:kos", "write:ahp", "read:cbp", "write:integration"],
  "expires_at": "2025-01-01T00:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production API",
    "key": "kos_abc123def456ghi789jkl012mno345pqr678",
    "masked_key": "kos_abc1...r678",
    "permissions": ["read:kos", "write:ahp", "read:cbp", "write:integration"],
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Available Permissions:**
- `read:kos` - Read kos data
- `write:kos` - Create/update kos data
- `read:ahp` - Read AHP results
- `write:ahp` - Perform AHP calculations
- `read:cbp` - Read CBP results
- `write:cbp` - Perform CBP calculations
- `read:integration` - Read integration results
- `write:integration` - Perform integration calculations

#### POST /api-keys/:id/revoke

Revoke an API key

#### DELETE /api-keys/:id

Permanently delete an API key

---

## Reports & Export

#### POST /reports/generate-pdf

Generate PDF report

**Request:**
```json
{
  "integration_result_id": "int_ghi012"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pdf_url": "https://storage.kos-dss.com/reports/int_ghi012.pdf",
    "expires_at": "2024-01-15T11:00:00Z"
  }
}
```

#### GET /reports/share/:id

Get shareable link for a report

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "specific field error"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_FAILED` | 401 | Invalid credentials |
| `INVALID_TOKEN` | 401 | JWT token invalid or expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `CR_EXCEEDED` | 400 | AHP Consistency Ratio > 10% |
| `INVALID_OCCUPANCY` | 400 | Occupancy rate out of range |
| `CALCULATION_ERROR` | 500 | Calculation failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- Default: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- Calculation endpoints: 20 requests per minute

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

---

## Database Schema (MariaDB)

### Tables

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('owner', 'admin') DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Kos data
CREATE TABLE kos (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  total_rooms INT NOT NULL,
  room_size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Facilities
CREATE TABLE facilities (
  id VARCHAR(36) PRIMARY KEY,
  kos_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category ENUM('basic', 'comfort', 'premium') NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (kos_id) REFERENCES kos(id) ON DELETE CASCADE
);

-- Fixed costs
CREATE TABLE fixed_costs (
  id VARCHAR(36) PRIMARY KEY,
  kos_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category ENUM('building', 'equipment', 'license', 'other') NOT NULL,
  FOREIGN KEY (kos_id) REFERENCES kos(id) ON DELETE CASCADE
);

-- Variable costs
CREATE TABLE variable_costs (
  id VARCHAR(36) PRIMARY KEY,
  kos_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category ENUM('utilities', 'maintenance', 'service', 'other') NOT NULL,
  FOREIGN KEY (kos_id) REFERENCES kos(id) ON DELETE CASCADE
);

-- AHP results
CREATE TABLE ahp_results (
  id VARCHAR(36) PRIMARY KEY,
  kos_id VARCHAR(36) NOT NULL,
  matrix JSON NOT NULL,
  normalized_matrix JSON NOT NULL,
  eigen_vector JSON NOT NULL,
  criteria_weights JSON NOT NULL,
  lambda_max DECIMAL(10,6) NOT NULL,
  consistency_index DECIMAL(10,6) NOT NULL,
  consistency_ratio DECIMAL(10,6) NOT NULL,
  is_consistent BOOLEAN NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kos_id) REFERENCES kos(id) ON DELETE CASCADE
);

-- CBP results
CREATE TABLE cbp_results (
  id VARCHAR(36) PRIMARY KEY,
  kos_id VARCHAR(36) NOT NULL,
  total_fixed_cost DECIMAL(15,2) NOT NULL,
  total_variable_cost DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  markup_percentage DECIMAL(5,2) NOT NULL,
  floor_price DECIMAL(15,2) NOT NULL,
  recommended_price DECIMAL(15,2) NOT NULL,
  occupancy_rate DECIMAL(5,2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kos_id) REFERENCES kos(id) ON DELETE CASCADE
);

-- Integration results
CREATE TABLE integration_results (
  id VARCHAR(36) PRIMARY KEY,
  kos_id VARCHAR(36) NOT NULL,
  ahp_result_id VARCHAR(36) NOT NULL,
  cbp_result_id VARCHAR(36) NOT NULL,
  ahp_score DECIMAL(10,6) NOT NULL,
  cbp_floor_price DECIMAL(15,2) NOT NULL,
  final_recommended_price DECIMAL(15,2) NOT NULL,
  price_range_min DECIMAL(15,2) NOT NULL,
  price_range_max DECIMAL(15,2) NOT NULL,
  validation_status ENUM('valid', 'warning', 'invalid') NOT NULL,
  validation_messages JSON,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kos_id) REFERENCES kos(id) ON DELETE CASCADE,
  FOREIGN KEY (ahp_result_id) REFERENCES ahp_results(id),
  FOREIGN KEY (cbp_result_id) REFERENCES cbp_results(id)
);

-- API keys
CREATE TABLE api_keys (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  masked_key VARCHAR(50) NOT NULL,
  permissions JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_kos_user ON kos(user_id);
CREATE INDEX idx_facilities_kos ON facilities(kos_id);
CREATE INDEX idx_ahp_results_kos ON ahp_results(kos_id);
CREATE INDEX idx_cbp_results_kos ON cbp_results(kos_id);
CREATE INDEX idx_integration_results_kos ON integration_results(kos_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

---

## Golang Fiber Implementation Notes

### Project Structure

```
backend/
├── cmd/
│   └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   └── mariadb.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── kos.go
│   │   ├── ahp.go
│   │   ├── cbp.go
│   │   ├── integration.go
│   │   └── api_keys.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── rbac.go
│   │   ├── api_key.go
│   │   └── rate_limit.go
│   ├── models/
│   │   └── models.go
│   ├── services/
│   │   ├── ahp_engine.go
│   │   ├── cbp_engine.go
│   │   └── integration_engine.go
│   └── utils/
│       ├── jwt.go
│       └── validators.go
├── go.mod
└── go.sum
```

### Key Dependencies

```go
require (
    github.com/gofiber/fiber/v2 v2.52.0
    github.com/gofiber/jwt/v3 v3.3.10
    github.com/golang-jwt/jwt/v5 v5.2.0
    github.com/go-sql-driver/mysql v1.7.1
    github.com/jmoiron/sqlx v1.3.5
    golang.org/x/crypto v0.18.0
)
```

### AHP Engine Formula

```go
// Calculate eigenvector using power iteration
func calculateEigenvector(matrix [][]float64) []float64 {
    n := len(matrix)
    vector := make([]float64, n)
    
    // Initialize with ones
    for i := range vector {
        vector[i] = 1.0
    }
    
    // Power iteration
    for iter := 0; iter < 100; iter++ {
        newVector := make([]float64, n)
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                newVector[i] += matrix[i][j] * vector[j]
            }
        }
        
        // Normalize
        sum := 0.0
        for _, v := range newVector {
            sum += v
        }
        for i := range newVector {
            newVector[i] /= sum
        }
        
        vector = newVector
    }
    
    return vector
}

// Calculate Consistency Ratio
func calculateCR(matrix [][]float64, weights []float64) float64 {
    n := len(matrix)
    lambdaMax := 0.0
    
    for i := 0; i < n; i++ {
        weightedSum := 0.0
        for j := 0; j < n; j++ {
            weightedSum += matrix[i][j] * weights[j]
        }
        lambdaMax += weightedSum / weights[i]
    }
    lambdaMax /= float64(n)
    
    CI := (lambdaMax - float64(n)) / float64(n-1)
    RI := []float64{0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49}
    CR := CI / RI[n]
    
    return CR
}
```

### CBP Engine Formula

```go
func calculateCBP(kos *Kos, input *CBPInput) *CBPResult {
    // Total fixed cost (yearly)
    totalFixedCost := 0.0
    for _, fc := range kos.FixedCosts {
        totalFixedCost += fc.Amount
    }
    
    // Total variable cost (monthly per room)
    totalVariableCost := 0.0
    for _, vc := range kos.VariableCosts {
        totalVariableCost += vc.Amount
    }
    
    // Monthly fixed cost per room
    monthlyFixedPerRoom := totalFixedCost / float64(input.DepreciationYears) / 12 / float64(kos.TotalRooms)
    
    // Adjusted for occupancy
    adjustedOccupancy := math.Max(input.OccupancyRate/100, 0.01)
    unitCost := (monthlyFixedPerRoom / adjustedOccupancy) + totalVariableCost
    
    // Apply markup
    markupMultiplier := 1 + (input.ExpectedProfit / 100)
    recommendedPrice := unitCost * markupMultiplier
    
    return &CBPResult{
        TotalFixedCost:    totalFixedCost,
        TotalVariableCost: totalVariableCost,
        UnitCost:          unitCost,
        FloorPrice:        unitCost,
        RecommendedPrice:  math.Round(recommendedPrice/50000) * 50000,
        OccupancyRate:     input.OccupancyRate,
    }
}
```

---

This specification provides a complete blueprint for implementing the backend API. The frontend in this repository is already set up with mock implementations that match these API contracts.
