# Architecture Guide - Electricity Bill Splitter

## Overview

The Electricity Bill Splitter is a vanilla JavaScript web app that calculates how to split electricity bills between two apartments based on individual meter readings. The app uses a modern, modular architecture with a centralized state management system.

**Key Principles:**
- No external frameworks (vanilla JavaScript, no React/Vue/Angular)
- Modular architecture with single responsibility per file
- Reactive state management using EventEmitter pattern
- Configuration-driven for easy customization
- Backward compatible with legacy code

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│         User Interface (HTML/CSS)            │
│         src/index.html + Tailwind CSS        │
├─────────────────────────────────────────────┤
│              UI Layer (ui.js)                │
│    - Modal management, form rendering        │
│    - Bill list rendering with calculations   │
│    - User input validation & feedback        │
├─────────────────────────────────────────────┤
│     Business Logic Layer                     │
│ - Validation (validation.js)                 │
│ - Calculations (calculator.js)               │
│ - UI Components (ui-components.js)           │
│ - Cloud/CSV Operations (services/)           │
├─────────────────────────────────────────────┤
│         State Management Layer                │
│    - State Manager (stateManager.js)         │
│    - Undo Manager (built-in)                 │
│    - Legacy State Sync (state.js)            │
├─────────────────────────────────────────────┤
│          Data Persistence Layer              │
│    - localStorage (local storage)            │
│    - Cloud (JSONHosting.com)                 │
│    - CSV (file system)                       │
├─────────────────────────────────────────────┤
│       Utilities & Configuration              │
│ - Config (config.js - all constants)         │
│ - Utils (utils.js - safe storage, ID gen)    │
│ - Components (ui-components.js - reusable)   │
└─────────────────────────────────────────────┘
```

---

## Module Breakdown

### Core Modules

#### `src/js/stateManager.js` (State Management)
**Responsibility:** Centralized reactive state management with undo support

**Key Classes:**
- `EventEmitter`: Simple pub-sub pattern for reactive updates
- `UndoManager`: Tracks deletion operations, shows undo toast notification
- `StateManager`: Main state container with getters/setters for bills and settings

**Public API:**
```javascript
// Bill operations
state.getBills()                   // Get all bills (copy)
state.addBill(bill)               // Add new bill with unique ID
state.updateBill(billId, updates) // Update existing bill
state.deleteBill(billId)          // Delete bill (triggers undo)
state.getBillById(billId)         // Get specific bill

// Settings
state.getSettings()               // Get initial readings
state.setSettings(settings)       // Save initial readings
state.hasInitialReadings()        // Check if settings initialized

// Events
state.on('bills:updated', callback)      // Listen to bill changes
state.on('settings:updated', callback)   // Listen to settings changes
state.on('editing:changed', callback)    // Listen to edit state changes

