/**
 * StorePerformance — the main table panel.
 * Shows per-store sales, orders, status, and a mini trend sparkline.
 * Props: platforms {object}
 */
const STORES = [
  { id: "main-us",   icon: "🛍",  name: "Main Store (US)",       platform: "shopify", sales: 84200,  orders: 842, active: true,  trend: [3,5,4,7,6,8,9] },
  { id: "boutique",  icon: "🎀",  name: "Boutique Collection",    platform: "shopify", sales: 42150,  orders: 315, active: true,  trend: [4,4,5,5,6,5,7] },
  { id: "outlet",    icon: "🏷",  name: "Outlet Store",           platform: "shopify", sales: 0,      orders: 12,  active: false, trend: [2,1,1,0,0,0,0] },
  { id: "main-eu",   icon: "🌍",  name: "Main Store (EU)",        platform: "shopify", sales: 16150,  orders: 263, active: true,  trend: [2,3,3,4,3,4,5] },
  { id: "tiktok-us", icon: "♪",  name: "TikTok Shop (US)",       platform: "tiktok",  sales: 4320,   orders: 89,  active: true,  trend: [1,2,3,3,4,4,5] },
];

function MiniTrend({ values, active }) {
  const max = Math.max(...values, 1);
  return (
    <div className="trend-bar">
      {values.map((v, i) => (
        <span
          key={i}
          style={{ height: `${Math.max(3, Math.round((v / max) * 22))}px` }}
          className={i === values.length - 1 || v === max ? "hi" : ""}
        />
      ))}
    </div>
  );
}

export default function StorePerformance({ platforms }) {
  const tiktokOk = platforms.tiktok.status !== "unavailable";
  const tiktokStale = platforms.tiktok.status === "stale";
  const shopifyOk = platforms.shopify.status !== "unavailable";
  const shopifyStale = platforms.shopify.status === "stale";
  const bothDown = !shopifyOk && !tiktokOk;

  function fmtSales(n) {
    if (n === 0) return <span className="cell-zero">$0</span>;
    return <span className="cell-sales">${n.toLocaleString()}</span>;
  }

  return (
    <div className="store-performance-card">
      <div className="store-performance-header">
        <span className="store-performance-title">Store Performance</span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {bothDown && <span className="sync-pill sync-pill-down">🔴 All platforms unavailable</span>}
          {!bothDown && !shopifyOk && <span className="sync-pill sync-pill-down">🔴 Shopify unavailable</span>}
          {!bothDown && !tiktokOk && <span className="sync-pill sync-pill-down">🔴 TikTok unavailable</span>}
          {!bothDown && shopifyStale && tiktokStale && <span className="sync-pill sync-pill-stale">⚠️ Shopify & TikTok delayed</span>}
          {!bothDown && shopifyStale && !tiktokStale && <span className="sync-pill sync-pill-stale">⚠️ Shopify delayed · {platforms.shopify.staleness_minutes} min</span>}
          {!bothDown && tiktokStale && !shopifyStale && <span className="sync-pill sync-pill-stale">⚠️ TikTok delayed · {platforms.tiktok.staleness_minutes} min</span>}
          {shopifyOk && tiktokOk && !shopifyStale && !tiktokStale && <span className="sync-pill sync-pill-ok">✓ All synced</span>}
          <button className="three-dot-btn" aria-label="More options" id="store-performance-menu">⋯</button>
        </div>
      </div>

      <table className="store-table" aria-label="Store performance table">
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Status</th>
            <th>Today's Sales</th>
            <th>Open Orders</th>
            <th>7-Day Trend</th>
          </tr>
        </thead>
        <tbody>
          {STORES.map((store) => {
            const isTiktok  = store.platform === "tiktok";
            const isShopify = store.platform === "shopify";
            const unavailable = (isTiktok && !tiktokOk) || (isShopify && !shopifyOk);
            const stale = (isTiktok && tiktokStale) || (isShopify && shopifyStale);

            return (
              <tr key={store.id} id={`store-row-${store.id}`}>
                <td>
                  <div className="store-name-cell">
                    <div className="store-avatar">{store.icon}</div>
                    <span className="store-name-text">{store.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${store.active && !unavailable ? "status-active" : "status-inactive"}`}>
                    <span className="status-dot" />
                    {unavailable ? "Unavailable" : store.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {unavailable
                    ? <span className="cell-zero">—</span>
                    : fmtSales(store.sales)
                  }
                  {stale && <span style={{ fontSize: "0.62rem", color: "var(--amber)", marginLeft: 4 }}>~</span>}
                </td>
                <td>
                  {unavailable
                    ? <span className="cell-zero">—</span>
                    : <span className="cell-orders">{store.orders}</span>
                  }
                </td>
                <td>
                  {unavailable
                    ? <span className="cell-zero">—</span>
                    : <MiniTrend values={store.trend} active={store.active} />
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
