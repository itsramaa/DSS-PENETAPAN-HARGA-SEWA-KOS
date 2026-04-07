# Quick Reference Guide

## Features at a Glance

| Feature | Location | Status | How to Use |
|---------|----------|--------|-----------|
| **Dark Mode** | App-wide | ✅ Complete | System respects OS preference, auto-switches |
| **Kos Cards** | /kos | ✅ Complete | Click eye icon to view detail page |
| **Detail Page** | /kos/[id] | ✅ Complete | View all kos information and statistics |
| **Statistics Charts** | /kos/[id]/statistics tab | ✅ Complete | 4 tabs: Costs, Occupancy, Facilities, Pricing |
| **Data Validation** | /kos/[id] | ✅ Complete | Auto-checks for missing required fields |
| **Blocking Cards** | /kos/[id] | ✅ Complete | Shows what's needed for calculations |
| **Quick Calculations** | /kos/[id] | ✅ Complete | One-click AHP, CBP, or combined calculation |
| **API Keys** | /api-keys | ✅ Complete | Manage permanent & temporary keys with status |
| **Reports** | /reports | ✅ Complete | View comprehensive analysis reports |

## File Structure

```
components/
├── app-sidebar.tsx                 # Main sidebar navigation
├── kos-detail-statistics.tsx       # ⭐ Statistics visualization
├── calculation-blocking-card.tsx   # ⭐ Data validation blocker
├── api-key-card.tsx                # ⭐ API key display
└── detailed-report-view.tsx        # ⭐ Report generation

lib/
├── api-mock.ts                     # API mock data
├── api-key-utils.ts                # ⭐ API key utilities
├── format.ts                       # Format utilities (with maskApiKey)
├── validation.ts                   # ⭐ Data validation logic
├── theme-context.tsx               # Theme management
└── providers.tsx                   # App providers (FIXED - includes ThemeProvider)

app/(dashboard)/
├── kos/
│   ├── page.tsx                    # Kos list with cards & eye icon
│   └── [id]/page.tsx               # Detail page with statistics
├── api-keys/page.tsx               # API key management
└── reports/page.tsx                # Reports page

types/index.ts                      # ⭐ Enhanced type definitions
```

## Component Props Reference

### KosDetailStatistics
```tsx
<KosDetailStatistics 
  kos={KosData}
  ahpResult?: AHPResult
  cbpResult?: CBPResult
/>
```

### CalculationBlockingCard
```tsx
<CalculationBlockingCard 
  type="AHP" | "CBP"
  kosId={string}
  missingFields={string[]}
/>
```

### ApiKeyCard
```tsx
<ApiKeyCard 
  apiKey={ApiKeyInfo}
  onRevoke={() => void}
  onCopy={() => void}
/>
```

### DetailedReportView
```tsx
<DetailedReportView 
  reportData={DetailedReportData}
  onExport={() => void}
/>
```

## Common Tasks

### Add Dark Mode to New Component
```tsx
className="dark:bg-gray-950 dark:text-gray-100"
```

### Validate Kos Data Before Calculation
```tsx
import { validateKosForAHP, validateKosForCBP } from '@/lib/validation'

const ahpValid = validateKosForAHP(kos)
const cbpValid = validateKosForCBP(kos)
```

### Format API Key for Display
```tsx
import { maskApiKey } from '@/lib/format'

const masked = maskApiKey(apiKey) // xxx•••xxx
```

### Get API Key Status
```tsx
import { getApiKeyStatus, getDaysUntilExpiry } from '@/lib/api-key-utils'

const status = getApiKeyStatus(apiKey)
const days = getDaysUntilExpiry(apiKey)
```

### Navigate to Kos Detail
```tsx
import Link from 'next/link'

<Link href={`/kos/${kosId}`}>View Details</Link>
```

## Type Definitions

### KosData
```typescript
interface KosData {
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
```

### ApiKey
```typescript
interface ApiKey {
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
```

### Validation Types
```typescript
interface KosValidation {
  isValid: boolean
  errors: ValidationError[]
  missingMandatoryFields: string[]
  canCalculateAHP: boolean
  canCalculateCBP: boolean
}
```

## CSS Dark Mode Classes

```
Light          Dark
bg-white       dark:bg-gray-950
bg-gray-50     dark:bg-gray-900
text-gray-900  dark:text-gray-100
text-gray-500  dark:text-gray-400
border-purple  dark:border-purple-900
```

## Icons Used

- `Eye` - View/Detail link
- `Building2` - Kos icon
- `Calculator` - AHP/Calculation
- `DollarSign` - CBP/Pricing
- `TrendingUp` - Statistics
- `BarChart3` - Revenue chart
- `AlertTriangle` - Blocking/Warning

## Testing Checklist

- [ ] Dark mode works across all pages
- [ ] Kos cards have clickable eye icon
- [ ] Detail page loads statistics
- [ ] Blocking card appears for incomplete data
- [ ] Quick calculation buttons work
- [ ] API keys display correctly
- [ ] Reports generate and export
- [ ] All types are type-safe
- [ ] No console errors

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `useTheme outside provider` | ThemeProvider not wrapping app | ✅ Already fixed in providers.tsx |
| `Component not found` | Missing import | Add import statement |
| `Type error` | Wrong prop type | Check type definition in types/index.ts |
| `Dark mode not working` | Missing `dark:` class | Add dark: variants to classNames |
| `Chart not rendering` | Missing recharts | `npm install recharts` |

## Performance Tips

1. Use `useMemo` for expensive calculations (done in KosDetailStatistics)
2. Lazy load large charts with skeleton loading
3. Use `useQuery` for data fetching with caching
4. Memoize chart color arrays
5. Optimize re-renders with proper dependencies

## Next Steps

1. Connect to real API endpoints
2. Implement file uploads for kos images
3. Add export to PDF for reports
4. Set up email notifications for alerts
5. Implement user preferences storage
6. Add advanced filtering and search
7. Create dashboard analytics
8. Set up performance monitoring
