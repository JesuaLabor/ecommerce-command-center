import { useState } from "react";

// ─── Monochrome SVG Icons ────────────────────────────────────────
const IconTrendUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconFolder = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
);
const IconBox = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
  </svg>
);
const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────
function generateHourlyRevenue() {
  // 24 hours starting 19:00 yesterday → 17:00 today
  const labels = ["19", "21", "23", "01", "03", "05", "07", "09", "11", "13", "15", "17"];
  const today = [8, 10, 6, 4, 3, 2, 5, 14, 22, 28, 26, 30, 27, 24, 20, 22, 18, 16, 14, 12, 10, 8, 9, 11];
  const yesterday = [6, 8, 4, 3, 2, 1, 4, 10, 16, 20, 18, 22, 20, 18, 15, 16, 14, 12, 10, 8, 7, 6, 7, 8];
  return { labels, today, yesterday };
}

function generatePeakHours() {
  // 24 bars representing each hour
  return [2, 3, 4, 3, 2, 1, 2, 5, 10, 14, 18, 20, 19, 15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2];
}

function generateOrdersTrend() {
  // 7-day trend as SVG polyline points
  return [180, 210, 195, 240, 220, 260, 230, 280, 260, 300, 285, 310];
}

// ─── Sub-components ─────────────────────────────────────────────

function StatCard({ id, icon, label, value, delta, up, extra }) {
  return (
    <div className="ov-stat-card" id={`ov-stat-${id}`}>

      {/* ── Header: dark icon chip + label + ellipsis ── */}
      <div className="ov-stat-header">
        <span className="ov-stat-icon">{icon}</span>
        <span className="ov-stat-label">{label}</span>
        <button className="ov-menu-btn" aria-label="Options">⋯</button>
      </div>

      {/* ── Body: large value ── */}
      <div className="ov-stat-body">
        <div className="ov-stat-value">{value}</div>
      </div>

      {/* ── Footer: filled circle with arrow + text ── */}
      <div className="ov-stat-footer">
        <div className={`ov-stat-delta ${up ? "delta-up" : "delta-down"}`}>
          <span className="ov-delta-circle">{up ? "↑" : "↓"}</span>
          {delta} since last month
        </div>
        {extra && <div className="ov-stat-extra">{extra}</div>}
      </div>

    </div>
  );
}


/**
 * PlatformStatusStrip — shown below stat cards when any platform is not "ok".
 * Gives the merchant a clear, calm indicator of what data is (and isn't) live.
 */
function PlatformStatusStrip({ platforms }) {
  const shopify = platforms.shopify;
  const tiktok = platforms.tiktok;
  if (shopify.status === "ok" && tiktok.status === "ok") return null;

  function formatAgo(iso) {
    if (!iso) return null;
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    return mins < 1 ? "just now" : `${mins} min ago`;
  }

  const items = [
    {
      key: "shopify",
      label: "Shopify",
      status: shopify.status,
      ago: formatAgo(shopify.last_synced),
    },
    {
      key: "tiktok",
      label: "TikTok Shop",
      status: tiktok.status,
      ago: formatAgo(tiktok.last_synced),
      staleness: tiktok.staleness_minutes,
      error: tiktok.error?.message,
    },
  ];

  return (
    <div className="ov-status-strip">
      <span className="ov-status-strip-label">Data sources:</span>
      {items.map((item) => (
        <div key={item.key} className={`ov-status-chip ov-status-${item.status}`}>
          <span className="ov-status-chip-dot" />
          <span className="ov-status-chip-name">{item.label}</span>
          {item.status === "ok" && (
            <span className="ov-status-chip-detail">Live · {item.ago}</span>
          )}
          {item.status === "stale" && (
            <span className="ov-status-chip-detail">Delayed · {item.staleness} min old · Showing last known</span>
          )}
          {item.status === "unavailable" && (
            <span className="ov-status-chip-detail">Unavailable · Shopify data shown only</span>
          )}
        </div>
      ))}
    </div>
  );
}

