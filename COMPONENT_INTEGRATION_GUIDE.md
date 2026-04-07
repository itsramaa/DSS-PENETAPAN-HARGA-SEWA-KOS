# Component Integration Guide

This guide explains how to integrate the newly created components into your existing pages.

## 1. KosDetailStatistics Component

### Location
`/components/kos-detail-statistics.tsx`

### Purpose
Display comprehensive statistics and charts for a specific kos property.

### Integration into Detail Page

In `/app/(dashboard)/kos/[id]/page.tsx`, add this import:

```typescript
import { KosDetailStatistics } from '@/components/kos-detail-statistics'
```

Then, in your tabs section (after the overview tab), add:

```tsx
<TabsContent value="statistics" className="space-y-6">
  <KosDetailStatistics 
    kos={kos}
    ahpResult={statistics?.ahpResult}
    cbpResult={statistics?.cbpResult}
  />
</TabsContent>
```

### Props

```typescript
interface KosDetailStatisticsProps {
  kos: KosData
  ahpResult?: AHPResult          // Optional AHP calculation result
  cbpResult?: CBPResult          // Optional CBP calculation result
}
```

### Tabs Available
- **Biaya**: Cost breakdown and profitability metrics
- **Okupansi**: Occupancy rates and trends
- **Fasilitas**: Facility distribution charts
- **Harga**: Market positioning and pricing analysis

---

## 2. CalculationBlockingCard Component

### Location
`/components/calculation-blocking-card.tsx`

### Purpose
Display a blocking card when mandatory fields are missing for calculations.

### Integration into Detail Page

Add import:
```typescript
import { CalculationBlockingCard } from '@/components/calculation-blocking-card'
```

Then use in your calculations section:

```tsx
{validation && !validation.canProceed && (
  <CalculationBlockingCard 
    kosId={id}
    operation="both"
    validation={validation}
  />
)}
```

### Props

```typescript
interface CalculationBlockingCardProps {
  kosId: string                    // ID of the kos property
  operation: 'ahp' | 'cbp' | 'both'  // Type of calculation being blocked
  validation: CalculationValidation  // Validation result from validateXXXInput()
  title?: string                   // Optional custom title
  description?: string             // Optional custom description
}
```

### Usage Example

```typescript
// For AHP blocking
const ahpValidation = validateAHPInput(ahpInput)
<CalculationBlockingCard 
  kosId={id}
  operation="ahp"
  validation={ahpValidation}
  title="Tidak Bisa Hitung AHP"
  description="Lengkapi data fasilitas terlebih dahulu"
/>

// For CBP blocking
const cbpValidation = validateCBPInput(cbpInput)
<CalculationBlockingCard 
  kosId={id}
  operation="cbp"
  validation={cbpValidation}
/>
```

---

## 3. DetailedReportView Component

### Location
`/components/detailed-report-view.tsx`

### Purpose
Comprehensive report view with analysis, pricing, insights, and recommendations.

### Integration into Reports Page

In `/app/(dashboard)/reports/page.tsx`, add import:

```typescript
import { DetailedReportView } from '@/components/detailed-report-view'
```

Then add a dialog or modal to show the report:

```tsx
<Dialog open={selectedReport !== null}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Detail Laporan</DialogTitle>
    </DialogHeader>
    {selectedReport && (
      <DetailedReportView 
        kos={selectedReport.kos}
        integrationResult={selectedReport.integrationResult}
        onExport={(format) => {
          console.log('Export as:', format)
          toast.success(`Laporan di-export sebagai ${format.toUpperCase()}`)
        }}
        onShare={() => {
          toast.success('Link laporan disalin ke clipboard')
        }}
      />
    )}
  </DialogContent>
</Dialog>
```

### Props

```typescript
interface DetailedReportViewProps {
  kos: KosData
  integrationResult?: IntegrationResult  // Optional integration result
  onExport?: (format: 'pdf' | 'json') => void  // Export handler
  onShare?: () => void                   // Share handler
}
```

### Tabs Available
- **Analisis**: Revenue trends and cost distribution
- **Harga**: Market positioning and pricing analysis
- **Wawasan**: Dynamic insights based on metrics
- **Rekomendasi**: Actionable recommendations

---

## 4. ApiKeyCard Component

### Location
`/components/api-key-card.tsx`

### Purpose
Display individual API key with status, expiration info, and management actions.

### Integration into API Keys Page

In `/app/(dashboard)/api-keys/page.tsx`, update the display section:

```typescript
import { ApiKeyCard } from '@/components/api-key-card'
```

Then replace your API key display with:

```tsx
<div className="grid gap-4 lg:grid-cols-2">
  {apiKeys?.map((apiKey) => (
    <ApiKeyCard
      key={apiKey.id}
      apiKey={apiKey}
      onDelete={(id) => {
        // Handle deletion
        deleteMutation.mutate(id)
      }}
      onRefresh={(id) => {
        // Handle refresh/regeneration
        refreshMutation.mutate(id)
      }}
      onCopy={(key) => {
        // Optional: Track copy events
        console.log('API key copied')
      }}
    />
  ))}
</div>
```

### Props

