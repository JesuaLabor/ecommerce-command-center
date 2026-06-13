# Assumptions & Design Rationale

This document outlines the core assumptions and architectural decisions made during the design and implementation of the **eCommerce Intelligence Dashboard**.

---

## 1. Data Freshness & Sync Status
- **TikTok Staleness Threshold = 15 Minutes**: TikTok Shop API lag typically ranges from 5–15 minutes. A 15-minute threshold represents a conservative line that avoids generating false alarms for normal replication delays.
- **Stale ≠ Wrong**: Stale data is surfaced to the merchant with an amber-bordered alert banner and timestamp. It is never hidden. Showing data that is 18 minutes old is far more valuable to a merchant than hiding the entire panel.
- **Platform Status Definitions**:
  - `ok`: Data fetched successfully and age < 15 minutes.
  - `stale`: Data fetched successfully but age ≥ 15 minutes.
  - `unavailable`: Upstream platform API timed out (> 10s), returned 5xx, or is offline.

---

## 2. Inventory & Restock Flow
- **Local State Mutation for Simulations**: The "Restock" action operates on a local component state copy inside `InventoryHealth.jsx`. This simulates an optimistic UI pattern: when a restock is ordered, metrics immediately recalculate (healthy counts rise, items transition out of critical tables, and a success toast fires). 
- **Re-sync Reset**: It is assumed that the remote aggregator API is the single source of truth. Therefore, performing a manual "Sync Stores" or changing the Demo Mode dropdown resets the local restock state, pulling fresh data from the server.
- **Client-Side Filtering & Sorting**: Because the critical inventory list is typically under 100 SKUs, search query matching, status sorting, and pagination are performed locally in-memory to deliver sub-millisecond responsiveness.

---

## 3. UI/UX & Transition Continuity
- **Visual Stability (No Layout Shifts)**: Full-page skeleton loading screens are reserved exclusively for the initial app mount. Swapping the entire UI (including the Sidebar and Header) during incremental updates is jarring. 
- **SaaS-Style Progress Indicators**: For subsequent scenario switches or refreshes, we assume a non-blocking top progress bar (GitHub/Shopify style) and slight main content dimming is the optimal pattern to communicate loading without layout shift.
- **Plain-English Error Messaging**: Merchants are assumed to be business-focused, not software engineers. Error states focus on plain-English summaries ("TikTok is running a few minutes behind") rather than developer-centric API stack traces.

---

## 4. Scope & Aggregator API
- **Single Calendar Date**: The dashboard focuses primarily on a single-day performance view (Today) to optimize for the **9 AM daily check** morning routine of merchants.
- **Parallel Fan-out**: The aggregator API fans out requests to platform APIs in parallel. Platform failures are communicated inside the JSON response payload, allowing the dashboard to render gracefully with partial data instead of failing the entire HTTP response.
- **Exclusion of CLV**: Customer Lifetime Value is excluded due to the high database load of cohort calculations, choosing instead to focus on operational real-time metrics.
