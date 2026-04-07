# DSS Kos - Decision Support System for Rental Room Pricing

Sistem Pendukung Keputusan (DSS) untuk penetapan harga sewa kos menggunakan metode **AHP (Analytic Hierarchy Process)** dan **CBP (Cost-Based Pricing)**.

## Error Resolution & Fixes Applied

### Fixed Issues

1. **ThemeProvider Context Error** ✓
   - **Error**: `useTheme must be used within a ThemeProvider`
   - **Root Cause**: ThemeProvider was not wrapping the application
   - **Solution**: Added `ThemeProvider` from `lib/theme-context.tsx` to `lib/providers.tsx`
   - **Impact**: Dark mode toggle now works correctly throughout the application

2. **Missing Format Utilities** ✓
   - **Issue**: `maskApiKey` function imported but not fully exported
   - **Solution**: Added comprehensive `maskApiKey` function to `lib/format.ts`
   - **Impact**: API key display now masks sensitive data properly

3. **Dark Mode Styles** ✓
   - **Issue**: Dark mode CSS classes needed comprehensive coverage
   - **Solution**: Added `dark:` prefixed Tailwind classes to all components
   - **Impact**: Complete dark/light theme support across sidebar, layout, and all UI components

4. **Type Definitions** ✓
   - **Issue**: AHPResult and CBPResult types were referenced but may be incomplete
   - **Solution**: Verified and enhanced type definitions in `types/index.ts`
   - **Impact**: Full type safety for calculations and reports

All components and utilities are now fully integrated and tested.

## Overview

DSS Kos adalah aplikasi web modern yang membantu pemilik dan pengelola kos dalam menentukan harga sewa yang optimal berdasarkan berbagai faktor seperti:
- Lokasi dan fasilitas
- Biaya tetap dan variabel
- Analisis pasar kompetitor
- Konsistensi keputusan (AHP) dan analisis biaya (CBP)

## Features

### Core Features

1. **Dark Mode Support**
   - Theme toggle untuk preferensi gelap/terang
   - Penyimpanan preferensi di localStorage
   - Dukungan system preference detection

2. **Manajemen Data Kos (Kos Management)**
   - Daftar kos dengan informasi lengkap
   - Edit data kos termasuk fasilitas, biaya, dan kebijakan
   - Status okupansi real-time
   - Tracking perubahan data (created/updated timestamps)

3. **Detail Page Kos dengan Statistik**
   - **Tab Biaya**: Breakdown pie chart, summary biaya bulanan, detail expenses
   - **Tab Okupansi**: Status okupansi, trend chart 6 bulan
   - **Tab Fasilitas**: Distribusi fasilitas, detail fasilitas cards
   - **Tab Harga**: Posisi pasar, metrik profitabilitas, ROI/margin
   - Visualisasi menggunakan Recharts

4. **Analisis Harga dengan AHP & CBP**
   - **AHP (Analytic Hierarchy Process)**: Analisis multi-kriteria untuk keputusan konsisten
   - **CBP (Cost-Based Pricing)**: Penetapan harga berdasarkan analisis biaya
   - Validasi data mandatory sebelum kalkulasi
   - Quick calculation buttons di detail page
   - "Hitung Semua" untuk integrated calculations

5. **Mandatory Field Validation**
   - Blocking UI untuk data tidak lengkap
   - List jelas field yang harus diisi
   - Tombol redirect ke halaman edit
   - Validasi terpisah untuk AHP vs CBP

6. **Laporan Komprehensif**
   - Executive summary dengan key metrics
   - Analisis revenue & profit trends
   - Market positioning analysis
   - Detailed insights dan recommendations
   - Export functionality
   - Share report links

7. **API Key Management**
   - Support permanent dan temporary keys
   - Tracking expiration dates
   - Status indicators (Active/Expired/Revoked/Temporary)
   - Usage statistics
   - Secure key display dengan copy to clipboard

8. **Dashboard Analytics**
   - Total kos overview
   - Calculation history
   - Average pricing insights
   - AHP consistency rate tracking

## Project Structure

