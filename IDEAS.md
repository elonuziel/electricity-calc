# 💡 Ideas & Future Plans

Features and improvements deferred for a future time. These are interesting enhancements that are intentionally out of scope for the current overhaul.

---

## 🔒 Security Enhancements

### Client-Side Cloud Data Encryption
**What:** Encrypt all data before sending it through the CORS proxy to JSONHosting.
- Use the Web Crypto API (AES-GCM) to encrypt/decrypt data with a user-provided password
- Even if the proxy intercepts the data, the content is unreadable
- User would enter an encryption password when backing up or restoring

**Why deferred:** The CORS proxy is a low-risk trust boundary for personal use. Encryption adds password-management burden for a personal app. Worth adding if the app ever handles more sensitive data.

### Encrypted API Credentials in localStorage
**What:** Store the JSONHosting ID and Edit Key encrypted, not as plain text.
- Use a master password + Web Crypto API with a password-derived key
- Prompt for master password on first run
- Display a clear security notice: "Data is stored in the browser — not 100% secure on shared devices"

**Why deferred:** For a personal device app, the risk is low. Worth adding if the app is used on shared computers.

---

## 🔍 Bill Search & Filtering
**What:** A search/filter bar above the bills list.
- Text search (highlight matches)
- Filter by date range (from / to date pickers)
- Filter by apartment (top / bottom / common area)
- "Clear filters" button

**Why deferred:** Not needed until the bill list gets long enough to be inconvenient.

---

## 📊 Advanced Data Export
**What:** More export options beyond CSV.
- JSON export (human-readable full data backup)
- Print-friendly view (styled for browser print / paper)
- Optional: PDF report with jsPDF library
- Optional: Consumption-over-time charts with Chart.js

**Why deferred:** CSV is sufficient for current needs. Add when users need reporting.

---

## 🧪 Automated Testing Suite
**What:** Unit and end-to-end test coverage.
- **Unit tests:** Vitest for `calculator.js`, `validation.js`, CSV parsing, state management
- **E2E tests:** Playwright for full user workflows (add bill → verify → delete → undo)
- **Linting:** ESLint + Prettier with pre-commit hooks (Husky)
- **Coverage target:** ≥ 70%

**Why deferred:** The app logic is relatively simple and well-understood. Tests become more valuable as the codebase grows or multiple contributors are involved.

---

## 📝 Notes
- All of the above were discussed and intentionally deferred during the initial overhaul planning.
- See `@old/New Text Document.md` for the full annotated plan with original rationale.
