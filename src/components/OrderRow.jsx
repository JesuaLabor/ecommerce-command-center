/**
 * OrderRow — Reusable component representing a single order row.
 * Eliminates duplication across ShopifyPage and TikTokPage.
 *
 * Props:
 *   order {object} - Order data from API
 *   platformType {"shopify" | "tiktok"} - Determines color theme
 */
export default function OrderRow({ order, platformType }) {
  const statusMap = {
    fulfilled: { label: "Fulfilled", className: "status-fulfilled" },
    pending:   { label: "Pending",   className: "status-pending"   },
    cancelled: { label: "Cancelled", className: "status-cancelled" },
  };

  const { label, className } = statusMap[order.status] ?? {
    label: order.status,
    className: "status-default",
  };

  const dotClass = platformType === "shopify" ? "dot-shopify" : "dot-tiktok";
  const elementId = `${platformType}-order-${order.id}`;

  return (
    <div className="order-item" id={elementId}>
      <div className="order-left">
        <span className={`order-source-dot ${dotClass}`} />
        {/* Product thumbnail */}
        {order.item_image && (
          <div className="order-product-thumb">
            <span>{order.item_image}</span>
          </div>
        )}
        <div className="order-info">
          <span className="order-id">{order.id}</span>
          {order.item_name && (
            <span className="order-item-name">
              {order.item_name}
              {order.items > 1 ? ` +${order.items - 1}` : ""}
            </span>
          )}
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
