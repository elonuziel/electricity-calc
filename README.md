# ⚡ Electricity Bill Splitter

A single-page Hebrew calculator that splits a shared electricity bill between two apartments (upper / lower) based on individual meter readings.

[![Download APK](https://img.shields.io/github/v/release/elonuziel/electricity-calc?label=Download%20APK&logo=android&color=3DDC84)](https://github.com/elonuziel/electricity-calc/releases/latest)

> 📱 **Android APK available!** Go to the [Releases](https://github.com/elonuziel/electricity-calc/releases/latest) page and download the latest `.apk` file to install directly on your Android device.

## Features

| Feature | Description |
|---|---|
| **Bill history** | Add, edit, and delete bills. All data persists in `localStorage`. |
| **Automatic previous-reading tracking** | Each new bill picks up the last known meter reading automatically. |
| **Common-area display** | Shows the delta between the main meter's total kWh and the sum of the apartment readings — the "shared / common area" electricity and its cost. |
| **Input validation** | Rejects zero kWh, negative consumption (current < previous reading), and apartment consumption exceeding the total. Errors are shown inline. |
| **CSV export** | Exports all bills (including common-area columns) to a `.csv` file with Hebrew BOM so Excel opens it correctly. |
| **CSV import** | Import bills from a previously exported CSV. Duplicate dates are skipped. |
| **Cloud backup** | Save and restore all data via [JSONHosting.com](https://jsonhosting.com). Leave ID & Edit Key fields empty to create a new backup — credentials are generated automatically. Paste an existing ID to restore on any device. |
| **Initial readings config** | Set the starting meter values (before the first bill) via the settings panel. |

## How the Calculation Works

$$
\text{rate} = \frac{\text{Total Bill (₪)}}{\text{Total Consumption (kWh)}}
$$

For each apartment:

$$
\text{consumption} = \text{current reading} - \text{previous reading}
$$

$$
\text{payment} = \text{consumption} \times \text{rate}
$$

Common-area usage:

$$
\text{common kWh} = \text{total kWh} - (\text{upper consumption} + \text{lower consumption})
$$

## Usage

1. Open `electricity_calc_standalone.html` in any modern browser.
2. Click the ⚙️ gear icon to set initial meter readings (one-time setup).
3. Click **הוספת חשבון חדש** to add a new bill — enter the main bill total, total kWh, and each apartment's current meter reading.
4. Results are displayed instantly with per-apartment cost and common-area breakdown.
5. Use **ייצוא לאקסל** / **ייבוא מאקסל** in settings to back up or restore data via CSV.
6. Use **שמור לענן** / **טען מענן** in the cloud backup section to save/restore data online via JSONHosting.com. Save the ID and Edit Key you receive — you'll need them to restore or update later. Use the **copy buttons** to quickly save these keys.

## File Structure

```
src/                               — Source code used for building the Android APK (Capacitor)
.github/workflows/                 — GitHub Actions for automated APK builds (manual trigger)
electricity_calc_standalone.html   — Bundled standalone version (Best for daily use on Desktop/iOS)
old/                               — Legacy versions, old PWA implementation, and backups
capacitor.config.json              — Capacitor configuration for the APK wrapper
README.md                          — This file
```

## Tech Stack

- **HTML / CSS / JS** — No build step, no frameworks
- **Tailwind CSS** (CDN) — Utility-first styling
- **Font Awesome** (CDN) — Icons
- **localStorage** — Client-side persistence
- **[JSONHosting.com](https://jsonhosting.com)** — Free cloud JSON storage for backup/restore
