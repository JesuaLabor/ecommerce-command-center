# Assumptions

Documented assumptions made during design and implementation.

## Data Freshness
- **TikTok staleness threshold = 15 minutes.** Data older than 15 min is classified as `stale`. This is based on the typical TikTok Shop API polling lag of 5–15 minutes, with a 15-minute ceiling chosen as a conservative threshold that avoids false alarms.
- **Stale ≠ wrong.** Stale data is surfaced to the merchant with a visible timestamp — it is never silently hidden. A merchant acting on 18-minute-old revenue data is better than a merchant acting on no data.

## Platform Status Definitions
- `"ok"` → data fetched successfully AND age < 15 minutes
- `"stale"` → data fetched successfully BUT age ≥ 15 minutes
- `"unavailable"` → upstream API timed out (> 10s) OR returned 5xx

## Merchant Context
- Merchants are assumed to be **non-technical.** All error messaging uses plain English, avoids codes/stack traces, and frames issues as "we're on it" rather than "the API is broken."
- Merchants check this dashboard daily, primarily in the morning. Optimizing for the **9 AM daily check** use case took priority over real-time trading-floor-style refresh rates.

## Data Scope
- Dashboard covers a **single calendar date** (today by default).
- Multi-date range analysis (trends, cohorts) is out of scope for this version.
- **Customer Lifetime Value (CLV) is intentionally excluded** — see README trade-off decision.

## API Architecture
- A **single aggregator endpoint** fans out to both platform APIs in parallel. The aggregator never fails the whole response due to a single platform error.
- HTTP status 200 is returned even when TikTok is unavailable. Platform-level failures are communicated inside the response body, not via HTTP error codes.

## UI/UX
- The dashboard **never blanks a section** due to platform failure. Every panel renders in some state (live, stale, or degraded placeholder).
- Color coding: green = ok, amber = stale/delayed, red = unavailable. Red is never shown for staleness alone — only true unavailability.
