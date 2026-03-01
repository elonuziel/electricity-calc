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

## 🎯 Key Decisions

1. **Cloud Backup (Option C):** Keep JSONHosting + add encryption
2. **Build Tool:** Vite
3. **State Management:** Custom EventEmitter pattern
4. **Testing:** Vitest + Playwright
5. **Storage:** Keep localStorage
6. **UI Framework:** Stay vanilla JS

---

## 📝 Implementation Tasks

### Phase 1: Critical Bugs & Foundation
- Task 1.1: Fix bill ID collision bug
- Task 1.2: Add localStorage quota handling
- Task 1.3: Add global error boundary

### Phase 2: Security Overhaul
- Task 2.3: Add input sanitization for CSV import
- Task 2.4: Add data validation for cloud restore

### Phase 3: Architecture & Code Quality
- Task 3.1: Implement proper state management
- Task 3.2: Refactor UI for separation of concerns
- Task 3.3: Add build tooling (Vite) → auto-generate standalone HTML
- Task 3.4: Add configuration management
- Task 3.5: Optimize rendering performance
- Task 3.6: Add JSDoc comments

### Phase 4: UX Improvements
- Task 4.1: Add loading states
- Task 4.2: Add offline detection
- Task 4.3: Improve modal UX
- Task 4.4: Add empty state improvements
- Task 4.6: Add undo functionality
- Task 4.7: Improve error messages

### Phase 6: Capacitor & APK
- Task 6.1: Fix Capacitor configuration

### Phase 7: Documentation
- Task 7.1: Update README.md
- Task 7.2: Add inline documentation

---

## 📊 Summary

- **Total tasks:** 21 (deferred testing, advanced features saved for later)
- **Estimated effort:** ~40-50 hours
- **Priority:** Phase 1→2→3 first, then Phase 4 + 6 + 7

---

## 🎯 Deferred for Later

These are interesting but deferred based on your feedback:
- Phase 2.1: Cloud encryption/credentials enhancement
- Phase 4.5: Advanced bill search and filtering
- Phase 4.8: PDF reports and charts export
- Phase 5: Complete testing suite (unit + E2E + linting)
- Phase 4.8: Advanced export options

See individual tasks in full plan for details.