// Bulk operations
state.replaceAll(bills, settings) // Restore from backup
state.clearAll()                  // Delete all data permanently
```

**Why EventEmitter?**
- Lightweight (no framework required)
- Simple to reason about
- Perfect for small apps with 1-2 listeners per event
- Supports both sync and async listeners

---

#### `src/js/config.js` (Configuration)
**Responsibility:** Centralized configuration constants

**Sections:**
- `VALIDATION`: Min/max thresholds for validation (reading ranges, prices)
- `STORAGE`: localStorage limits (max bills, quota)
- `CSV`: CSV format settings (headers, max file size)
- `CLOUD`: APIHosting settings (timeout, preview limit)
- `UI`: Timing constants (toast duration, spinner delay)
- `UNDO`: Undo settings (history size, expiry time)
- `MESSAGES`: All user-facing messages in Hebrew

**Benefits:**
- Easy to tweak behavior without code changes
- Consistent messages throughout the app
- Single source of truth for magic numbers

---

#### `src/js/utils.js` (Utilities)
**Responsibility:** Reusable utility functions

**Key Functions:**
```javascript
generateUniqueId()          // Generate collision-resistant bill IDs
safeLocalStorageSet()       // Store data with quota error handling
billIdExists()              // Check for bill ID duplicates
showStorageQuotaError()     // Display quota exceeded modal
```

**Why Safe Storage?**
- localStorage has a ~5-10MB quota per domain
- App shows user-friendly error and recovery options
- Prevents silent failures that would lose data

---

#### `src/js/validation.js` (Validation Logic)
**Responsibility:** Reusable validation functions extracted from ui.js

**Key Functions:**
```javascript
validateBillForm()          // Comprehensive bill validation
getPreviousReadings()       // Get prev reading based on context
isValidReading()            // Check reading within range
isValidPrice()              // Check price within range
```

**Validation Rules:**
1. Consumption must be positive
2. Meter readings cannot go backward (no negative consumption)
3. Tenant consumption cannot exceed total consumption
4. All values must be numeric and within configured ranges

---

#### `src/js/calculator.js` (Calculations)
**Responsibility:** Bill calculation logic separated from UI

**Key Functions:**
```javascript
calculateConsumption(current, previous)      // kWh delta
calculateCost(consumption, rate)             // ₪ amount
calculateBillMetrics(bill, prevTop, prevBottom)  // All metrics for a bill
calculateEffectiveRate(totalAmount, totalKwh)   // ₪/kWh
calculatePercentage(amount, total)           // Percent of total
calculateBillsSummary(bills, initial)        // Summary statistics
```

**Formula Reference:**
```
rate = Total Bill (₪) / Total Consumption (kWh)

For each apartment:
  consumption = current_reading - previous_reading
  payment = consumption × rate

Common area usage:
  common_kwh = total_kwh - (upper_consumption + lower_consumption)
  common_payment = common_kwh × rate
