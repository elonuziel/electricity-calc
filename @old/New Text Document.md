# Plan: Complete Electricity App Overhaul

## 📋 Overview

**What this plan does:** Fixes all bugs, security issues, and adds modern development practices to your electricity bill splitter app.

**Main focus:** The modular version in [src/](src/) folder

**Estimated scope:** 31 tasks organized into 7 phases

**Key improvements:**
- 🐛 Fix critical bugs (ID collisions, duplicate code)
- 🔒 Make data backup secure with encryption
- ⚡ Improve app speed and performance  
- 🎨 Better user experience (loading states, error messages, search)
- 🧪 Add automated testing
- 📦 Create build system to auto-generate the offline HTML version

---

## 🎯 Key Decisions for Review

Please review these architectural decisions before proceeding:

| Decision | Choice | Why? | Your Feedback |
|----------|--------|------|---------------|
| **Cloud Backup** | Option C: Keep JSONHosting + add encryption | Minimal changes, encrypted data | ✏️ |
| **Build Tool** | Vite | Fast, modern, handles HTML/CSS/JS | ✏️ |
| **State Management** | Custom EventEmitter | Lightweight, no framework needed | ✏️ |
| **Testing** | Vitest + Playwright | Fast, modern, mobile-friendly | ✏️ |
| **Storage** | Keep localStorage | Data is small enough | ✏️ |
| **UI Framework** | Stay vanilla JS | App is small, avoid overhead | ✏️ |

> **Note:** Add any concerns or suggestions in the "Your Feedback" column above

---

## 📝 Implementation Plan

**Legend:**
- 🔴 Critical (must do first)
- 🟡 Important (should do soon)  
- 🟢 Nice to have (can defer)
- ✅ Status checkbox for tracking progress

---

### Phase 1: Critical Bugs & Foundation
*Fix bugs that could cause data loss or app crashes*

---

