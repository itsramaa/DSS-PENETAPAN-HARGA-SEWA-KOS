# DSS Kos - Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah umum dan error yang mungkin terjadi saat mengembangkan atau menjalankan DSS Kos.

## Common Issues & Solutions

### 1. Theme Provider Context Errors

#### Error
```
Error: useTheme must be used within a ThemeProvider
at useTheme (lib/theme-context.tsx:66:11)
at ThemeToggle (components/theme-toggle.tsx:14:54)
```

#### Cause
Component menggunakan `useTheme()` hook tetapi tidak dibungkus dengan `ThemeProvider`.

#### Solution
Pastikan `ThemeProvider` ada di `lib/providers.tsx`:

```tsx
// lib/providers.tsx
import { ThemeProvider } from './theme-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

---

### 2. Dark Mode Not Working

#### Symptoms
- Dark mode toggle tidak berfungsi
- Styling gelap tidak muncul saat switch theme
- localStorage 'theme' key tidak tersimpan

#### Diagnosis
1. Buka DevTools → Console
2. Check: `localStorage.getItem('theme')`
3. Check: `document.documentElement.classList` (harus ada 'dark')
4. Inspect element dan verify dark: class ada

#### Solutions

**A. Check Theme Provider**
```tsx
// lib/theme-context.tsx harus export ThemeProvider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // ... implementation
}
```

**B. Verify CSS in globals.css**
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... other dark variables */
}
```

**C. Check Sidebar Dark Classes**
```tsx
// components/app-sidebar.tsx
className="dark:border-purple-900/50 dark:from-gray-950 dark:to-purple-950/30"
```

**D. Reset localStorage**
```javascript
// Di browser console
localStorage.removeItem('theme')
location.reload()
```

---

### 3. Missing Dependencies Errors

#### Error
```
Cannot find module '@/components/kos-detail-statistics'
Cannot find module 'recharts'
```

#### Solution

**A. Install Missing Packages**
```bash
pnpm install recharts
pnpm install @radix-ui/react-tabs
pnpm install @radix-ui/react-progress
```

**B. Verify package.json**
Pastikan dependencies ada:
```json
{
  "dependencies": {
    "recharts": "^2.15.0",
    "next-themes": "^0.4.6",
    "@radix-ui/react-tabs": "^1.1.13"
  }
}
```

**C. Clear Node Modules**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### 4. Type Errors: AHPResult/CBPResult Not Found

#### Error
```
Cannot find name 'AHPResult'
Cannot find name 'CBPResult'
```

#### Solution
Pastikan types sudah diimport di `types/index.ts`:

```tsx
// types/index.ts
export interface AHPResult {
  id: string
  kosId: string
  matrix: number[][]
  normalizedMatrix: number[][]
  eigenVector: number[]
  // ... more fields
}

export interface CBPResult {
  id: string
  kosId: string
  totalFixedCost: number
  totalVariableCost: number
  // ... more fields
}
```

Update component imports:
```tsx
import type { AHPResult, CBPResult } from '@/types'
```

---

### 5. Chart Not Rendering

#### Error
- Recharts chart muncul blank/kosong
- No data error di console

#### Solution

**A. Verify Data Structure**
```tsx
// Data harus dalam format array of objects
const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
]

// ✓ Correct
<LineChart data={data}>
  <Line dataKey="value" />
</LineChart>

// ✗ Wrong - tidak akan render
<LineChart data={undefined}>
```

**B. Check dataKey**
```tsx
// dataKey harus match object key
<Bar dataKey="value" /> // 'value' harus ada di data object
```

**C. Use ResponsiveContainer**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

---

### 6. Validation Not Blocking Calculations

#### Issue
`CalculationBlockingCard` tidak muncul meski data tidak lengkap

#### Solution

**A. Check Validation Function**
```tsx
import { validateKosData } from '@/lib/validation'

const validation = validateKosData(kosData)
// Check: validation.canCalculateAHP, validation.canCalculateCBP
```

**B. Implement in Page**
```tsx
'use client'

import { CalculationBlockingCard } from '@/components/calculation-blocking-card'
import { validateKosData } from '@/lib/validation'

export default function AHPPage() {
  const kosData = /* fetch data */
  const validation = validateKosData(kosData)
  
  const ahpValidation = {
    canProceed: validation.canCalculateAHP,
    missingFields: validation.missingMandatoryFields,
    warnings: [],
  }
  
  return (
    <>
      <CalculationBlockingCard 
        kosId={kosId} 
        operation="ahp" 
        validation={ahpValidation} 
      />
      {ahpValidation.canProceed && <AHPCalculator />}
    </>
  )
}
```

**C. Verify Mandatory Fields**
Check `lib/validation.ts`:
```tsx
const AHP_MANDATORY_FIELDS = [
  'facilities',
  'nearbyPlaces', 
  'policies',
] as const
```

