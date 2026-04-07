# User Guide - New Features

## 1. Dark Mode Settings

### Accessing Theme Settings
1. Click the Settings tab in the left sidebar (Desktop) or bottom navigation (Mobile)
2. Click on the "Tema" tab
3. Choose your preferred theme:
   - **Light**: Bright theme for daytime use
   - **Dark**: Dark theme for nighttime use
   - **System**: Automatically follows your device settings

### Visual Indicators
- Selected theme shows a purple dot indicator
- Cards display visual representations of each theme option
- Theme change applies instantly across the entire application

**Mobile Tip**: On mobile devices, the Settings button is in the bottom navigation bar.

---

## 2. Kos Detail Page with Statistics

### Viewing Kos Details
1. Go to the "Kos" page
2. Click the eye icon (👁️) on any kos card OR click the card itself
3. You'll be taken to the detail page for that kos

### Exploring Statistics
The Statistics tab shows 4 sub-sections:

#### Biaya (Costs)
- Pie chart showing cost breakdown by category
- Monthly cost summary table
- Detailed expense list

#### Okupansi (Occupancy)
- 6-month occupancy trend line chart
- Current occupancy status
- Percentage metrics

#### Fasilitas (Facilities)
- Bar chart comparing facility counts by category
- Detailed facility cards with descriptions
- Facility availability status

#### Harga (Pricing)
- Market position comparison
- Competitor pricing analysis
- Profitability metrics (ROI, margin)
- Pricing strategy recommendations

**Tip**: All charts update in real-time as you modify kos data.

---

## 3. Mandatory Field Validation

### What Happens When Data is Incomplete

If you try to perform a calculation and required data is missing:

1. A **Blocking Card** appears showing:
   - Which calculation is blocked (AHP or CBP)
   - List of missing mandatory fields
   - A red warning banner

2. Click "Lengkapi Data" (Complete Data) button to:
   - Navigate to the form to fill missing fields
   - See exactly what needs to be completed

### Required Fields

**For AHP Calculation**:
- Kos name
- Address
- Facilities (at least 1 in each category)

**For CBP Calculation**:
- Kos name
- Address
- Fixed costs (at least 1)
- Variable costs (at least 1)
- Current price

---

## 4. Quick Calculation Features

### Calculation Buttons
Located in the "Perhitungan Cepat" (Quick Calculation) section:

1. **Hitung AHP**: Calculate price using Analytic Hierarchy Process
   - Uses default AHP criteria
   - Results displayed in toast notification

2. **Hitung CBP**: Calculate price using Cost-Based Pricing
   - Calculates based on cost structure
   - Shows recommended price

3. **Hitung Semua**: Calculate both methods
   - Runs AHP and CBP simultaneously
   - Compares both results
   - Provides integration recommendation

### Using Calculations
- Buttons are disabled if required data is missing
- Click on blocking card to complete missing data first
- Results are saved automatically
- View calculation history in reports section

---

## 5. Reports Page

### Accessing Reports
1. From any detail page, click the "Laporan" tab
2. Or navigate via Sidebar → Reports

### Report Sections

#### Ringkasan Eksekutif (Executive Summary)
- Key metrics in card format
- Revenue, occupancy, margin percentages
- ROI calculations

#### Analisis (Analysis)
- Revenue trends over time
- Cost distribution breakdown
- Detailed performance metrics

#### Harga (Pricing Analysis)
- Market positioning
- Competitor comparison
- CBP pricing analysis
- Profitability breakdown

#### Wawasan (Insights)
- Dynamic insights based on your data
- Color-coded severity (positive/warning)
- Actionable recommendations

#### Rekomendasi (Recommendations)
- Numbered action items
- Based on analysis results
- Implementation-ready suggestions

### Export & Share
- Download report as PDF or JSON
- Share report via link
- Print-friendly formatting

---

## 6. API Key Management

### Accessing API Keys
1. Go to Settings page
2. Navigate to appropriate tab for API management
3. View all your API keys

### Key Types

**Permanent Keys**
- Never expire
- Suitable for production services
- Require careful security practices

**Temporary Keys**
- Have expiration dates
- Safer for short-term access
- Auto-expire after set period

### Key Status Indicators

- **Active**: Key is valid and can be used
- **Expired**: Key has passed expiration date (not usable)
- **Revoked**: Key has been manually disabled
- **Temporary**: Key has an expiration date

### Using API Keys

1. **View Key**: Click eye icon to reveal full key
2. **Copy Key**: Click copy button for clipboard
3. **Check Expiration**: See days remaining for temporary keys
4. **Create New**: Click "New API Key" button
5. **Revoke Key**: Click more options to revoke when needed

### Security Best Practices
- Keep permanent keys secure and private
- Rotate temporary keys regularly
- Revoke keys immediately if compromised
- Use different keys for different services
- Never share keys in version control

---

## 7. Mobile App Experience

### Bottom Navigation (Mobile Only)
On mobile devices, the app switches to bottom navigation:

- **Dashboard**: Main overview page
- **Kos**: Kos data management
- **AHP**: AHP calculator
- **CBP**: CBP calculator  
- **Setelan**: Settings and preferences

### Mobile-Optimized Features
- Single-column card layout on phones
- Two-column layout on tablets
- Full sidebar on desktop
- Touch-friendly button sizing
- Optimized dialogs for small screens
- Automatic responsive spacing

### Mobile Tips
- Swipe to navigate between sections
- Tap cards to see full details
- Use bottom nav for quick access
- Landscape mode for better charts visibility

---

## 8. Font and Visual Improvements

### Font Changes
- **Body Text**: Poppins (clean, modern)
- **Headings**: Montserrat (bold, distinctive)
- All weights optimized for readability

### Visual Enhancements
- Improved spacing for mobile devices
- Better contrast in dark mode
- Larger touch targets on mobile
- Optimized chart rendering
- Smooth transitions and animations

---

## 9. Responsive Design

### Desktop View (> 1024px)
- Full sidebar navigation
- 3-column card grids
- Large padding and spacing
- All features visible

### Tablet View (768px - 1024px)
- Hidden sidebar (swipe to show)
- 2-column card grids
- Balanced padding
- Optimized form layouts

### Mobile View (< 768px)
- Bottom navigation only
- 1-column card grids
- Reduced padding for space
- Stacked forms and dialogs
- Touch-optimized controls

---

## 10. Tips & Tricks

### Keyboard Shortcuts
- Tab: Navigate through form fields
- Enter: Submit forms
- Esc: Close dialogs/modals

### Dark Mode Tips
- Dark mode reduces eye strain at night
- Switch to Light mode in bright environments
- System mode auto-adapts to your OS preference

### Data Management
- Always verify data before calculations
- Use blocking cards to identify missing information
- Check reports regularly for insights
- Export data for backups

### Performance
- Charts load faster with complete data
- Filter searches to narrow results
- Mobile app lighter on data usage
- Calculations process instantly

---

## Troubleshooting

### Theme Not Changing
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check browser dark mode preference

### Calculations Blocked
- Review the blocking card for missing fields
- Click "Lengkapi Data" to complete information
- Ensure all mandatory fields are filled

### Mobile Navigation Issues
- Ensure device width is less than 768px
- Check if sidebar should appear on your screen size
- Try landscape orientation for better view

### Reports Not Showing
- Ensure kos data is complete
- Run calculations first
- Check report generation settings

---

For more technical details, see `FINAL_IMPLEMENTATION_STATUS.md`