#### 🔴 Task 1.1: Fix bill ID collision bug
- **Status:** ✅ Not Started
- **File:** [src/js/ui.js](src/js/ui.js#L232-L237)
- **Problem:** Two bills created quickly can get the same ID, causing data corruption
- **Solution:** 
  - Replace `Date.now() + Math.random()` with proper UUID generation
  - Add duplicate ID check in `saveBill()` function
- **Estimated effort:** 30 minutes
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🔴 Task 1.2: Add localStorage quota handling
- **Status:** ✅ Not Started
- **File:** [src/js/state.js](src/js/state.js#L6-L8)
- **Problem:** App crashes if browser storage is full
- **Solution:**
  - Wrap all localStorage operations in try-catch blocks
  - Show user-friendly error when quota exceeded
  - Add option to archive/delete old bills when storage is full
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟡 Task 1.3: Add global error boundary
- **Status:** ✅ Not Started
- **File:** [src/js/app.js](src/js/app.js)
- **Problem:** Uncaught errors crash the entire app
- **Solution:**
  - Implement `window.onerror` and `window.onunhandledrejection` handlers
  - Log errors gracefully without crashing
  - Show user-friendly modal with recovery options (reload, clear data)
- **Estimated effort:** 45 minutes
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 1.4: Remove duplicate functions
- **Status:** ✅ Not Started
- **File:** [electricity_calc_offline.html](electricity_calc_offline.html)
- **Problem:** `exportToCSV()` is defined twice
- **Solution:** Will be handled automatically by build tool in Phase 3
- **Estimated effort:** Automated
- **Your notes/feedback:**
  ```
  
  
  ```

---

### Phase 2: Security Overhaul
*Protect user data and prevent security vulnerabilities*
 
---

#### 🔴 Task 2.1: Replace insecure cloud backup system
- **Status:** ✅ Not Started
- **File:** [src/js/services/cloud.js](src/js/services/cloud.js)
- **Problem:** Data passes through untrusted CORS proxy (corsproxy.io) unencrypted
- **Chosen Solution: Option C** - Keep JSONHosting but add encryption
  - Encrypt data before sending through proxy using Web Crypto API (AES-GCM)
  - User enters encryption password when backing up/restoring
  - Even if proxy intercepts data, it's encrypted
  - ⚠️ Still has small risk: proxy can see when you backup (timing), but not the content
- **Alternative options (not chosen):**
  - Option A: File System Access API + user's own cloud (complex setup)
  - Option B: GitHub Gist (requires GitHub account)
- **Estimated effort:** 3 hours
- **Your notes/feedback:**
  ```
  save for later time. its intresting. save a on how to do this for later, in ideas, and note on readme. (in todo maybe?)
  
  ```

---

#### 🔴 Task 2.2: Encrypt API credentials in localStorage
- **Status:** ✅ Not Started
- **File:** [src/js/state.js](src/js/state.js)
- **Problem:** JSONHosting API keys stored as plain text - anyone with browser access can steal them
- **Solution:**
  - Create encryption wrapper for sensitive localStorage items
  - Use Web Crypto API with password-derived key
  - Add master password setup on first run
  - Show warning: "Data stored in browser, not 100% secure"
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  save for later time. its intresting. save a on how to do this for later, in ideas, and note on readme. (in todo maybe?)
  
  ```

---

#### 🟡 Task 2.3: Add input sanitization for CSV import
- **Status:** ✅ Not Started
- **File:** [src/js/services/csv.js](src/js/services/csv.js#L56-L92)
- **Problem:** CSV data not sanitized before processing (potential for malicious data)
- **Solution:**
  - Sanitize all CSV data before processing
  - Validate data structure matches expected format (correct columns, data types)
  - Reject malformed CSV files with clear error message
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟡 Task 2.4: Add data validation for cloud restore
- **Status:** ✅ Not Started
- **File:** [src/js/services/cloud.js](src/js/services/cloud.js#L31-L52)
- **Problem:** Restored data not validated - corrupted cloud data could break the app
- **Solution:**
  - Validate schema of restored data (check all required fields exist)
  - Check for corruption or malformed entries
  - Show preview modal before overwriting local data
  - Add "merge" option (keep local bills + add cloud bills) instead of just replace
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

### Phase 3: Architecture & Code Quality
*Improve code structure and maintainability*

---

#### 🟡 Task 3.1: Implement proper state management
- **Status:** ✅ Not Started
- **File:** [src/js/state.js](src/js/state.js)
- **Problem:** Global mutable state makes bugs hard to track
- **Solution:**
  - Create EventEmitter-based state manager (publish/subscribe pattern)
  - Encapsulate state with getters/setters (no direct access to `bills`, `settings`)
  - Emit events on state changes (`bills:updated`, `settings:updated`)
  - UI components subscribe to events and update automatically
- **Why this helps:** Changes in one part of the app automatically update UI everywhere
- **Estimated effort:** 3 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟡 Task 3.2: Refactor UI for separation of concerns
- **Status:** ✅ Not Started
- **File:** [src/js/ui.js](src/js/ui.js)
- **Problem:** UI file mixes validation, calculations, and rendering - hard to maintain
- **Solution:**
  - Extract validation logic → new `src/js/validation.js` module
  - Extract calculation logic → new `src/js/calculator.js` module
  - Keep `ui.js` focused only on DOM manipulation and rendering
  - Each module has single responsibility
- **Why this helps:** Easier to test, debug, and modify each part independently
- **Estimated effort:** 4 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🔴 Task 3.3: Add build tooling
- **Status:** ✅ Not Started
- **New files:** `package.json`, `vite.config.js`
- **Problem:** Manual maintenance of both modular and offline versions causes drift
- **Solution:**
  - Create `package.json` with build scripts
  - Add Vite bundler
  - Configure to generate standalone HTML from modular [src/](src/) files
  - Automatically inline CSS/JS into single HTML file
  - Add CSS minification and JS tree-shaking
  - One command builds everything: `npm run build`
- **Why this helps:** Never worry about versions getting out of sync again
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  ok, do it. but make it run automatically when building the apk on github actions and replace the old one, so we dont have to remember to do it. its name can be changed to a more generic name like electricity_calc_standalone.html, since it will be automatically generated and always up to date. move the current offlilne version to @old folder, just in case we need to refer to it later.
  
  ```

---

#### 🟢 Task 3.4: Add configuration management
- **Status:** ✅ Not Started
- **New file:** `src/js/config.js`
- **Problem:** Magic numbers scattered throughout code (e.g., `if (amount > 0)`)
- **Solution:**
  - Create central config file
  - Extract all magic numbers to named constants
  - Define validation thresholds (MIN_READING, MAX_KWH, etc.)
  - Make API URLs configurable
  - Support dev/production modes
- **Example:** `const MIN_READING = 0;` instead of just `if (reading > 0)`
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟡 Task 3.5: Optimize rendering performance
- **Status:** ✅ Not Started
- **File:** [src/js/ui.js](src/js/ui.js#L233-L340)
- **Problem:** App recreates entire bill list on every change (slow with many bills)
- **Solution:**
  - Implement incremental DOM updates (only change what's different)
  - Use DocumentFragment for batch inserts (faster than multiple appends)
  - Add debouncing to settings inputs (don't save on every keystroke)
  - Sort bills only when modified, not on every render
- **Why this helps:** App stays fast even with 100+ bills
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 3.6: Add JSDoc comments
- **Status:** ✅ Not Started
- **Files:** All JS files
- **Problem:** Complex calculation logic has no explanations
- **Solution:**
  - Add JSDoc comments to all functions
  - Document complex calculation logic (rate calculations, consumption splitting)
  - Add type annotations for function parameters
  - Explain what formulas do and why
- **Example:**
  ```javascript
  /**
   * Calculate per-apartment cost based on consumption
   * @param {number} reading - Current meter reading in kWh
   * @param {number} previousReading - Previous meter reading in kWh
   * @returns {number} Cost in currency units
   */
  ```
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

### Phase 4: UX Improvements
*Make the app more user-friendly and intuitive*

---

#### 🟡 Task 4.1: Add loading states
- **Status:** ✅ Not Started
- **File:** [src/js/services/cloud.js](src/js/services/cloud.js)
- **Problem:** No feedback during cloud operations - users don't know if it's working
- **Solution:**
  - Create spinner/loading indicator component
  - Show during cloud backup/restore operations
  - Add progress feedback for large operations
  - Disable buttons during async operations (prevent double-clicking)
- **User benefit:** Clear feedback that something is happening
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟡 Task 4.2: Add offline detection
- **Status:** ✅ Not Started
- **File:** [src/js/app.js](src/js/app.js)
- **Problem:** Cloud operations fail silently when offline
- **Solution:**
  - Listen to browser `online`/`offline` events
  - Show banner at top when offline with message: "אינך מחובר לאינטרנט"
  - Queue cloud operations when offline, retry automatically when online
  - Gracefully handle network failures with retry option
- **User benefit:** Users understand why cloud features don't work
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 4.3: Improve modal UX
- **Status:** ✅ Not Started
- **File:** [src/index.html](src/index.html)
- **Problem:** Multiple small annoyances with modal interactions
- **Solution:**
  - Prevent body scroll when modal open (avoid confusion)
  - Add keyboard shortcuts: ESC to close, Enter to save
  - Auto-close success modals after 5 seconds (or add countdown)
  - Add "Continue" button in backup success modal instead of just "Close"
- **User benefit:** Faster, more intuitive interactions
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 4.4: Add empty state improvements
- **Status:** ✅ Not Started
- **File:** [src/index.html](src/index.html#L187-L195)
- **Problem:** Banner says "set initial readings" but no quick way to do it
- **Solution:**
  - Add "הגדר קריאות ראשוניות" button directly in banner
  - Show onboarding guide on first visit (simple tutorial overlay)
  - Add helpful tooltips (?) for complex fields
  - Make empty states actionable, not just informational
- **User benefit:** New users can start using app faster
- **Estimated effort:** 1.5 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 4.5: Add bill search and filtering
- **Status:** ✅ Not Started
- **New functionality** in bills section
- **Problem:** Hard to find specific bills when you have many (e.g., "show me bills from July")
- **Solution:**
  - Add search input box in bills section header
  - Filter by date range (from/to date pickers)
  - Filter by apartment (checkboxes: show top / show bottom / show common)
  - Highlight search matches in yellow
  - Add "Clear filters" button
- **User benefit:** Quick access to specific bills
- **Estimated effort:** 3 hours
- **Your notes/feedback:**
  ```
  save for later time. its intresting. save a on how to do this for later, in ideas, and note on readme. (in todo maybe?)
  
  ```

---

#### 🟡 Task 4.6: Add undo functionality
- **Status:** ✅ Not Started
- **File:** [src/js/state.js](src/js/state.js)
- **Problem:** Deleting a bill is permanent - easy to make mistakes
- **Solution:**
  - Implement undo stack (stores last 10 operations)
  - After delete, show toast: "חשבונית נמחקה [בטל]"
  - Undo button appears for 30 seconds then expires
  - Support undo for delete and edit operations
  - Store operation history in memory (not localStorage)
- **User benefit:** Safety net for accidental deletions
- **Estimated effort:** 2.5 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 4.7: Improve error messages
- **Status:** ✅ Not Started
- **File:** [src/js/ui.js](src/js/ui.js#L130-L147)
- **Problem:** Some error messages are technical or unclear
- **Solution:**
  - Make validation messages more user-friendly (simple Hebrew)
  - Add contextual help icons (?) with explanations
  - Standardize error presentation (use toast notifications, not alerts)
  - Add actionable suggestions: "קריאה שגויה. ודא שהקריאה גדולה מקריאה קודמת"
- **User benefit:** Better understanding of what went wrong and how to fix it
- **Estimated effort:** 1.5 hours
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 4.8: Add data export options
- **Status:** ✅ Not Started
- **New file:** `src/js/services/export.js`
- **Problem:** Only CSV export available, some users want reports
- **Solution:**
  - Create new export service module
  - Add JSON export (full data backup in readable format)
  - Add print-friendly view with browser print (styled for paper)
  - Optional: Add PDF report generation using jsPDF library
  - Optional: Add graphs/charts showing consumption over time
- **User benefit:** Flexible data export for different uses
- **Estimated effort:** 3 hours (without PDF/charts), 6 hours (with PDF/charts)
- **Your notes/feedback:**
  ```
  save for later time. its intresting. save  on how to do this for later, in ideas, and note on readme. (in todo maybe?)
  
  ```

---

### Phase 5: Testing & Quality Assurance
*Add automated testing to catch bugs early*

---
---
save all phase 5 for later time. its intresting. save in ideas, and note on readme. (in todo maybe?)
---

#### 🟡 Task 5.1: Set up testing infrastructure
- **Status:** ✅ Not Started
- **New files:** `vitest.config.js`, test files in `tests/` folder
- **Problem:** No automated tests - bugs found by users, not before release
- **Solution:**
  - Add Vitest test runner (works with Vite)
  - Create test files for each module (`state.test.js`, `calculator.test.js`, etc.)
  - Add test scripts to `package.json` (`npm test`, `npm run test:watch`)
  - Set up code coverage reporting (see which code is tested)
- **Developer benefit:** Catch bugs before they reach users
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  
  
  ```

---

#### 🟡 Task 5.2: Write unit tests
- **Status:** ✅ Not Started
- **New files:** Test files for each module
- **What to test:**
  - Calculation logic in `calculator.js` (rate calculations, consumption splitting)
  - Validation rules (negative numbers rejected, required fields, etc.)
  - CSV import/export (parsing, formatting)
  - State management operations (add bill, delete bill, update settings)
- **Goal:** At least 70% code coverage
- **Estimated effort:** 4 hours
- **Your notes/feedback:**
  ```
  
  
  ```

---

#### 🟢 Task 5.3: Add E2E tests
- **Status:** ✅ Not Started
- **New files:** `tests/e2e/` folder with Playwright tests
- **Problem:** Unit tests don't catch integration issues
- **Solution:**
  - Use Playwright for end-to-end testing (simulates real user actions)
  - Test complete user workflows:
    - Create bill → verify it appears in list
    - Edit bill → verify changes saved
    - Delete bill → verify it's gone
    - Backup/restore → verify data integrity
    - CSV export/import → verify round-trip works
  - Run E2E tests before each release
- **Developer benefit:** Confidence that entire app works together
- **Estimated effort:** 3 hours
- **Your notes/feedback:**
  ```
  
  
  ```

---

#### 🟢 Task 5.4: Add linting and formatting
- **Status:** ✅ Not Started
- **New files:** `.eslintrc.js`, `.prettierrc.js`
- **Problem:** Inconsistent code style, potential bugs from common mistakes
- **Solution:**
  - Add ESLint with standard config (catches common errors)
  - Add Prettier for automatic code formatting
  - Add pre-commit hooks with Husky (auto-format before commit)
  - Configure Hebrew language support in linters (right-to-left text)
- **Developer benefit:** Consistent code style, fewer bugs
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  
  
  ```

---

### Phase 6: Capacitor & APK
*Fix mobile app build configuration*

---

#### 🟡 Task 6.1: Fix Capacitor configuration
- **Status:** ✅ Not Started
- **File:** [apk-builder/capacitor.config.json](apk-builder/capacitor.config.json)
- **Problem:** `webDir` points to source files, not built output
- **Solution:**
  - Update `webDir` to point to built output: `../dist`
  - Configure proper app icons and splash screens
  - Add Capacitor plugins if needed (e.g., for native features)
  - Test APK builds successfully
- **Why this matters:** APK must use optimized build, not dev files
- **Estimated effort:** 1 hour
- **Your notes/feedback:**
  ```
  ok, do it.
  
  ```

---

#### 🟢 Task 6.2: Update GitHub Actions workflow
- **Status:** ✅ Not Started
- **File:** [.github/workflows/build-apk.yml](.github/workflows/build-apk.yml)
- **Problems:** 
  - Typo: `models: read` permission (should be removed or corrected)
  - Overly complex changelog generation with AI fallback
  - Keystore in repo (bad practice)
- **Solution:**
  - Fix/remove `models: read` permission
  - Simplify changelog generation (use simple git log, remove AI dependency)
  - Move keystore to GitHub Secrets
  - Add build quality checks: run tests before building APK
- **Why this matters:** Automated APK builds should be reliable and secure
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  idk, i like the ai summery. its a debug app. so the keystore is not a big deal. but you can move it to secrets if you want, its not a problem. but make sure to update the build script to read it from secrets and not break the build. also, make sure to test the build process after making changes to ensure it still works correctly. read github docs to make sure you are doing it right.
  
  ```

---

### Phase 7: Documentation
*Document everything for users and future maintainers*

---

#### 🟢 Task 7.1: Update README.md
- **Status:** ✅ Not Started
- **File:** [src/README.md](src/README.md)
- **Problem:** README doesn't reflect new architecture
- **Solution:**
  - Document new architecture (state management, build system)
  - Add setup instructions with build steps (`npm install`, `npm run dev`, `npm run build`)
  - Explain security model for cloud backup (encryption)
  - Add screenshots and feature list
  - Add badges (build status, test coverage)
- **Estimated effort:** 1.5 hours
- **Your notes/feedback:**
  ```
  just update it to reflect the changes. i should be brief and nice, for a user. the detailed explanation of the architecture and how to do things should be in a separate file, maybe ARCHITECTURE.md or in the wiki, for future maintainers. the readme should be more of a quick start guide and overview, not a deep dive.
  
  ```

---

#### 🟢 Task 7.2: Add inline documentation
- **Status:** ✅ Not Started
- **Files:** Various
- **What to document:**
  - Rate calculation formulas (how costs are split)
  - Common-area consumption algorithm (how shared electricity is calculated)
  - Architecture diagram (visual overview of how modules connect)
  - Create CONTRIBUTING.md for future maintainers
- **Why this matters:** Makes code maintainable long-term
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  ok, do it. no need for contributing.md, this is a personal project, not open source. but the rest of the documentation is important for future maintenance, so do it.
  
  ```

---

#### 🟢 Task 7.3: Add user guide
- **Status:** ✅ Not Started
- **New file:** `docs/user-guide.md` or `GUIDE.md`
- **Problem:** No user-facing documentation
- **Solution:**
  - Create user-facing guide in Hebrew
  - Explain how to use each feature (with screenshots)
  - Add FAQ section:
    - "מה קורה אם אאבד את הנתונים?"
    - "האם הנתונים שלי מאובטחים?"
    - "איך לייבא נתונים מגיליון אקסל?"
  - Include backup/restore instructions with security tips
- **User benefit:** Self-service help, fewer support questions
- **Estimated effort:** 2 hours
- **Your notes/feedback:**
  ```
  nah, no need for a separate user guide. the readme should be enough for users. just make sure to include clear instructions and screenshots in the readme. the user guide can be added later if needed, but for now, let's keep it simple with just the readme.
  
  ```

---

## ✅ Verification & Testing Plan

After completing all phases, verify everything works:

### Automated Checks
- [ ] Run `npm test` → all unit tests pass
- [ ] Run `npm run test:e2e` → all E2E tests pass
- [ ] Run `npm run build` → standalone HTML generated successfully
- [ ] Run lint checks → no errors

is it hard? i dont want to install crap on my pc. i have npm, if its easy so ok.

### Manual Testing Checklist
- [ ] **Add bill with validation errors** → see helpful error messages
- [ ] **Add valid bill** → appears in list immediately
- [ ] **Edit existing bill** → changes reflected
- [ ] **Delete bill** → undo toast appears, can recover
- [ ] **Set initial readings** → banner disappears
- [ ] **Export to CSV** → file downloads correctly
- [ ] **Import from CSV** → data loads without errors
- [ ] **Backup data** (encrypted) → success message shown
- [ ] **Restore data** → preview modal appears, data restored
- [ ] **Test offline mode** → banner appears, features disabled gracefully
- [ ] **Test on mobile device** → responsive, touch-friendly
- [ ] **Verify calculations** → manually check bill splitting is correct
- [ ] **Search/filter bills** → results update correctly
- [ ] **Keyboard shortcuts** → ESC closes modal, Enter saves

is it hard? i dont want to install crap on my pc. i have npm, if its easy so ok.

### Performance & Accessibility
- [ ] Run Lighthouse audit → score >90 for performance, accessibility
- [ ] Test with 100+ bills → no lag when scrolling or searching
- [ ] Test Hebrew RTL rendering → everything aligned correctly

is it hard? i dont want to install crap on my pc. i have npm, if its easy so ok.

### Security Verification
- [ ] Backup data is encrypted (can't read raw file)
- [ ] API keys not visible in localStorage (encrypted)
- [ ] No sensitive data in browser console or network tab

as stated before, save for later time. its intresting. how to do this for later, in ideas, and note on readme. (in todo maybe?)

---

## 📊 Summary

### By Priority
- **🔴 Critical (4 tasks):** ID collision, localStorage quota, cloud encryption, build tooling
- **🟡 Important (11 tasks):** State management, UI refactoring, loading states, etc.
- **🟢 Nice to have (16 tasks):** Modal UX, search, undo, testing, documentation, etc.

### By Estimated Effort
- **Quick wins (<1 hour):** 4 tasks
- **Medium (1-3 hours):** 19 tasks
- **Larger (3-6 hours):** 8 tasks
- **Total estimated:** ~60-70 hours (spread across phases)

### Suggested Implementation Order
1. **Week 1:** Phase 1 + Phase 2 (bugs + security) → ~12 hours
2. **Week 2:** Phase 3 (architecture) → ~15 hours
3. **Week 3:** Phase 4 (UX improvements) → ~16 hours
4. **Week 4:** Phase 5 + 6 + 7 (testing + APK + docs) → ~17 hours

---

## 💡 About the Offline Version

**Current state of [electricity_calc_offline.html](electricity_calc_offline.html):**
- ❌ Out of sync with modular version
- ❌ Missing cloud backup functionality entirely
- ❌ Has duplicate CSS (700+ inline lines)
- ❌ Has duplicate `exportToCSV()` function
- ❌ Uses emoji icons instead of Font Awesome

**Recommendation:** 
Delete this file after Phase 3.3 (build tooling) is complete. The build system will automatically generate an up-to-date standalone HTML file from the [src/](src/) folder. This ensures:
- ✅ Only one version to maintain
- ✅ Always in sync
- ✅ Optimized and minified
- ✅ No duplicate code

---

## 🎯 Decision Summary

All architectural decisions are summarized in the table at the top. Key points:

1. **Cloud Backup (Option C):** Keep JSONHosting + add encryption
   - Minimal code changes
   - Data encrypted before sending
   - ⚠️ Still uses CORS proxy (timing visible, content encrypted)

2. **Build Tool:** Vite
   - Fast modern bundler
   - Great developer experience
   - Auto-generates standalone version

3. **State Management:** Custom EventEmitter pattern
   - No framework dependency
   - Lightweight and sufficient for app size
   - Reactive updates throughout UI

4. **Testing:** Vitest + Playwright
   - Fast test execution
   - Good mobile testing support
   - Modern testing APIs

5. **Stay Vanilla JS:** No React/Vue
   - App is small enough
   - Avoid framework overhead
   - Component-style structure without framework

---

## 📝 Your Overall Feedback

Use this space to add general comments, concerns, or questions about the entire plan:

```






```

---

## 🚀 Ready to Start?

Once you've reviewed and commented on this plan:
1. Review all tasks and add feedback in the provided spaces
2. Adjust priorities if needed (change 🔴🟡🟢 markers)
3. Remove or modify tasks you don't want
4. Approve to begin implementation

**Start with:** Phase 1 (Critical Bugs & Foundation) → takes ~4 hours, prevents data loss