function GrossRevenueChart({ data }) {
  const max = Math.max(...data.today, ...data.yesterday);
  const hours = ["19:00", "21:00", "23:00", "01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00"];

  return (
    <div className="ov-revenue-chart">
      <div className="ov-chart-bars">
        {data.today.map((v, i) => (
          <div key={i} className="ov-bar-group">
            <div className="ov-bar ov-bar-yesterday"
              style={{ height: `${Math.round((data.yesterday[i] / max) * 100)}%` }} />
            <div className="ov-bar ov-bar-today"
              style={{ height: `${Math.round((v / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="ov-chart-labels">
        {hours.map((h, i) => (
          <span key={i} className="ov-chart-label">{h}</span>
        ))}
      </div>
    </div>
  );
}

function BudgetCard({ used, total }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="ov-budget-card" id="ov-budget">
      <div className="ov-card-header">
        <span className="ov-card-icon">⏱</span>
        <span className="ov-card-title">Today&apos;s budget</span>
        <button className="ov-expand-btn" aria-label="Expand">⤢</button>
      </div>
      <div className="ov-budget-row">
        <div>
          <div className="ov-budget-label">Used today</div>
          <div className="ov-budget-amount">${used.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="ov-budget-label">Today&apos;s allowance</div>
          <div className="ov-budget-amount">${total.toFixed(2)}</div>
        </div>
      </div>
      <div className="ov-progress-wrap">
        <div className="ov-progress-track">
          <div className="ov-progress-fill" style={{ width: `${pct}%` }} />
          <div className="ov-progress-marker" style={{ left: `${pct}%` }}>
            <span className="ov-progress-label">{pct}% used</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeakHoursCard({ data }) {
  const max = Math.max(...data);
  const peakIdx = data.indexOf(max);
  const pct = Math.round((max / data.reduce((a, b) => a + b, 0)) * 100);

  return (
    <div className="ov-peak-card" id="ov-peak-hours">
      <div className="ov-card-header">
        <span className="ov-card-icon">⏱</span>
        <span className="ov-card-title">Peak hours</span>
        <button className="ov-expand-btn" aria-label="Expand">⤢</button>
      </div>
      <div className="ov-peak-time">11 AM – 1 PM</div>
      <div className="ov-peak-sub">~{pct}% of orders in the busiest hour</div>
      <div className="ov-peak-bars">
        {data.map((v, i) => (
          <div
            key={i}
            className={`ov-peak-bar ${i === peakIdx || i === peakIdx + 1 ? "ov-peak-bar-hi" : ""}`}
            style={{ height: `${Math.max(4, Math.round((v / max) * 52))}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function OrdersTrendChart({ data }) {
  const w = 600, h = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${Math.round(i * step)},${Math.round(h - ((v - min) / range) * (h - 10) - 5)}`)
    .join(" ");

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ov-orders-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="orders-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#orders-fill)" />
      <polyline points={points} fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function OverviewPage({ platforms }) {
  const [statsPeriod, setStatsPeriod] = useState("7d");

  const shopifyOk = platforms.shopify.status !== "unavailable";
  const shopify = shopifyOk ? platforms.shopify.data : null;
  const tiktok = platforms.tiktok.status !== "unavailable" ? platforms.tiktok.data : null;
  const bothDown = !shopifyOk && !tiktok;

  const totalRevenue = (shopify?.revenue.amount ?? 0) + (tiktok?.revenue.amount ?? 0);
  const totalOrders = (shopify?.orders.total ?? 0) + (tiktok?.orders.total ?? 0);
  const totalUnits = (shopify?.units_sold ?? 0) + (tiktok?.units_sold ?? 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  function fmtCurrency(n) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  }

  const tiktokDown = platforms.tiktok.status === "unavailable";
  const tiktokStale = platforms.tiktok.status === "stale";
  let dataWarning = null;
  if (bothDown) dataWarning = "⚠ All platforms unavailable";
  else if (!shopifyOk) dataWarning = "⚠ TikTok only — Shopify unavailable";
  else if (tiktokDown) dataWarning = "⚠ Shopify only — TikTok unavailable";
  else if (tiktokStale) dataWarning = `⚠ TikTok data ${platforms.tiktok.staleness_minutes} min delayed`;

  const statCards = [
    { id: "revenue", icon: <IconTrendUp />, label: "Total Sales",       value: fmtCurrency(totalRevenue),            delta: "+12.4%", up: true,  extra: dataWarning },
    { id: "orders",  icon: <IconFolder />,  label: "Orders",            value: totalOrders.toLocaleString(),         delta: "+5.2%",  up: true,  extra: dataWarning },
    { id: "units",   icon: <IconBox />,     label: "Units Sold",        value: totalUnits.toLocaleString(),          delta: "+4.3%",  up: true,  extra: dataWarning },
    { id: "aov",     icon: <IconTag />,     label: "Avg. Order Value",  value: `$${aov.toFixed(2)}`,                delta: "-0.6%",  up: false, extra: dataWarning },
  ];

  const hourlyData = generateHourlyRevenue();
  const peakData = generatePeakHours();
  const trendData = generateOrdersTrend();

  const today = new Date();
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
  const dateRange = `${weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="ov-root">

      {/* ── Platform status strip — seen first so merchants know data health immediately ── */}
      <PlatformStatusStrip platforms={platforms} />

      {/* ── 1. Stat Cards Row ── */}
      <div className="ov-stat-row">
        {statCards.map((c) => (
          <StatCard key={c.id} {...c} />
        ))}
      </div>

      {/* ── 2. Today Section ── */}
      <div className="ov-section-header">
        <h2 className="ov-section-title">Today</h2>
        <div className="ov-section-actions">
          <button className="btn-outline ov-action-btn" id="btn-customize-today">
            ✦ Customize
          </button>
          <button className="ov-menu-btn" aria-label="More">⋯</button>
        </div>
      </div>

      <div className="ov-today-grid">
        {/* Gross Revenue chart */}
        <div className="ov-revenue-card" id="ov-revenue">
          <div className="ov-card-header">
            <span className="ov-card-icon">↗</span>
            <span className="ov-card-title">Gross Revenue</span>
            <button className="ov-expand-btn" aria-label="Expand">⤢</button>
          </div>
          {/* Legend labels row */}
          <div className="ov-revenue-legend">
            <div className="ov-revenue-legend-item">
              <span className="ov-legend-dot dot-today" />
              <span className="ov-revenue-legend-label">Today</span>
            </div>
            <div className="ov-revenue-legend-item">
              <span className="ov-legend-dot dot-yesterday" />
              <span className="ov-revenue-legend-label">Yesterday</span>
            </div>
            <span className="ov-revenue-delta-badge">↑ 17.0%</span>
          </div>
          {/* Values row */}
          <div className="ov-revenue-values">
            <span className="ov-revenue-val">$243.65</span>
            <span className="ov-revenue-val ov-revenue-val-yesterday">$208.19</span>
          </div>
          <GrossRevenueChart data={hourlyData} />
        </div>

        {/* Right column: Budget + Peak hours */}
        <div className="ov-right-col">
          <BudgetCard used={223.65} total={480.00} />
          <PeakHoursCard data={peakData} />
        </div>
      </div>

      {/* ── 3. Stats Section ── */}
      <div className="ov-section-header">
        <h2 className="ov-section-title">Stats</h2>
        <div className="ov-section-actions">
          <select
            className="scenario-select"
            value={statsPeriod}
            onChange={(e) => setStatsPeriod(e.target.value)}
            id="stats-period"
            aria-label="Stats period"
          >
            <option value="7d">Last 7 days ▾</option>
            <option value="30d">Last 30 days ▾</option>
            <option value="90d">Last 90 days ▾</option>
          </select>
          <button className="btn-outline ov-action-btn" id="btn-date-range-stats">
            📅 {dateRange}
          </button>
          <button className="btn-outline ov-action-btn" id="btn-customize-stats">
            ✦ Customize
          </button>
          <button className="ov-menu-btn" aria-label="More">⋯</button>
        </div>
      </div>

      <div className="ov-stats-card" id="ov-total-orders">
        <div className="ov-card-header">
          <span className="ov-card-icon">🛒</span>
          <span className="ov-card-title">Total Orders</span>
          <button className="ov-expand-btn" aria-label="Expand">⤢</button>
        </div>
        <div className="ov-orders-value">{totalOrders.toLocaleString()}</div>
        <div className="ov-orders-sub">
          Orders completed in the last 7 days
          <span className="delta-up" style={{ marginLeft: 12 }}>↑ 12.5%</span>
        </div>
        <OrdersTrendChart data={trendData} />
      </div>

    </div>
  );
}
