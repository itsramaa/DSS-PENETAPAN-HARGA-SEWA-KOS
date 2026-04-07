# Testing Checklist - All Features

## Dark Mode & Theme Settings

- [ ] Navigate to Settings page
- [ ] Click "Tema" tab
- [ ] Click "Light" theme - page should update to light mode
- [ ] Click "Dark" theme - page should update to dark mode  
- [ ] Click "System" theme - should follow device preferences
- [ ] Refresh page - theme selection should persist
- [ ] Check all text has proper contrast in both modes
- [ ] Verify charts display properly in both modes

## Kos Cards & Detail Page

- [ ] Open Kos page from navigation
- [ ] View list of kos cards
- [ ] Verify card displays: name, address, room count, room size
- [ ] Click eye icon on any card - should navigate to detail page
- [ ] Verify detail page URL shows `/kos/[id]`
- [ ] Check all tabs load: Info, Statistik, etc.

## Statistics Tab

- [ ] Open Statistics tab on detail page
- [ ] Verify "Biaya" sub-tab shows pie chart
- [ ] Verify "Okupansi" sub-tab shows line chart
- [ ] Verify "Fasilitas" sub-tab shows bar chart
- [ ] Verify "Harga" sub-tab shows pricing analysis
- [ ] Check all charts have proper labels and data
- [ ] Switch to dark mode - charts should be visible
- [ ] Verify responsive chart sizing on mobile

## Calculation Blocking

- [ ] Open a kos detail page with incomplete data
- [ ] Scroll to "Perhitungan Cepat" section
- [ ] Verify blocking card appears showing missing fields
- [ ] Check blocking card lists specific missing fields
- [ ] Click "Lengkapi Data" button - should redirect to form
- [ ] Fill in missing required fields
- [ ] Return to detail page - blocking card should be gone
- [ ] Now calculation buttons should be enabled

## Quick Calculations

- [ ] Complete a kos form with all required data
- [ ] Open detail page for that kos
- [ ] Click "Hitung AHP" button
- [ ] Verify success toast notification appears
- [ ] Click "Hitung CBP" button
- [ ] Verify success toast notification appears
- [ ] Click "Hitung Semua" button
- [ ] Verify both calculations run
- [ ] Check calculation results display correctly

## Reports Page

- [ ] Open detail page for a kos
- [ ] Click "Laporan" tab
- [ ] Verify "Ringkasan Eksekutif" shows key metrics
- [ ] Check "Analisis" tab shows charts
- [ ] Verify "Harga" tab shows pricing analysis
- [ ] Verify "Wawasan" tab shows insights
- [ ] Verify "Rekomendasi" tab shows recommendations
- [ ] Test export functionality if available

## API Key Management

- [ ] Go to Settings page
- [ ] Find API key management section
- [ ] Verify API keys display with status
- [ ] Check for "Active", "Expired", "Temporary" indicators
- [ ] Click eye icon on a key - should reveal full key
- [ ] Click copy button - key should copy to clipboard
- [ ] Verify masked key display for security
- [ ] Check expiration dates show for temporary keys

## Mobile Navigation

- [ ] Open app on mobile device (< 768px width)
- [ ] Verify bottom navigation appears
- [ ] Verify sidebar is hidden
- [ ] Click each bottom nav item:
  - [ ] Dashboard
  - [ ] Kos
  - [ ] AHP
  - [ ] CBP
  - [ ] Setelan
- [ ] Verify each section loads correctly
- [ ] Check page padding accounts for bottom nav (pb-20)
- [ ] Test on tablet (768px - 1024px):
  - [ ] Verify hidden sidebar
  - [ ] Verify 2-column card grid
- [ ] Test on desktop (> 1024px):
  - [ ] Verify visible sidebar
  - [ ] Verify 3-column card grid

## Font & Typography

- [ ] View any page
- [ ] Verify body text uses Poppins font
- [ ] Verify headings use appropriate weight
- [ ] Check font rendering quality
- [ ] Test on different browsers
- [ ] Verify font loads on slow connections
- [ ] Test font display in both light and dark modes

## Responsive Design

### Mobile (< 768px)
- [ ] Single column card layout
- [ ] Bottom navigation
- [ ] Proper padding/margins
- [ ] Touch-friendly button sizes
- [ ] Forms stack vertically
- [ ] Charts scale to screen width
- [ ] Dialogs are full-width

### Tablet (768px - 1024px)
- [ ] 2-column card layout
- [ ] Hidden sidebar
- [ ] Balanced spacing
- [ ] Forms display properly
- [ ] Charts render clearly

### Desktop (> 1024px)
- [ ] 3-column card layout
- [ ] Visible sidebar
- [ ] Optimal padding
- [ ] All features accessible
- [ ] Charts display in full detail

## Dark Mode Coverage

Check dark mode styling for:
- [ ] All page backgrounds
- [ ] All cards and containers
- [ ] Text colors (proper contrast)
- [ ] Input fields and forms
- [ ] Buttons and interactive elements
- [ ] Charts and visualizations
- [ ] Navigation bars
- [ ] Modals and dialogs
- [ ] Badges and tags
- [ ] Borders and dividers

## Data Integration

- [ ] Kos data loads from API
- [ ] Statistics API returns correct data
- [ ] Validation API checks mandatory fields
- [ ] AHP API processes calculations
- [ ] CBP API processes calculations
- [ ] Integration API combines results
- [ ] Dashboard API loads overall stats
- [ ] API Key API manages keys
- [ ] Export API generates reports

## Cross-Browser Testing

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Device Testing

- [ ] iPhone (portrait & landscape)
- [ ] iPad (portrait & landscape)
- [ ] Android phone
- [ ] Android tablet
- [ ] Desktop (various resolutions)

## Performance Checks

- [ ] Page loads within 3 seconds
- [ ] Charts render smoothly
- [ ] Theme switching is instant
- [ ] Navigation is responsive
- [ ] No console errors
- [ ] Mobile performs well on 4G

## Accessibility Checks

- [ ] Can navigate with keyboard only
- [ ] Color contrast meets WCAG standards
- [ ] Form labels are descriptive
- [ ] Buttons have proper focus states
- [ ] Images have alt text
- [ ] Dark mode is sufficient for readability

## Error Handling

- [ ] API errors show proper messages
- [ ] Failed validations show field errors
- [ ] Network errors are handled gracefully
- [ ] User feedback via toast notifications
- [ ] Error messages are clear and actionable

## Session & State

- [ ] Theme selection persists on refresh
- [ ] Logged-in state maintained
- [ ] Form data preserved when navigating away
- [ ] Authentication redirects work properly
- [ ] Logout works correctly

## Final Sign-Off

- [ ] All features working as expected
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] User experience is smooth
- [ ] Mobile experience is seamless
- [ ] Dark mode is fully functional
- [ ] All calculations work correctly
- [ ] Reports generate properly

**Date Tested**: _______________
**Tester Name**: _______________
**Status**: _____ PASS / _____ FAIL

**Notes**:
```
[Add any notes about testing results here]
```