```

---

#### `src/js/ui-components.js` (Reusable Components)
**Responsibility:** Reusable UI building blocks

**Key Functions:**
```javascript
showLoadingSpinner()        // Display loading indicator
hideLoadingSpinner()        // Hide loading indicator
showToast(message, type)    // Show toast notification (success/error)
showOfflineBanner()         // Show offline indicator
hideOfflineBanner()         // Hide offline indicator
disableButtonWithLoading()  // Disable button during async operation
```

**Consistency Benefits:**
- All toasts have same duration, position, styling
- Loading spinners always appear after 300ms (avoid flashing)
- Offline banner shows/hides automatically on network change

---

### Service Modules

#### `src/js/services/cloud.js` (Cloud Backup)
**Responsibility:** Save/restore data from JSONHosting.com

**Key Features:**
- Automatic credential generation on first backup
- Preview modal before restoring (prevents accidental data loss)
- Offline detection with graceful fallbacks
- Loading spinners for better UX
- Data validation before restore

**Functions:**
```javascript
setupOfflineDetection()     // Monitor online/offline events
isOnline()                  // Check current network status
saveToCloud()               // Create/update cloud backup
loadFromCloud()             // Restore data from cloud
showCloudRestoreModal()     // Preview before restore
```

**Security:**
- Edit Key is required to update existing backups
- Auto-generated using Date.now() + Math.random()
- Stored in localStorage for convenience
- **Note:** This is NOT cryptographically secure (future enhancement)

---

#### `src/js/services/csv.js` (CSV Import/Export)
**Responsibility:** Bulk import/export bills via CSV format

**Key Features:**
- HTML sanitization prevents script injection
- File size validation (max 5MB)
- Data validation before import
- Excel compatibility with UTF-8 BOM
- Duplicate date detection (skips existing)

**Functions:**
```javascript
exportToCSV()               // Export all bills to local file
importFromCSV()             // Import bills from CSV file
sanitizeCSVData()           // Remove HTML/dangerous content
isValidCSVRow()             // Validate single row format
```

**CSV Format:**
```
תאריך,קריאה התחלתית,קריאה סופית,מחיר לקוט"ש
2024-01-01,50000,60000,2.85
```

---

### UI Layer

#### `src/js/ui.js` (Main UI Module)
**Responsibility:** All user interface interactions and rendering

**Sections:**

**Settings Panel:**
- `toggleSettings()` - Show/hide settings
- `saveSettings()` - Save initial readings
- `renderSettings()` - Display current settings

**Modal Management:**
- `openModal(billId)` - Open add/edit modal
- `closeModal()` - Close modal, reset state
- `openInitReadingsModal()` - Special modal for first-time setup
- `openAddBillModal()` - Quick open for new bill

**Form Handling:**
- `handleFormSubmit(e)` - Validate and save bill
- `validateForm()` - Check all form constraints
- `showFormErrors(errors)` - Display validation errors
- `hideFormErrors()` - Hide error display

**Rendering:**
- `renderBills()` - List all bills using DocumentFragment
- `updateEmptyStateMessage()` - Show/hide initial setup message
- `scrollToSettings()` - Smooth scroll with highlight

**Delete & Undo:**
- `deleteBill(id)` - Delete with undo toast

**Performance Optimization:**
- Uses `DocumentFragment` for batch DOM insertion
- Single `appendChild()` for entire bill list
- Event delegation for card buttons

---

#### `src/js/state.js` (Legacy State Sync)
**Responsibility:** Backward compatibility bridge

**Why Keep It?**
- Old code expects global `bills` and `initialSettings`
- Syncs automatically with new state manager
- Allows gradual migration to new architecture

**Functions:**
```javascript
initializeStateSync()       // Connect globals to state manager
saveData()                  // Backwards-compatible save
saveSettingsState()         // Persist settings
renderSettings()            // Legacy render for settings
resetAllData()              // Clear with confirmation
updateInitBanner()          // Show/hide setup banner
hasInitialReadings()        // Check if initialized
```

---

#### `src/js/app.js` (Initialization)
**Responsibility:** App startup and error handling

**Key Features:**
- Global error handlers (window.onerror, unhandledrejection)
- Keyboard shortcuts (ESC to close modal, Enter to submit)
- State manager initialization
- Offline detection setup
- Cloud credentials loading

**Startup Sequence:**
1. Load state manager and sync with globals
2. Setup offline detection
3. Load cloud credentials from localStorage
4. Render UI (settings, bills, banner)
5. Show error modal if initialization fails

---

## Data Flow

### Adding a Bill

```
User Input (Form)
    ↓
handleFormSubmit()
    ↓
validateForm() ← validation.js
    ↓
state.addBill() ← stateManager.js
    ├─ generateUniqueId() ← utils.js
    ├─ emit('bills:updated')
    └─ safeLocalStorageSet() ← write to localStorage
    ↓
Close modal
    ↓
renderBills() ← ui.js
    ├─ calculateBillMetrics() ← calculator.js
    ├─ showToast() ← ui-components.js
    └─ DOM update with DocumentFragment
```

### Restoring from Cloud

```
User enters credentials & clicks "Load"
    ↓
loadFromCloud() ← cloud.js
    ├─ isOnline() check
    ├─ showLoadingSpinner() ← ui-components.js
    ├─ fetch() from JSONHosting
    ├─ validateCloudData()
    └─ showCloudRestoreModal() with preview
    ↓
User confirms restore
    ↓
state.replaceAll(bills, settings) ← stateManager.js
    ├─ Update all local data
    ├─ emit('bills:updated')
    └─ safeLocalStorageSet()
    ↓
renderBills()
    ↓
hideLoadingSpinner()
    ↓
showToast('Restore successful')
```

### Calculating Bill Distribution

```
For each bill:
    ↓
calculateBillMetrics(bill, prevTop, prevBottom)
    ├─ rate = total_amount / total_kwh
    ├─ consTop = current_top - prev_top
    ├─ consBottom = current_bottom - prev_bottom
    ├─ payTop = consTop × rate
    ├─ payBottom = consBottom × rate
    ├─ commonKwh = total_kwh - (consTop + consBottom)
    └─ commonPay = commonKwh × rate
    ↓