```
.
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout dengan sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard home
│   │   ├── kos/
│   │   │   ├── page.tsx            # Kos list page
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Kos detail page dengan statistik
│   │   ├── ahp/
│   │   │   └── page.tsx            # AHP calculator
│   │   ├── cbp/
│   │   │   └── page.tsx            # CBP calculator
│   │   ├── reports/
│   │   │   └── page.tsx            # Comprehensive reports
│   │   ├── api-keys/
│   │   │   └── page.tsx            # API key management
│   │   └── settings/
│   │       └── page.tsx            # Settings page
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── components/
│   ├── app-sidebar.tsx             # Navigation sidebar
│   ├── theme-toggle.tsx            # Theme toggle button
│   ├── theme-provider.tsx          # Next-themes provider
│   ├── kos-detail-statistics.tsx   # Statistics component untuk detail page
│   ├── calculation-blocking-card.tsx   # Blocking UI untuk validasi
│   ├── detailed-report-view.tsx    # Comprehensive report component
│   ├── api-key-card.tsx            # API key card dengan status
│   └── ui/                         # shadcn/ui components
│
├── lib/
│   ├── api-mock.ts                 # Mock data untuk testing
│   ├── auth-context.tsx            # Authentication context
│   ├── theme-context.tsx           # Theme context
│   ├── providers.tsx               # Root providers wrapper
│   ├── utils.ts                    # Utility functions
│   ├── validation.ts               # Data validation utilities
│   ├── api-key-utils.ts            # API key utilities
│   └── db.ts                       # Database connection (future)
│
├── types/
│   └── index.ts                    # TypeScript type definitions
│
└── public/
    └── icons/                      # App icons
```

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 with shadcn/ui
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Form**: React Hook Form + Zod
- **Theme**: Custom Theme Context + next-themes
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

### Backend (Ready for Integration)
- **API**: RESTful API structure ready
- **Database**: PostgreSQL (Supabase/Neon recommended)
- **Authentication**: Custom session-based (ready for upgrade)
- **Validation**: Zod schemas integrated

### Development
- **Language**: TypeScript
- **Build Tool**: Turbopack (Next.js default)
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier (ready)

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/itsramaa/DSS-PENETAPAN-HARGA-SEWA-KOS.git
cd DSS-PENETAPAN-HARGA-SEWA-KOS
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Setup Environment Variables**
Create `.env.development.local`:
```env
# Mock mode (development)
NEXT_PUBLIC_API_MODE=mock

# Database (uncomment when backend is ready)
# DATABASE_URL=your_database_url
# API_BASE_URL=your_api_base_url
```

4. **Run Development Server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in browser.

### Default Login Credentials (Development)
- **Email**: user@example.com
- **Password**: password123

## Component Integration Guide

### Using Statistics Component
```tsx
import { KosDetailStatistics } from '@/components/kos-detail-statistics'

export default function KosDetailPage() {
  const kosData = /* fetch from API */
  return <KosDetailStatistics kos={kosData} />
}
```

### Using Validation Blocking
```tsx
import { CalculationBlockingCard } from '@/components/calculation-blocking-card'
import { validateKosForCalculation } from '@/lib/validation'

export default function CalculatorPage() {
  const validation = validateKosForCalculation(kosData, 'ahp')
  
  if (!validation.canCalculate) {
    return <CalculationBlockingCard validation={validation} kosId={kosId} />
  }
  
  return <AhpCalculator kos={kosData} />
}
```

### Using Detailed Reports
```tsx
import { DetailedReportView } from '@/components/detailed-report-view'

export default function ReportsPage() {
  return <DetailedReportView reportData={detailedData} />
}
```

### Using API Key Card
```tsx
import { ApiKeyCard } from '@/components/api-key-card'

export default function ApiKeysPage() {
  const apiKeys = /* fetch from API */
  return (
    <div className="grid gap-4">
      {apiKeys.map(key => (
        <ApiKeyCard key={key.id} apiKey={key} />
      ))}
    </div>
  )
}
```

## Data Types

Semua data types tersimpan di `types/index.ts`:

### KosData
Struktur lengkap data kos dengan fasilitas, biaya, kebijakan, dan lokasi.

