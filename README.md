# eCommerce Intelligence Dashboard

A unified, executive-grade intelligence dashboard for merchants selling on both **Shopify** and **TikTok Shop**. Designed and engineered to demonstrate advanced React component architecture, resilient API contract design, high-density styling, and graceful partial-failure handling.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) (or the port specified in terminal).

### Demo Mode Dropdown
Use the **Demo Mode** selector in the header to simulate multiple partial-failure and replication lag scenarios:
- **All Healthy**: Both platforms fully operational.
- **TikTok Stale**: TikTok data is 18 minutes old (exceeds the 15-minute SLA).
- **Shopify Stale**: Shopify data is 20 minutes old (exceeds the 15-minute SLA).
- **TikTok Down**: TikTok API is offline (graceful Shopify-only degraded layout).
- **Shopify Down**: Shopify API is offline (graceful TikTok-only degraded layout).
- **Both Down**: Severe outage degraded placeholder view.

---

## 📂 Project Structure

```
src/
├── api/
│   └── mockData.js          # Mock schemas, scenario rules, and fetch dashboard API
├── components/
│   ├── Header.jsx            # Merchant branding, current date, and demo dropdown
│   ├── SyncStatusBanner.jsx  # Pulsing per-platform status bars + help tooltips
│   ├── KPISummary.jsx        # Revenue / Orders / Units Sold KPI cards with source splits
│   ├── InventoryHealth.jsx   # Stock levels, critical tables, and Interactive Restock Modal
│   ├── RecentOrders.jsx      # High-density orders dashboard with filters, search, and KPI summaries
│   ├── OrderRow.jsx          # Reusable component rendering individual platform orders
│   └── LoadingScreen.jsx     # App-level skeleton loading screen (initial mount only)
├── App.jsx                   # Global state orchestrator and transition manager
└── index.css                 # Core design tokens, premium dark layout, and keyframe animations
docs/
└── api-contract.json         # Unified JSON API aggregator contract details
ASSUMPTIONS.md                # Design assumptions and architectural rationale
README.md                     # This documentation file
```

---

## 🏗️ Deliverable 2 — Component Architecture & State Lift

### State Ownership Matrix

| Component | State Type | State Held | Responsibility |
|---|---|---|---|
| `App` | **Global** | `dashboardData`, `loading`, `error`, `scenario` | Root coordinator. Triggers fetches, shares API payload down, and controls loading transitions. |
| `Header` | Presentational | None | Renders app branding, active page indicator, and forwards scenario switches. |
| `SyncStatusBanner` | **Local** | `tooltipVisible` (platform name or null) | Manages active tooltip popovers locally (does not affect sibling layout). |
| `KPISummary` | Presentational | None | Displays performance metrics. Disclaims unavailable sources. |
| `InventoryHealth` | **Local** | `localInventory`, `restockItem`, `restockQty`, `toastMessage`, `showAll` | Manages stock replenishment flow, modal displays, success toast timers, and pagination locally. |
| `RecentOrders` | **Local** | `filterPlatform`, `filterStatus`, `searchQuery` | Controls filtering, searching, and pagination of the unified orders feed. |
| `OrderRow` | Presentational | None | Reusable presentation node rendering standard order details across all feeds. |

### Architectural Decoupling & DRY Principles
- **OrderRow Abstraction**: Extracted identical order rendering logic from Shopify-specific and TikTok-specific feeds into `OrderRow.jsx`, cutting out 68 lines of duplicate code.
- **Local Optimistic Mutation**: The Restock Modal in `InventoryHealth.jsx` uses local state to immediately update KPI metrics and transition restocked items out of critical list tables without waiting for a backend poll, mimicking optimistic UI updates.

---

## 🚀 Deliverable 4 — Key Engineering & UX Upgrades

### 1. Executive-Grade Orders Control Center
Replaced a simple timeline list with a command center page layout:
- **Summary Cards**: Displays Total Order Volume, Pending Orders, and Fulfilled Orders.
- **Advanced Filtering**: Live search by Order ID/Customer Name and instant filters for Platform (Shopify/TikTok) and Status (Pending/Fulfilled/Cancelled).
- **Platform Tags**: Custom branded badges to clearly separate sales channels.

### 2. Interactive Stock Replenishment Modal
Merchants can now restock items directly from the critical low stock alert table:
- Clicking **Restock →** opens a styled modal popover.
- Submitting an order updates stock counts in real-time, increases overall inventory health indicators, and removes the item from the critical warnings view.
- A sliding success Toast notification confirms the restock operation.

### 3. Smooth, SaaS-Style Loading Transitions
Eliminated layout shifts and blank screen flashes when switching scenarios or syncing data:
- **Skeleton Loader**: Shown on initial mount to establish structure.
- **Top Loading Progress Bar**: On subsequent refreshes, a slim animated gradient bar runs at the top of the main container, and the content below dims slightly (`.loading-dimmed`). Sidebar navigation and header widgets remain fully interactive.

---

## 📈 Excluded Features & Technical Trade-offs
- **Customer Lifetime Value (CLV)**: Intentionally excluded. Aggregating historical cohort curves across multiple endpoints significantly slows down response times. Real-time command dashboards optimize for daily operations (orders, current inventory levels), while cohort calculations belong in a slower offline analytics tool.
- **Write-back Persistence**: Because this is a front-end evaluation prototype, restock actions update React state. Performing a hard reload or changing demo scenarios resets the catalog back to server values.