```typescript
interface ApiKeyCardProps {
  apiKey: ApiKey                        // The API key to display
  onDelete?: (id: string) => void       // Delete handler
  onRefresh?: (id: string) => void      // Refresh handler
  onCopy?: (key: string) => void        // Copy handler
}
```

### Features Displayed
- Key status with visual indicator
- Masked key display with show/hide toggle
- Permissions list
- Usage statistics and last used time
- Creation and expiration dates
- Expiration warnings and alerts
- Action menu for copy, refresh, delete

---

## 5. Validation Utilities

### Location
`/lib/validation.ts`

### Key Functions

#### validateKosData()
```typescript
const validation = validateKosData(kosData)
if (!validation.isValid) {
  console.log('Errors:', validation.errors)
  console.log('Missing fields:', validation.missingMandatoryFields)
}
```

#### validateAHPInput()
```typescript
const validation = validateAHPInput(ahpInput)
if (validation.canProceed) {
  // Proceed with AHP calculation
}
```

#### validateCBPInput()
```typescript
const validation = validateCBPInput(cbpInput)
if (!validation.canProceed) {
  <CalculationBlockingCard 
    operation="cbp" 
    validation={validation}
  />
}
```

#### getMissingMandatoryFields()
```typescript
const missing = getMissingMandatoryFields(kosData, 'ahp')
if (missing.length > 0) {
  // Show which fields are missing for AHP
}
```

---

## 6. API Key Utilities

### Location
`/lib/api-key-utils.ts`

### Key Functions

#### getApiKeyStatus()
```typescript
const status = getApiKeyStatus(apiKey)
// Returns: 'active' | 'expired' | 'revoked' | 'temporary'
```

#### enhanceApiKeyInfo()
```typescript
const info = enhanceApiKeyInfo(apiKey)
// Adds: status, daysUntilExpiry, isExpired, isExpiringSoon
```

#### isExpiringsSoon()
```typescript
if (isExpiringsSoon(apiKey.expiresAt)) {
  // Show warning that key expires within 7 days
}
```

#### maskApiKey()
```typescript
const masked = maskApiKey(fullKey)
// Returns: 'kos_...abc123' (first 4, last 4 chars)
```

#### formatLastUsedTime()
```typescript
const timeStr = formatLastUsedTime(lastUsedAt)
// Returns: '5 menit yang lalu', 'Kemarin', '3 hari yang lalu', etc.
```

---

## Dark Mode Compatibility

All components are fully dark mode compatible using:
- `dark:` Tailwind prefix for dark-specific styles
- Semantic color variables from `globals.css`
- Proper contrast ratios for accessibility

No additional configuration needed - dark mode works automatically based on system preference or theme toggle.

---

## Integration Checklist

### For Detail Page Enhancement
- [ ] Import `KosDetailStatistics` component
- [ ] Add statistics tab to existing tabs
- [ ] Pass `kos`, `ahpResult`, `cbpResult` props
- [ ] Test all four tabs (Biaya, Okupansi, Fasilitas, Harga)
- [ ] Verify dark mode styling

### For Validation Blocking
- [ ] Import `CalculationBlockingCard` component
- [ ] Import validation functions from `lib/validation.ts`
- [ ] Add blocking card above calculation buttons
- [ ] Set correct operation type (ahp, cbp, or both)
- [ ] Test redirect to edit form works

### For Reports Page
- [ ] Import `DetailedReportView` component
- [ ] Create dialog/modal to display detailed report
- [ ] Pass `kos` and optional `integrationResult`
- [ ] Implement `onExport` and `onShare` handlers
- [ ] Test all four tabs

### For API Keys Page
- [ ] Import `ApiKeyCard` component
- [ ] Replace current API key display
- [ ] Implement delete handler
- [ ] Implement refresh handler
- [ ] Test show/hide toggle
- [ ] Test copy to clipboard

### Testing
- [ ] All components render without errors
- [ ] Dark mode styling works properly
- [ ] Responsive design on mobile/tablet
- [ ] Interactive elements are accessible
- [ ] Toast notifications appear correctly
- [ ] Links and buttons function as expected

---

## Common Issues & Solutions

### Issue: Component doesn't render
**Solution**: Ensure all required props are passed and types match

### Issue: Dark mode styles not applied
**Solution**: Check that your app uses the theme context and `dark:` prefix is in Tailwind config

### Issue: Charts not displaying
**Solution**: Ensure Recharts is installed and ResponsiveContainer has parent with defined height

### Issue: Validation not working
**Solution**: Import validation function correctly and pass the right object type

### Issue: API key mask not showing correctly
**Solution**: Ensure `ApiKey.maskedKey` field is populated correctly from backend

---

## Next: Backend Integration

Once integrated into the UI, connect to your backend:

1. **Validation**: Add server-side validation matching `validateKosData()` logic
2. **Reports**: Create API endpoint that generates `DetailedReportData`
3. **API Keys**: Implement secure key storage and status tracking
4. **Database**: Store all KosData, AHPResult, CBPResult, and IntegrationResult

All type definitions are ready in `/types/index.ts` for backend implementation.

---

**Last Updated**: 2026-04-07
**Status**: Ready for integration
