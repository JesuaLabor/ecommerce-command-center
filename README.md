# eCommerce Command Center

A unified analytics dashboard for merchants selling on both **Shopify** and **TikTok Shop**. Built as a design/engineering assignment demonstrating component architecture, API contract design, and graceful partial-failure handling.

---

## Quick Start

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

Use the **Demo Mode** dropdown in the header to toggle between:
- ✅ All Healthy — both platforms live
- ⚠️ TikTok Stale — TikTok data is 18 min old (exceeds 15 min threshold)
- 🔴 TikTok Down — TikTok API unavailable, Shopify-only view

---

## Project Structure

```
src/
├── api/
│   └── mockData.js          # Mock API responses + fetchDashboard()
├── components/
│   ├── Header.jsx            # Merchant branding, date, scenario switcher
│   ├── SyncStatusBanner.jsx  # Per-platform sync status + tooltips
│   ├── KPISummary.jsx        # Revenue / Orders / Units Sold cards
│   ├── InventoryHealth.jsx   # Low stock + out-of-stock + SKU summary
│   ├── RecentOrders.jsx      # Unified order feed from both platforms
│   └── LoadingScreen.jsx     # Skeleton loading state
├── App.jsx                   # Root — owns all global state
└── index.css                 # Design system + all component styles
docs/
└── api-contract.json         # Full API contract (Deliverable 3)
ASSUMPTIONS.md                # All documented assumptions
README.md                     # This file
```

---

## Deliverable 2 — Component Architecture

### State Ownership

| Component | State Type | State Held | Responsibility |
|---|---|---|---|
| `App` | **Global** | `dashboardData`, `loading`, `error`, `scenario`, `lastRefreshed` | Root orchestrator. Fetches data, owns all shared state, passes props down. |
| `Header` | Presentational | None | Renders merchant name, date, platform badges, demo scenario switcher. Calls `onScenarioChange` prop. |
| `SyncStatusBanner` | **Local** | `tooltipVisible` (string\|null) | Shows per-platform sync status. Manages tooltip open/close locally — no need to lift this to parent. |
| `KPISummary` | Presentational | None | Renders Revenue/Orders/Units cards with per-platform breakdown. Degrades gracefully when TikTok is unavailable. |
| `InventoryHealth` | **Local** | `showAll` (boolean) | Merges inventory from both platforms. Manages "show more/less" list toggle locally. |
| `RecentOrders` | Presentational | None | Renders unified order feed. Shows a notice row when TikTok is unavailable — never hides the section. |
| `LoadingScreen` | Presentational | None | Self-contained skeleton shown during data fetch. No props needed. |

### State Lift Rationale
- `tooltipVisible` stays in `SyncStatusBanner` because no other component cares about which tooltip is open.
- `showAll` stays in `InventoryHealth` because it's a pure UI toggle with no cross-component implications.
- Everything else lives in `App` so all panels share a single source of truth from the API response.

---

## Deliverable 4 — Engineering & UX Decisions

### Trade-off: What was excluded and why?

**Customer Lifetime Value (CLV) was intentionally excluded.**

CLV requires historical cohort data — multiple API calls across date ranges, plus complex aggregation logic. Including it in a single `/api/v1/dashboard` endpoint would:

1. Increase aggregator latency significantly (sequential or heavier parallel fetches)
2. Require a separate data warehouse or analytics store beyond platform APIs
3. Add architectural complexity (caching strategy, cohort definition logic) disproportionate to its daily operational value

A merchant checking their morning dashboard cares about **today's revenue and inventory** — not a metric that changes meaningfully on a daily basis. CLV belongs in a dedicated analytics/growth view, not the command center.

---

### Edge Case: How does the UI communicate TikTok delays without causing panic?

**Visual pattern:**

1. **Sync Status Banner** (top of dashboard) — an amber-bordered card with a `⚠️` icon reads: *"Delayed · 18 min — Last synced 18 min ago · Showing last known data."* The border pulses gently to draw attention without alarming.

2. **Hover tooltip** — on hover, a calm plain-English explanation appears: *"TikTok Shop data is 18 minutes old (threshold: 15 min). This is usually resolved within a few minutes. Your dashboard continues to show the most recent available data."*

3. **KPI cards and panels** — TikTok data still renders (last-known values). A `Shopify only *` disclaimer appears only when TikTok is fully unavailable, not when stale.

4. **Section badges** — `Shopify only` amber chip appears on section headings only in the unavailable state.

**What we intentionally avoided:**
- ❌ No red color for staleness (red = unavailable only)
- ❌ No blank/empty panels — stale data is always shown
- ❌ No error modals or blocking overlays
- ❌ No alarming language like "ERROR," "FAILED," or "BROKEN"

**Reasoning:** Non-technical merchants cannot act on "upstream 5xx." They can act on "TikTok is running a few minutes behind — here's what we have." Calm, informational, actionable.

---

## See Also
- [`docs/api-contract.json`](./docs/api-contract.json) — Full API contract with 3 scenarios
- [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) — All documented assumptions
