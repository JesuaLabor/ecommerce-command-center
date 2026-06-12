import { useState } from "react";

/**
 * InventoryHealth — holds local state for "show more" toggle.
 *
 * Merges inventory data from both platforms and surfaces critical items.
 * When TikTok is unavailable, the section still renders with Shopify data.
 * A "show more" toggle controls list expansion (local UI state).
 *
 * Props:
 *   platforms {object} — full platforms object from dashboard response
 *
 * NOTE (Trade-off, Deliverable 4):
 *   We do NOT display customer lifetime value (CLV) here. CLV requires historical
 *   cohort data across multiple API calls, which adds latency and architectural
 *   complexity disproportionate to its daily operational value. Inventory health
 *   is more immediately actionable for a merchant's day-to-day decisions.
 */
export default function InventoryHealth({ platforms }) {
  const [showAll, setShowAll] = useState(false);

  const shopifyInv = platforms.shopify.data?.inventory;
  const tiktokOk = platforms.tiktok.status !== "unavailable";
  const tiktokInv = tiktokOk ? platforms.tiktok.data?.inventory : null;

  const allLowStock = [
    ...(shopifyInv?.low_stock ?? []).map((i) => ({ ...i, source: "Shopify" })),
    ...(tiktokInv?.low_stock ?? []).map((i) => ({ ...i, source: "TikTok" })),
  ];
  const allOutOfStock = [
    ...(shopifyInv?.out_of_stock ?? []).map((i) => ({ ...i, source: "Shopify" })),
    ...(tiktokInv?.out_of_stock ?? []).map((i) => ({ ...i, source: "TikTok" })),
  ];

  const displayedLow = showAll ? allLowStock : allLowStock.slice(0, 3);

  return (
    <section className="inventory-section" aria-label="Inventory Health">
      <h2 className="section-title">
        <span className="section-icon">🗃️</span> Inventory Health
        {!tiktokOk && (
          <span className="section-badge badge-stale">Shopify only</span>
        )}
      </h2>

      <div className="inventory-grid">
        {/* Out of Stock Alert */}
        <div className="inventory-card alert-card">
          <div className="inv-card-header">
            <span className="inv-icon alert-icon">🚨</span>
            <h3 className="inv-card-title">Out of Stock</h3>
            <span className="inv-count alert-count">{allOutOfStock.length}</span>
          </div>
          {allOutOfStock.length === 0 ? (
            <p className="inv-empty">All items in stock ✓</p>
          ) : (
            <ul className="inv-list">
              {allOutOfStock.map((item) => (
                <li key={`${item.source}-${item.sku}`} className="inv-item inv-item-danger">
                  <span className="inv-name">{item.name}</span>
                  <span className="inv-sku">{item.sku}</span>
                  <span className={`inv-source-badge ${item.source === "Shopify" ? "shopify-accent" : "tiktok-accent"}`}>
                    {item.source}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock Warning */}
        <div className="inventory-card warn-card">
          <div className="inv-card-header">
            <span className="inv-icon warn-icon">⚠️</span>
            <h3 className="inv-card-title">Low Stock</h3>
            <span className="inv-count warn-count">{allLowStock.length}</span>
          </div>
          {allLowStock.length === 0 ? (
            <p className="inv-empty">No low stock items ✓</p>
          ) : (
            <>
              <ul className="inv-list">
                {displayedLow.map((item) => (
                  <li key={`${item.source}-${item.sku}`} className="inv-item inv-item-warn">
                    <div className="inv-item-main">
                      <span className="inv-name">{item.name}</span>
                      <span className="inv-sku">{item.sku}</span>
                    </div>
                    <div className="inv-item-meta">
                      <span className="inv-stock">
                        <span className="stock-num">{item.stock}</span> left
                      </span>
                      <span className={`inv-source-badge ${item.source === "Shopify" ? "shopify-accent" : "tiktok-accent"}`}>
                        {item.source}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {allLowStock.length > 3 && (
                <button className="show-more-btn" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show less ▲" : `Show ${allLowStock.length - 3} more ▼`}
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
              <span className="sku-value">{shopifyInv?.total_skus ?? "—"} SKUs</span>
            </div>
            <div className="sku-row">
              <span className={`sku-platform ${tiktokOk ? "tiktok-accent" : "text-muted"}`}>TikTok</span>
              <span className="sku-value">
                {tiktokOk ? `${tiktokInv?.total_skus ?? "—"} SKUs` : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
