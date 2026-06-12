/**
 * KPISummary — 4-card KPI row for Shopify page.
 * Handles all 5 platform status combinations gracefully.
 * Props: platforms {object}
 */
export default function KPISummary({ platforms }) {
  const shopifyOk = platforms.shopify.status !== "unavailable";
  const tiktokOk  = platforms.tiktok.status  !== "unavailable";
  const bothDown  = !shopifyOk && !tiktokOk;

  const shopify = shopifyOk ? platforms.shopify.data : null;
  const tiktok  = tiktokOk  ? platforms.tiktok.data  : null;

  const totalRevenue = (shopify?.revenue.amount ?? 0) + (tiktok?.revenue.amount ?? 0);
  const totalOrders  = (shopify?.orders.total   ?? 0) + (tiktok?.orders.total   ?? 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const convRate = 3.4; // mock

  function fmtCurrency(n) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  }

  function sourceNote() {
    if (bothDown)   return "All platforms unavailable";
    if (!shopifyOk) return "TikTok only — Shopify unavailable";
    if (!tiktokOk)  return "Shopify only — TikTok unavailable";
    return null;
  }
  const note = sourceNote();

  // Both down — render a degraded state card instead of 4 cards
  if (bothDown) {
    return (
      <div className="kpi-both-down-banner" id="kpi-both-down">
        <span className="kpi-both-down-icon">🔴</span>
        <div>
          <div className="kpi-both-down-title">All platform data is currently unavailable</div>
          <div className="kpi-both-down-sub">Both Shopify and TikTok Shop APIs are not responding. KPI metrics cannot be displayed. We're retrying automatically.</div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      id: "total-sales",
      label: "Total Sales",
      icon: "📈",
      value: fmtCurrency(totalRevenue),
      delta: "+1",
      up: true,
    },
    {
      id: "orders",
      label: "Orders",
      icon: "🗂",
      value: totalOrders.toLocaleString(),
      delta: "+5.2%",
      up: true,
    },
    {
      id: "aov",
      label: "AOV",
      icon: "🧾",
      value: `$${aov.toFixed(2)}`,
      delta: "-1.2%",
      up: false,
      note,
    },
    {
      id: "conversion-rate",
      label: "Conversion Rate",
      icon: "📊",
      value: `${convRate}%`,
      delta: "+0.8%",
      up: true,
    },
  ];

  return (
    <div className="kpi-row" aria-label="KPI summary">
      {cards.map((c) => (
        <div key={c.id} id={`kpi-${c.id}`} className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{c.label}</span>
            <span className="kpi-card-icon">{c.icon}</span>
          </div>
          <div className="kpi-card-value">{c.value}</div>
          <div className={`kpi-card-delta ${c.up ? "delta-up" : "delta-down"}`}>
            {c.up ? "↑" : "↓"} {c.delta}
          </div>
          {c.note && <div style={{ fontSize: "0.67rem", color: "var(--amber)", marginTop: 2, fontWeight: 600 }}>{c.note}</div>}
        </div>
      ))}
    </div>
  );
}