---

### 7. API Key Card Not Displaying Status

#### Issue
Status badge tidak muncul, atau key tidak ter-mask dengan benar

#### Solution

**A. Import Status Functions**
```tsx
import {
  enhanceApiKeyInfo,
  getStatusLabel,
  getStatusBadgeColor,
} from '@/lib/api-key-utils'
```

**B. Enhance API Key Data**
```tsx
const apiKey = /* from API */
const enhancedKey = enhanceApiKeyInfo(apiKey)

// Now has:
// - enhancedKey.status
// - enhancedKey.daysUntilExpiry
// - enhancedKey.isExpired
// - enhancedKey.isExpiringSoon
```

**C. Check Type Field**
```tsx
// API key must have 'type' field
interface ApiKey {
  type: 'permanent' | 'temporary'
  expiresAt: string | null
}
```

---

### 8. Toast Notifications Not Showing

#### Error
`toast()` function not working in components

#### Solution

**A. Import Toaster**
Di `lib/providers.tsx`:
```tsx
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {/* ... providers */}
      <Toaster position="top-right" richColors />
    </>
  )
}
```

**B. Use in Component**
```tsx
import { toast } from 'sonner'

export function MyComponent() {
  const handleClick = () => {
    toast.success('Success!')
    // atau
    toast.error('Error occurred')
    toast.loading('Loading...')
  }
}
```

---

### 9. Database/API Connection Issues

#### When Switching from Mock to Real API

1. **Update Environment Variables**
```env
# .env.development.local
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://...
```

2. **Update API Call Pattern**
```tsx
// Before (mock)
import { getMockKosList } from '@/lib/api-mock'

// After (real API)
async function getKosList() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kos`)
  return res.json()
}
```

3. **Add Error Handling**
```tsx
try {
  const data = await getKosList()
} catch (error) {
  console.error('API Error:', error)
  toast.error('Gagal mengambil data')
}
```

4. **Update Types**
Pastikan backend API response match dengan types di `types/index.ts`

---

### 10. Build Errors

#### Error: `Cannot find module`

**Solution:**
```bash
# Clear build cache
rm -rf .next
pnpm build
```

#### Error: `Type 'X' is not assignable to type 'Y'`

**Solution:**
1. Check type definition di `types/index.ts`
2. Verify property names dan types match exactly
3. Use `Partial<Type>` jika optional fields diperlukan

---

## Development Tools

### Debugging

**Browser Console**
```javascript
// Check theme
console.log(localStorage.getItem('theme'))
console.log(document.documentElement.classList)

// Check state
const [theme, setTheme] = useState('system')
console.log('[v0] Current theme:', theme)
```

**VS Code Debug**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Full Stack",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Performance Monitoring

**React DevTools**
- Monitor component renders
- Check hook state
- Inspect component tree

**Network Tab**
- Check API calls
- Monitor bundle size
- Check image optimization

---

## Performance Issues

### Slow Page Load

**Diagnosis:**
```bash
# Build analysis
pnpm build
pnpm analyze
```

**Solutions:**
1. Code splitting - implement dynamic imports
2. Image optimization - use next/image
3. Remove unused dependencies
4. Enable caching with React Query

### High Memory Usage

**Check:**
```bash
# Monitor process
node --inspect node_modules/next/dist/bin/next dev
```

**Solutions:**
1. Reduce mock data size
2. Implement pagination for large lists
3. Clear cache periodically

---

## Testing Checklist

Before deploying:

- [ ] Dark mode toggle works
- [ ] All forms validate correctly
- [ ] Blocking cards appear for incomplete data
- [ ] Charts render with data
- [ ] API key display masks sensitive data
- [ ] Reports generate without errors
- [ ] Navigation works in sidebar
- [ ] Responsive design on mobile
- [ ] Performance acceptable (<3s load)
- [ ] No console errors

---

## Support & Resources

- **Documentation**: [README.md](./README.md)
- **Component Guide**: [COMPONENT_INTEGRATION_GUIDE.md](./COMPONENT_INTEGRATION_GUIDE.md)
- **Issues**: GitHub Issues
- **Types**: [types/index.ts](./types/index.ts)
- **Utilities**: [lib/](./lib/)

---

## Quick Reference

### Common Commands
```bash
pnpm dev              # Start dev server
pnpm build           # Build for production
pnpm start           # Start prod server
pnpm lint            # Run ESLint
pnpm format          # Format code
```

### File Locations
```
lib/theme-context.tsx      - Theme management
lib/providers.tsx          - Root providers
lib/validation.ts          - Data validation
lib/api-key-utils.ts       - API key utilities
types/index.ts             - Type definitions
components/                - UI components
app/(dashboard)/           - App pages
```

---

**Last Updated**: April 7, 2025
**Version**: 1.0.0