Display metrics in bill card
```

---

## Key Design Decisions

### 1. **Why Vanilla JavaScript?**
- No build step required for standalone HTML
- Single-file deployment is possible
- Minimal dependencies for mobile APK
- Easier to understand and maintain for small projects

### 2. **Why EventEmitter Instead of Reactive Framework?**
- Very lightweight (~100 lines)
- Matches the simple use case (1-2 listeners per event)
- Framework overhead not worth it for this app size
- Easier to debug simple event flow

### 3. **Why Config Constants?**
- Hebrew-language app has many hardcoded messages
- Easy to translate/customize without code changes
- Single source of truth for validation ranges
- Configuration-driven architecture is more maintainable

### 4. **Why DocumentFragment for Rendering?**
- Batch DOM insertions are significantly faster
- Reduces reflow/repaint cycles from 50+ to 1
- Especially noticeable with many bills
- Simple optimization with huge performance gain

### 5. **Why Undo is Built-in to StateManager?**
- Deletion is the most destructive operation
- Users appreciate the 10-second undo window
- Toast notification shows recovery option
- Small overhead with big UX benefit

### 6. **Why Cloud Backups Before Restore?**
- Previous versions allow accidental data overwriting
- Preview modal prevents "oops" moments
- Shows bill count, helps user ensure they have the right backup

---

## Performance Characteristics

### Time Complexity
- Adding bill: O(log n) due to sort
- Rendering 100 bills: ~50ms (with DocumentFragment)
- Calculating metrics: O(n) linear in bills count
- Validation: O(n log n) if checking all bills for duplicates

### Space Complexity
- Bills in memory: O(n × bill_size)
- Each bill: ~200-300 bytes
- 1000 bills ≈ 200-300 KB in memory + UI overhead

### Optimizations
- DocumentFragment: Single DOM operation instead of N
- Debouncing would reduce rapid input events (future enhancement)
- Incremental rendering would handle 1000+ bills better

---

## Extending the App

### Adding a New Feature

1. **Add config values** → `src/js/config.js`
2. **Add UI components** → `src/js/ui-components.js`
3. **Add logic/calculations** → New file or existing module
4. **Add state methods** → `src/js/stateManager.js`
5. **Add UI interactions** → `src/js/ui.js`
6. **Listen to state events** → `state.on('bills:updated', ...)`

### Example: Add PDF Export

```javascript
// 1. config.js
PDF: {
  MAX_BILLS_PER_PAGE: 10,
  FILENAME: 'electricity_bills.pdf'
}

// 2. services/pdf.js (new)
function exportToPDF() {
  const bills = state.getBills();
  // ... PDF generation logic
}

// 3. ui.js
// Add button to settings panel
// Call exportToPDF() on click
```

---

## Testing Approach

### Manual Testing Checklist

**Core Features:**
- [ ] Add/edit/delete bill
- [ ] CSV import/export
- [ ] Cloud save/restore
- [ ] Undo deletion
- [ ] Form validation

**Error Handling:**
- [ ] Storage quota exceeded
- [ ] Invalid CSV format
- [ ] Network timeout
- [ ] Unhandled exceptions

**Edge Cases:**
- [ ] Empty bill list
- [ ] Single bill
- [ ] 100+ bills
- [ ] Very large amounts (999999.99)
- [ ] Negative consumption alert

### Future: Automated Testing
```javascript
// Unit tests for calculator.js
test('calculateBillMetrics', () => {
  const result = calculateBillMetrics(bill, 50000, 60000);
  expect(result.rate).toBe(2.85);
  expect(result.consumptionTop).toBe(100);
});

