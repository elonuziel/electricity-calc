# ⚡ מחשבון חשמל דיירים — Electricity Bill Splitter

A single-page Hebrew calculator that splits a shared electricity bill between two apartments (upper / lower) based on individual meter readings.

## Features

| Feature | Description |
|---|---|
| **Bill history** | Add, edit, and delete bills. All data persists in `localStorage`. |
| **Automatic previous-reading tracking** | Each new bill picks up the last known meter reading automatically. |
| **Common-area display** | Shows the delta between the main meter's total kWh and the sum of the apartment readings — the "shared / common area" electricity and its cost. |
| **Input validation** | Rejects zero kWh, negative consumption (current < previous reading), and apartment consumption exceeding the total. Errors are shown inline. |
| **CSV export** | Exports all bills (including common-area columns) to a `.csv` file with Hebrew BOM so Excel opens it correctly. |
| **CSV import** | Import bills from a previously exported CSV. Duplicate dates are skipped. |
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

1. Open `index.html` in any modern browser.
2. Click the ⚙️ gear icon to set initial meter readings (one-time setup).
3. Click **הוספת חשבון חדש** to add a new bill — enter the main bill total, total kWh, and each apartment's current meter reading.
4. Results are displayed instantly with per-apartment cost and common-area breakdown.
5. Use **ייצוא לאקסל** / **ייבוא מאקסל** in settings to back up or restore data.

## File Structure

```
index.html   — The entire app (single self-contained file)
README.md    — This file
LICENSE      — License
```

## Tech Stack

- **HTML / CSS / JS** — No build step, no frameworks
- **Tailwind CSS** (CDN) — Utility-first styling
- **Font Awesome** (CDN) — Icons
- **localStorage** — Client-side persistence
