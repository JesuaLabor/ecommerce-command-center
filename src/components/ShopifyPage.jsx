import { useState } from "react";
import StorePerformance from "./StorePerformance";

/**
 * ShopifyPage — dedicated dashboard for Shopify platform data only.
 * Shows Shopify-specific KPIs, store table, orders, and inventory.
 * TikTok status does not affect this page.
 */

function fmtCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function KPICard({ id, label, icon, value, delta, up, note }) {
  return (
    <div className="kpi-card" id={`shopify-kpi-${id}`}>
      <div className="kpi-card-header">
        <span className="kpi-card-label">{label}</span>
        <span className="kpi-card-icon">{icon}</span>
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className={`kpi-card-delta ${up ? "delta-up" : "delta-down"}`}>
        {up ? "↑" : "↓"} {delta}
      </div>
      {note && (
        <div style={{ fontSize: "0.67rem", color: "var(--amber)", marginTop: 2, fontWeight: 600 }}>
          {note}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }) {
  const statusMap = {
    fulfilled: { label: "Fulfilled", className: "status-fulfilled" },
    pending:   { label: "Pending",   className: "status-pending"   },
    cancelled: { label: "Cancelled", className: "status-cancelled" },
  };
  const { label, className } = statusMap[order.status] ?? { label: order.status, className: "status-default" };

  return (
    <div className="order-item" id={`shopify-order-${order.id}`}>
      <div className="order-left">
        <span className="order-source-dot dot-shopify" />
        {/* Product thumbnail */}
        {order.item_image && (
          <div className="order-product-thumb">
            <span>{order.item_image}</span>
          </div>
        )}
        <div className="order-info">
          <span className="order-id">{order.id}</span>
          {order.item_name && <span className="order-item-name">{order.item_name}{order.items > 1 ? ` +${order.items - 1}` : ""}</span>}
          <span className="order-customer">{order.customer}</span>
        </div>
      </div>
      <div className="order-right">
        <span className="order-total">${order.total.toFixed(2)}</span>
        <span className={`order-status ${className}`}>{label}</span>
        <span className="order-time">{order.time}</span>
      </div>
    </div>
  );
}

function InventorySection({ inv, stale }) {
  const [showAll, setShowAll] = useState(false);
  const low = inv?.low_stock ?? [];
  const out = inv?.out_of_stock ?? [];
  const displayed = showAll ? low : low.slice(0, 3);

  return (
    <section className="inventory-section" aria-label="Shopify Inventory Health">
      <h2 className="section-title">
        <span className="section-icon">🗃️</span> Inventory Health
        {stale && <span className="section-badge badge-stale">Stale data</span>}
      </h2>
      <div className="inventory-grid">

        {/* Out of Stock */}
        <div className="inventory-card alert-card">
          <div className="inv-card-header">
            <span className="inv-icon alert-icon">🚨</span>
            <h3 className="inv-card-title">Out of Stock</h3>
            <span className="inv-count alert-count">{out.length}</span>
          </div>
          {out.length === 0 ? (
            <p className="inv-empty">All items in stock ✓</p>
          ) : (
            <ul className="inv-list">
              {out.map((item) => (
                <li key={item.sku} className="inv-item inv-item-danger">
                  <span className="inv-name">{item.name}</span>
                  <span className="inv-sku">{item.sku}</span>
                  <span className="inv-source-badge shopify-accent">Shopify</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock */}
        <div className="inventory-card warn-card">
          <div className="inv-card-header">
            <span className="inv-icon warn-icon">⚠️</span>
            <h3 className="inv-card-title">Low Stock</h3>
            <span className="inv-count warn-count">{low.length}</span>
          </div>
          {low.length === 0 ? (
            <p className="inv-empty">No low stock items ✓</p>
          ) : (
            <>
              <ul className="inv-list">
                {displayed.map((item) => (
                  <li key={item.sku} className="inv-item inv-item-warn">
                    <div className="inv-item-main">
                      <span className="inv-name">{item.name}</span>
                      <span className="inv-sku">{item.sku}</span>
                    </div>
                    <div className="inv-item-meta">
                      <span className="inv-stock"><span className="stock-num">{item.stock}</span> left</span>
                      <span className="inv-source-badge shopify-accent">Shopify</span>
                    </div>
                  </li>
                ))}
              </ul>
              {low.length > 3 && (
                <button className="show-more-btn" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show less ▲" : `Show ${low.length - 3} more ▼`}
                </button>
              )}
            </>
          )}
        </div>

        {/* SKU Summary */}
        <div className="inventory-card summary-card">
          <div className="inv-card-header">
            <span className="inv-icon">📋</span>
            <h3 className="inv-card-title">SKU Coverage</h3>
          </div>
          <div className="sku-stats">
            <div className="sku-row">
              <span className="sku-platform shopify-accent">Shopify</span>
              <span className="sku-value">{inv?.total_skus ?? "—"} SKUs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ShopifyPage({ platforms, onSync }) {
  const shopify = platforms.shopify;
  const isDown  = shopify.status === "unavailable";
  const isStale = shopify.status === "stale";
  const data    = shopify.data;

  const revenue    = data?.revenue.amount ?? 0;
  const orders     = data?.orders ?? { total: 0, pending: 0, fulfilled: 0, cancelled: 0 };
  const units      = data?.units_sold ?? 0;
  const aov        = orders.total > 0 ? revenue / orders.total : 0;
  const convRate   = 3.4; // mock
  const recentOrders = data?.recent_orders ?? [];

  const kpis = [
    { id: "sales",      label: "Total Sales",      icon: "📈", value: isDown ? "—" : fmtCurrency(revenue), delta: "+1",    up: true  },
    { id: "orders",     label: "Orders",            icon: "🗂",  value: isDown ? "—" : orders.total.toLocaleString(),       delta: "+5.2%", up: true },
    { id: "aov",        label: "AOV",               icon: "🧾", value: isDown ? "—" : `$${aov.toFixed(2)}`,                delta: "-1.2%", up: false },
    { id: "conversion", label: "Conversion Rate",   icon: "📊", value: isDown ? "—" : `${convRate}%`,                     delta: "+0.8%", up: true  },
  ];

  return (
    <div className="ov-root">

      {/* ── Status banner (Shopify-specific) ── */}
      {isDown && (
        <div className="kpi-both-down-banner" id="shopify-down-banner">
          <span className="kpi-both-down-icon">🔴</span>
          <div>
            <div className="kpi-both-down-title">Shopify API is currently unavailable</div>
            <div className="kpi-both-down-sub">We're retrying automatically. TikTok Shop data is unaffected.</div>
          </div>
        </div>
      )}
      {isStale && (
        <div className="kpi-both-down-banner" style={{ borderColor: "var(--amber)" }} id="shopify-stale-banner">
          <span className="kpi-both-down-icon">⚠️</span>
          <div>
            <div className="kpi-both-down-title" style={{ color: "var(--amber)" }}>
              Shopify data is {shopify.staleness_minutes} min old
            </div>
            <div className="kpi-both-down-sub">Showing last known data. Live sync will resume shortly.</div>
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="kpi-row" aria-label="Shopify KPI summary">
        {kpis.map((c) => <KPICard key={c.id} {...c} />)}
      </div>

      {/* ── Order breakdown chips ── */}
      {!isDown && (
        <div style={{ display: "flex", gap: 10, margin: "4px 0 16px", flexWrap: "wrap" }}>
          <span className="sync-pill sync-pill-ok">✓ {orders.fulfilled} Fulfilled</span>
          <span className="sync-pill sync-pill-stale">⏳ {orders.pending} Pending</span>
          {orders.cancelled > 0 && (
            <span className="sync-pill sync-pill-down">✕ {orders.cancelled} Cancelled</span>
          )}
        </div>
      )}

      {/* ── Store Performance Table ── */}
      <StorePerformance platforms={platforms} shopifyOnly={true} />

      {/* ── Recent Orders (Shopify only) ── */}
      <section className="orders-section" aria-label="Shopify Recent Orders">
        <h2 className="section-title">
          <span className="section-icon">🧾</span> Recent Orders
          <span className="section-badge" style={{ background: "rgba(149,191,70,0.15)", color: "#95BF46", border: "1px solid #95BF4640" }}>
            Shopify
          </span>
        </h2>
        <div className="orders-feed">
          {isDown ? (
            <p className="orders-empty">Shopify orders unavailable — API is not responding.</p>
          ) : recentOrders.length === 0 ? (
            <p className="orders-empty">No recent Shopify orders.</p>
          ) : (
            <div className="orders-list">
              {recentOrders.map((o) => <OrderRow key={o.id} order={o} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Inventory (Shopify only) ── */}
      {!isDown && <InventorySection inv={data?.inventory} stale={isStale} />}

    </div>
  );
}