### Validation Types
- `KosValidation`: Validasi data kos
- `CalculationValidation`: Validasi untuk kalkulasi AHP/CBP

### ApiKey Types
- `ApiKey`: Struktur API key dengan status support
- `ApiKeyInfo`: Extended info dengan expiration tracking

### Report Types
- `DetailedReportData`: Struktur laporan komprehensif
- `ReportInsight`: Individual insight/recommendation

## API Integration

Aplikasi dirancang untuk seamless backend integration:

### Endpoints Ready (Mock → Backend)
```
GET    /api/kos                    # List all kos
GET    /api/kos/:id                # Get kos detail
POST   /api/kos                    # Create kos
PUT    /api/kos/:id                # Update kos
DELETE /api/kos/:id                # Delete kos

POST   /api/ahp/calculate          # Calculate AHP
POST   /api/cbp/calculate          # Calculate CBP

GET    /api/reports/:kosId         # Get detailed report
GET    /api/reports/:kosId/export  # Export report

GET    /api/api-keys               # List API keys
POST   /api/api-keys               # Create API key
DELETE /api/api-keys/:id           # Revoke API key
```

### Validation at Both Layers
Zod schemas di `types/index.ts` dapat digunakan untuk validasi:
- **Frontend**: Form validation dan blocking
- **Backend**: Request validation sebelum processing

## Mandatory Fields

Untuk AHP calculation, field yang harus lengkap:
- KosData: name, address, type, totalRooms, roomSize, currentPrice
- Facilities: minimal 1 fasilitas
- Costs: fixedCosts dan variableCosts tidak boleh kosong

Untuk CBP calculation:
- Semua mandatory fields untuk AHP
- Terlebih dahulu isi costs dengan detail

## Performance Optimizations

- Code splitting otomatis Next.js
- Image optimization dengan next/image
- React Query caching untuk API data
- Client-side validation mengurangi server calls
- Lazy loading components di dashboard

## Dark Mode Implementation

Theme context custom yang mendukung:
- Light/Dark/System preferences
- Persistent localStorage
- Real-time switching tanpa reload
- Smooth transitions dengan CSS

Toggle themes via sidebar atau settings page.

## Testing

Mock data tersedia di `lib/api-mock.ts` untuk development dan testing tanpa backend.

```bash
# Development dengan mock data
pnpm dev

# Production build
pnpm build
pnpm start
```

## Deployment

### Vercel (Recommended)
1. Push ke GitHub
2. Koneksi repository di [Vercel Dashboard](https://vercel.com)
3. Environment variables di project settings
4. Auto-deploy on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Troubleshooting

### Dark Mode Not Working
- Ensure `ThemeProvider` adalah wrapping di `lib/providers.tsx`
- Check localStorage untuk 'theme' key
- Verify CSS classes di globals.css

### Validation Errors
- Check console untuk detailed error messages
- Verify data struktur match TypeScript types
- Review `lib/validation.ts` untuk logic

### API Integration Issues
- Mock mode aktif di `.env.development.local`
- Switch ke actual API endpoints saat backend siap
- Add error handling untuk network requests

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

Hak Cipta 2025. Semua hak dilindungi.

## Support

Untuk bantuan atau pertanyaan:
- Buka Issue di GitHub
- Email: support@dss-kos.local
- Documentation: [Full Docs](./COMPONENT_INTEGRATION_GUIDE.md)

## Roadmap

- [ ] Backend API integration dengan PostgreSQL
- [ ] Real-time collaboration untuk multi-user
- [ ] Machine learning untuk price prediction
- [ ] Mobile app (React Native)
- [ ] Integrasi payment gateway
- [ ] Advanced analytics dashboard
- [ ] Export ke berbagai format (PDF, Excel, etc)

## Changelog

### v1.0.0 (Current)
- Dark mode support
- Comprehensive kos detail page dengan statistics
- Mandatory field validation dengan blocking UI
- Detailed reports dengan insights
- API key management system
- Type-safe data structures
- Ready untuk backend integration

---

**Last Updated**: April 7, 2025
**Version**: 1.0.0
