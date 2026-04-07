# User Flows & Feature Guide

## 1. Dark Mode Usage

**Where to Find**: Sidebar footer area (removed from sidebar for now, can be re-added with proper context)
**How It Works**: 
- System respects OS dark mode preference
- Theme is preserved across sessions via localStorage
- All UI components automatically adapt

## 2. Kos Card Interaction Flow

```
Dashboard -> Data Kos Page
    ↓
Grid of Kos Cards (Responsive: 1-3 columns)
    ↓
Card contains:
├─ Building Icon + Kos Name
├─ Address
├─ Room count & Size
├─ Facility badges
└─ Action Buttons:
   ├─ Eye Icon (View Details) → Kos Detail Page
   ├─ More Menu:
   │  ├─ Edit → Edit Dialog
   │  └─ Delete → Delete Confirmation
```

## 3. Kos Detail Page Flow

```
Kos Detail Page (/kos/[id])
│
├─ Header Section
│  ├─ Back Button
│  ├─ Kos Title, Address, Type
│  └─ Action Buttons (Edit, Delete)
│
├─ Validation Alert (if data incomplete)
│  └─ Shows missing fields with "Complete Data" button
│
├─ Blocking Cards (if data incomplete for calculation)
│  ├─ AHP Blocking Card (if no facilities)
│  └─ CBP Blocking Card (if no costs)
│
├─ Quick Calculation Actions
│  ├─ Calculate AHP (if valid)
│  ├─ Calculate CBP (if valid)
│  ├─ Calculate All (if both valid)
│  └─ Advanced links
│
├─ Stats Overview (4 cards)
│  ├─ Current Price
│  ├─ Available Rooms
│  ├─ Room Size
│  └─ Electricity Wattage
│
└─ Tabbed Content
   ├─ Overview Tab
   │  ├─ Facilities by category
   │  ├─ Policies & Rules
   │  ├─ Nearby Places
   │  └─ Owner Info
   │
   ├─ Statistics Tab ⭐ NEW
   │  ├─ Cost Breakdown (Pie Chart)
   │  ├─ Monthly Cost Summary (Bar Chart)
   │  ├─ Occupancy Trends (Line Chart)
   │  ├─ Facility Distribution (Bar Chart)
   │  ├─ Market Position (Comparison Chart)
   │  ├─ Profitability Metrics
   │  └─ Key Insights
   │
   ├─ Costs Tab
   │  ├─ Fixed Costs (Yearly)
   │  └─ Variable Costs (Monthly/Room)
   │
   └─ History Tab
      └─ Calculation History
```

## 4. Data Validation & Blocking Flow

```
User tries to Calculate (AHP/CBP)
    ↓
System checks mandatory fields:

For AHP:
├─ Name ✓
├─ Address ✓
├─ Type ✓
├─ Facilities (at least 1 from each category) ⚠️
└─ Room specifications ✓

For CBP:
├─ Name ✓
├─ Current Price ✓
├─ Fixed Costs (at least 1) ⚠️
└─ Variable Costs (at least 1) ⚠️

If missing → Show CalculationBlockingCard
    ↓
Card shows:
├─ Error icon
├─ Missing fields list
├─ "Complete Data" button linking to edit form
└─ Helpful hint

If all valid → Execute calculation
```

## 5. Statistics Visualization

The Statistics tab displays comprehensive charts:

### Biaya (Costs) Tab
- **Pie Chart**: Cost breakdown by category
- **Table**: Monthly cost summary with totals
- **Details**: Expanded cost listing

### Okupansi (Occupancy) Tab
- **Line Chart**: 6-month occupancy trend
- **Key Metric**: Current occupancy rate
- **Trend**: Up/Down indicator

### Fasilitas (Facilities) Tab
- **Bar Chart**: Facility distribution by category
- **Cards**: Detailed facility list by type

### Harga (Pricing) Tab
- **Comparison Chart**: Market position vs competitors
- **Metrics**: Profit margin, ROI, floor price
- **Strategy**: Pricing positioning indicator

## 6. API Key Management Flow

```
Settings -> API Keys
    ↓
Display API Keys Grid
├─ Each key shows:
│  ├─ Status badge (Active/Expired/Temporary)
│  ├─ Masked key (xxx•••xxx format)
│  ├─ Copy button
│  ├─ Toggle show/hide
│  ├─ Last used date
│  ├─ Expiration date
│  ├─ Days until expiry
│  ├─ Permission list
│  └─ Usage counter
│
└─ Actions:
   ├─ Create new key
   ├─ Revoke existing key
   └─ Manage permissions
```

## 7. Report Generation Flow

```
Reports Page (/reports)
    ↓
Display Available Reports
├─ Executive Summary
│  ├─ Total Revenue
│  ├─ Average Occupancy
│  ├─ Avg Profit Margin
│  └─ Overall Score
│
├─ Per-Kos Analysis
│  ├─ Kos Overview
│  ├─ Revenue & Cost Breakdown
│  ├─ Occupancy Analysis
│  └─ Pricing Analysis
│
├─ Market Intelligence
│  ├─ Competitor Analysis
│  ├─ Price Positioning
│  └─ Market Trends
│
├─ Insights & Recommendations
│  ├─ Dynamic insights based on data
│  ├─ Actionable recommendations
│  └─ Risk alerts
│
└─ Export Options
   ├─ Download as PDF
   ├─ Export as JSON
   └─ Share via link
```

## 8. Error Handling

All features include proper error handling:

- **Validation Errors**: Show field-level messages
- **API Errors**: Show user-friendly toast notifications
- **Loading States**: Skeleton loaders while fetching
- **Empty States**: Helpful messages when no data
- **Fallbacks**: Graceful degradation

## Dark Mode Support

All components properly support dark mode:
- Background colors adjust (`dark:bg-gray-950`, `dark:bg-gray-900`, etc.)
- Text colors invert (`dark:text-gray-100`)
- Border colors adjust (`dark:border-purple-900/50`)
- Component-specific dark colors for badges and cards

## Responsive Design

All features are responsive:
- Mobile: Full width, stacked layout
- Tablet: 2-column grid for cards
- Desktop: 3-column grid for cards, 2-column for detail sections
- Charts: Responsive container with auto-scaling

## Accessibility

Features include:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Screen reader support

## Performance Optimizations

- Lazy loading of large components
- Skeleton loaders for better UX
- Memoized chart calculations
- Efficient re-renders
- Image optimization
