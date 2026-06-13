/**
 * RecentOrders — purely presentational, no local state.
 *
 * Merges recent order feeds from both platforms into a unified timeline.
 * When TikTok is unavailable, a placeholder card is shown — the section is
 * never hidden, as partially complete information is better than a blank panel.
 *
 * Props:
 *   platforms {object} — full platforms object from dashboard response
 */
export default function RecentOrders({ platforms }) {
  const shopifyOrders = (platforms.shopify.data?.recent_orders ?? []).map((o) => ({
    ...o,
    source: "Shopify",
  }));

  const tiktokOk = platforms.tiktok.status !== "unavailable";
  const tiktokOrders = tiktokOk
    ? (platforms.tiktok.data?.recent_orders ?? []).map((o) => ({ ...o, source: "TikTok" }))
    : [];

  const allOrders = [...shopifyOrders, ...tiktokOrders].sort((a, b) =>
    b.time.localeCompare(a.time)
  );

  function statusBadge(status) {
    const map = {
      fulfilled: { label: "Fulfilled", className: "status-fulfilled" },
      pending: { label: "Pending", className: "status-pending" },
      cancelled: { label: "Cancelled", className: "status-cancelled" },
    };
    return map[status] ?? { label: status, className: "status-default" };
  }

  return (
    <section className="orders-section" aria-label="Recent Orders">
      <h2 className="section-title">
        <span className="section-icon">🧾</span> Recent Orders
        {!tiktokOk && (
          <span className="section-badge badge-stale">Shopify only</span>
        )}
      </h2>

      <div className="orders-feed">
        {allOrders.length === 0 ? (
          <p className="orders-empty">No recent orders to display.</p>
        ) : (
          <div className="orders-list">
              {allOrders.map((order) => {
              const { label, className } = statusBadge(order.status);
              return (
                <div key={`${order.source}-${order.id}`} className="order-item">
                  <div className="order-left">
                    <span className={`order-source-dot ${order.source === "Shopify" ? "dot-shopify" : "dot-tiktok"}`} />
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
            })}
          </div>
        )}

        {/* TikTok unavailable placeholder row */}
        {!tiktokOk && (
          <div className="orders-unavailable-notice">
            <span className="unavailable-icon">🔴</span>
            <span>TikTok Shop orders are temporarily unavailable. Shopify orders are shown above.</span>
          </div>
        )}
      </div>
    </section>
  );
}
