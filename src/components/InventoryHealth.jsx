import { useState, useMemo } from "react";

/**
 * InventoryHealth — redesigned full-page Inventory dashboard.
 *
 * Design decisions (Senior UI/UX):
 * - Summary KPI strip at top for instant status scan
 * - Visual stock health bar showing healthy / low / out ratio
 * - Platform filter tabs (All / Shopify / TikTok)
 * - Search filter on product name or SKU
 * - Unified product table with inline stock level bar
 * - Critical items pinned to top regardless of filter
 * - Graceful degraded states when a platform is unavailable
 *
 * Props: platforms {object}
 */

// ─── Icons ───────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconBox = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
    <polygon points="21 17.08 21 6.92 12 12 12 22.08 21 17.08" />
    <polygon points="12 12 3 6.92 12 1.84 21 6.92 12 12" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
    <line x1="12" y1="12" x2="20.15" y2="7.39" />
    <line x1="3.85" y1="7.39" x2="12" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── Stock level helpers ──────────────────────────────────────────
function stockStatus(stock, threshold) {
  if (stock === 0) return "out";
  if (threshold && stock <= threshold) return "low";
  return "healthy";
}

function StockBar({ stock, threshold, max = 50 }) {
  const pct = Math.min(100, Math.round((stock / Math.max(max, 1)) * 100));
  const status = stockStatus(stock, threshold);
  const color = status === "out" ? "var(--red)" : status === "low" ? "var(--amber)" : "var(--green)";
  return (
    <div className="inv-stock-bar-wrap">
      <div className="inv-stock-bar-track">
        <div className="inv-stock-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="inv-stock-bar-label" style={{ color }}>{stock}</span>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatPill({ icon, label, value, variant }) {
  return (
    <div className={`inv-stat-pill inv-stat-${variant}`}>
      <span className="inv-stat-icon">{icon}</span>
      <div className="inv-stat-body">
        <span className="inv-stat-value">{value}</span>
        <span className="inv-stat-label">{label}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function InventoryHealth({ platforms }) {
  const [filter, setFilter]   = useState("all");   // "all" | "shopify" | "tiktok"
  const [search, setSearch]   = useState("");
  const [sort, setSort]       = useState("status"); // "status" | "name" | "stock"
  const [showAll, setShowAll] = useState(false);

  const shopifyOk  = platforms.shopify.status !== "unavailable";
  const tiktokOk   = platforms.tiktok.status  !== "unavailable";
  const shopifyInv = shopifyOk ? platforms.shopify.data?.inventory : null;
  const tiktokInv  = tiktokOk  ? platforms.tiktok.data?.inventory  : null;

  // ── Build unified product list ──────────────────────────────────
  const allProducts = useMemo(() => {
    const shopifyProducts = [
      ...(shopifyInv?.out_of_stock ?? []).map(i => ({ ...i, source: "Shopify", stock: 0,        status: "out"     })),
      ...(shopifyInv?.low_stock    ?? []).map(i => ({ ...i, source: "Shopify", stock: i.stock,  status: "low"     })),
    ];
    const tiktokProducts = [
      ...(tiktokInv?.out_of_stock  ?? []).map(i => ({ ...i, source: "TikTok",  stock: 0,        status: "out"     })),
      ...(tiktokInv?.low_stock     ?? []).map(i => ({ ...i, source: "TikTok",  stock: i.stock,  status: "low"     })),
    ];
    // Estimate healthy items from total_skus minus critical
    const shopifyHealthy = Math.max(0, (shopifyInv?.total_skus ?? 0) - shopifyProducts.length);
    const tiktokHealthy  = Math.max(0, (tiktokInv?.total_skus  ?? 0) - tiktokProducts.length);
    return { shopifyProducts, tiktokProducts, shopifyHealthy, tiktokHealthy };
  }, [shopifyInv, tiktokInv]);

  const { shopifyProducts, tiktokProducts, shopifyHealthy, tiktokHealthy } = allProducts;

  const criticalItems = [
    ...(filter !== "tiktok" ? shopifyProducts : []),
    ...(filter !== "shopify" ? tiktokProducts : []),
  ];

  // ── Filter + search + sort ───────────────────────────────────────
  const displayed = useMemo(() => {
    let items = criticalItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));
    }
    if (sort === "name")   items = [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    if (sort === "stock")  items = [...items].sort((a, b) => a.stock - b.stock);
    if (sort === "status") items = [...items].sort((a, b) => (a.status === "out" ? 0 : 1) - (b.status === "out" ? 0 : 1));
    return items;
  }, [criticalItems, search, sort]);

  const visibleItems   = showAll ? displayed : displayed.slice(0, 8);
  const totalSKUs      = (shopifyInv?.total_skus ?? 0) + (tiktokInv?.total_skus ?? 0);
  const outCount       = criticalItems.filter(i => i.status === "out").length;
  const lowCount       = criticalItems.filter(i => i.status === "low").length;
  const healthyCount   = shopifyHealthy + tiktokHealthy;
  const healthyPct     = totalSKUs > 0 ? Math.round((healthyCount / totalSKUs) * 100) : 0;

  return (
    <section className="invp-root" aria-label="Inventory Management">

      {/* ── Platform unavailability notice ── */}
      {(!shopifyOk || !tiktokOk) && (
        <div className="invp-platform-notice">
          {!shopifyOk && <span className="sync-pill sync-pill-down">🔴 Shopify inventory unavailable</span>}
          {!tiktokOk  && <span className="sync-pill sync-pill-down">🔴 TikTok inventory unavailable</span>}
        </div>
      )}

      {/* ── 1. KPI Summary Strip ── */}
      <div className="invp-kpi-strip">
        <StatPill icon={<IconBox />}   label="Total SKUs"    value={totalSKUs}     variant="neutral" />
        <StatPill icon={<IconCheck />} label="In Stock"      value={healthyCount}  variant="ok"      />
        <StatPill icon={<IconAlert />} label="Low Stock"     value={lowCount}      variant="warn"    />
        <StatPill icon={<IconAlert />} label="Out of Stock"  value={outCount}      variant="danger"  />
        <StatPill icon={<IconBox />}   label="Shopify SKUs"  value={shopifyInv?.total_skus ?? "—"} variant="shopify" />
        <StatPill icon={<IconBox />}   label="TikTok SKUs"   value={tiktokInv?.total_skus  ?? "—"} variant="tiktok"  />
      </div>

      {/* ── 2. Stock Health Bar ── */}
      <div className="invp-health-bar-card">
        <div className="invp-health-bar-header">
          <span className="invp-health-bar-title">Overall Stock Health</span>
          <span className="invp-health-pct" style={{ color: healthyPct > 80 ? "var(--green)" : healthyPct > 50 ? "var(--amber)" : "var(--red)" }}>
            {healthyPct}% healthy
          </span>
        </div>
        <div className="invp-health-track">
          <div className="invp-health-seg invp-health-ok"    style={{ flex: healthyCount }} title={`${healthyCount} healthy`} />
          <div className="invp-health-seg invp-health-low"   style={{ flex: lowCount  || 0.001 }} title={`${lowCount} low`} />
          <div className="invp-health-seg invp-health-out"   style={{ flex: outCount  || 0.001 }} title={`${outCount} out`} />
        </div>
        <div className="invp-health-legend">
          <span><span className="invp-legend-dot invp-legend-ok"  />In Stock ({healthyCount})</span>
          <span><span className="invp-legend-dot invp-legend-low" />Low Stock ({lowCount})</span>
          <span><span className="invp-legend-dot invp-legend-out" />Out of Stock ({outCount})</span>
        </div>
      </div>

      {/* ── 3. Table Header: tabs + search + sort ── */}
      <div className="invp-table-toolbar">
        <div className="invp-tabs">
          {["all", "shopify", "tiktok"].map(t => (
            <button
              key={t}
              className={`invp-tab ${filter === t ? "invp-tab-active" : ""}`}
              onClick={() => setFilter(t)}
              id={`inv-tab-${t}`}
            >
              {t === "all" ? "All Platforms" : t === "shopify" ? "Shopify" : "TikTok Shop"}
              <span className="invp-tab-count">
                {t === "all" ? criticalItems.length
                  : t === "shopify" ? shopifyProducts.length
                  : tiktokProducts.length}
              </span>
            </button>
          ))}
        </div>

        <div className="invp-toolbar-right">
          {/* Search */}
          <div className="invp-search">
            <IconSearch />
            <input
              className="invp-search-input"
              placeholder="Search product or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="inv-search"
            />
          </div>

          {/* Sort */}
          <div className="invp-sort">
            <IconFilter />
            <select
              className="invp-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              id="inv-sort"
            >
              <option value="status">Sort: Urgency</option>
              <option value="stock">Sort: Stock ↑</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. Product Table ── */}
      <div className="invp-table-card">
        {displayed.length === 0 ? (
          <div className="invp-empty">
            <span className="invp-empty-icon">✓</span>
            <p className="invp-empty-title">No critical inventory items</p>
            <p className="invp-empty-sub">All products are well stocked across selected platforms.</p>
          </div>
        ) : (
          <>
            <table className="invp-table" aria-label="Critical inventory items">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Stock Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map(item => {
                  const isOut = item.status === "out";
                  return (
                    <tr key={`${item.source}-${item.sku}`} className={`invp-row ${isOut ? "invp-row-out" : "invp-row-low"}`}>
                      {/* Product name */}
                      <td>
                        <div className="invp-product-cell">
                          <div className="invp-product-icon" style={{ background: isOut ? "var(--red-bg)" : "var(--amber-bg)" }}>
                            {isOut ? "🚫" : "⚠️"}
                          </div>
                          <span className="invp-product-name">{item.name ?? "—"}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td><span className="invp-sku-cell">{item.sku}</span></td>

                      {/* Platform */}
                      <td>
                        <span className={`inv-source-badge ${item.source === "Shopify" ? "shopify-accent" : "tiktok-accent"}`}>
                          {item.source}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td>
                        <span className={`invp-status-badge ${isOut ? "invp-badge-out" : "invp-badge-low"}`}>
                          {isOut ? "Out of Stock" : "Low Stock"}
                        </span>
                      </td>

                      {/* Stock bar */}
                      <td>
                        <StockBar stock={item.stock} threshold={item.threshold} />
                      </td>

                      {/* Action */}
                      <td>
                        <button className="invp-action-btn" id={`inv-restock-${item.sku}`}>
                          Restock →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Show more / less */}
            {displayed.length > 8 && (
              <div className="invp-show-more-wrap">
                <button className="show-more-btn" onClick={() => setShowAll(v => !v)} id="inv-show-more">
                  {showAll ? "Show less ▲" : `Show ${displayed.length - 8} more items ▼`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </section>
  );
}