// Integration tests for stateManager
test('addBill emits event', (done) => {
  state.on('bills:updated', (bills) => {
    expect(bills.length).toBe(1);
    done();
  });
  state.addBill(testBill);
});
```

---

## Troubleshooting

### Storage Quota Exceeded
- Modal shows recovery options
- User deletes old bills to free space
- App continues to function with remaining data

### Cloud Restore Hangs
- 10-second timeout in config
- Shows timeout error to user
- User can retry or enter ID manually

### Invalid CSV Data
- Each row validated individually
- Errors shown with row numbers
- User can fix and retry

### Undo Toast Disappears
- Auto-dismiss after 10 seconds (configurable)
- Can click undo action before timeout

---

## Future Enhancements

- [ ] **Advanced Encryption:** Encrypt cloud backups with password
- [ ] **API Key Encryption:** Secure storage of JSONHosting credentials
- [ ] **Search/Filter Bills:** Find bills by date range or amount
- [ ] **PDF Reports:** Export bills as formatted PDF with charts
- [ ] **Analytics:** Monthly spending trends, average rate over time
- [ ] **Multi-Tenant:** Support 3+ apartments, not just 2
- [ ] **Unit Tests:** Jest + Playwright for automated testing
- [ ] **Dark Mode:** Toggle between light/dark themes
- [ ] **Localization:** Support multiple languages (English, Arabic, etc)
- [ ] **Sync Across Devices:** Real-time sync using WebSockets

---

## CI/CD & APK Signing

### Build Workflow (`.github/workflows/build-apk.yml`)

Triggered manually via `workflow_dispatch`. Steps:
1. Checkout repo, set up Node.js 20 and JDK 17
2. `npm install` + `node build.js` (from `apk-builder/`) → produces standalone HTML + `dist/`
3. Version bump in `apk-builder/package.json`
4. Capacitor `add android` → `sync android` → `assembleDebug`
5. Upload APK to GitHub Release with AI-generated changelog

### Debug Keystore (APK Signing)

A persistent debug keystore is committed at `.github/keys/debug.keystore`. This ensures every CI build produces APKs signed with the **same key**, so users can install updates without uninstalling first.

| Property       | Value                |
|----------------|----------------------|
| Location       | `.github/keys/debug.keystore` |
| Alias          | `androiddebugkey`    |
| Store password | `android`            |
| Key password   | `android`            |
| Algorithm      | RSA 2048-bit         |
| Validity       | 10,000 days          |

**How it works in CI:**
- The workflow copies the committed keystore to `~/.android/debug.keystore` (the default location Gradle uses for debug builds)
- If the keystore doesn't exist yet, it generates one and commits it
- This is a **debug** key with no secret value — safe to commit to the repo

**Important:** If this keystore is ever deleted or regenerated, users must uninstall the old APK before installing the new one (signature mismatch). Avoid regenerating unless absolutely necessary.

---

## File Structure Reference

```
electricity/
├── src/
│   ├── index.html                 # Main HTML entry point
│   ├── css/                       # Stylesheets (Tailwind, FontAwesome)
│   └── js/
│       ├── app.js                 # App initialization & error handling
│       ├── state.js               # Legacy state (sync bridge)
│       ├── stateManager.js        # Centralized state management
│       ├── config.js              # All config constants
│       ├── ui.js                  # UI rendering & interactions
│       ├── validation.js          # Validation logic
│       ├── calculator.js          # Bill calculations
│       ├── utils.js               # Utility functions
│       ├── ui-components.js       # Reusable UI components
│       └── services/
│           ├── cloud.js           # JSONHosting integration
│           └── csv.js             # CSV import/export
├── .github/
│   ├── keys/
│   │   └── debug.keystore         # Persistent debug signing key
│   └── workflows/
│       └── build-apk.yml          # CI/CD workflow for APK builds
├── apk-builder/                    # Build tooling & Capacitor config
│   ├── build.js                   # Build script (bundle standalone HTML)
│   ├── package.json               # All deps (build + Capacitor)
│   ├── capacitor.config.json      # Capacitor Android config
│   └── assets/                    # App icons for Android
├── electricity_calc_standalone.html # Bundled single-file version (output)
└── dist/                           # Capacitor web dir (output)
```

---

## License

MIT - See LICENSE file for details
