import { useState, useMemo } from "react";

/**
 * RecentOrders — Redesigned full-page Orders Dashboard.
 *
 * Senior UI/UX Design Decisions:
 * - KPI Summary Cards for immediate order-status distribution metrics.
 * - Platform & Status filtering tabs/controls for efficient operations.
 * - Live search matching ID, customer name, or item name.
 * - Sortable columns (Time vs Order Value).
 * - Rich table layout featuring product thumbnails, clear platform markers, status badges, and action buttons.
 * - Upstream sync warnings when APIs are stale/down.
 */

// ─── SVG Icons ──────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ─── Stat Card Component ─────────────────────────────────────────
function OrderStatCard({ label, value, subtext, icon, color }) {
  return (
    <div className="orders-stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="orders-stat-header">
        <span className="orders-stat-label">{label}</span>
        <span className="orders-stat-icon" style={{ color }}>{icon}</span>
      </div>
      <div className="orders-stat-value">{value}</div>
      <div className="orders-stat-sub">{subtext}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function RecentOrders({ platforms }) {
  const [activePlatform, setActivePlatform] = useState("all"); // "all" | "shopify" | "tiktok"
  const [statusFilter, setStatusFilter] = useState("all");     // "all" | "pending" | "fulfilled" | "cancelled"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("time-desc");           // "time-desc" | "time-asc" | "total-desc" | "total-asc"

  const shopifyOk = platforms.shopify.status !== "unavailable";
  const tiktokOk = platforms.tiktok.status !== "unavailable";

  // ─── Merge & Parse Data ───
  const allOrders = useMemo(() => {
    const shopifyOrders = shopifyOk
      ? (platforms.shopify.data?.recent_orders ?? []).map((o) => ({ ...o, source: "Shopify" }))
      : [];
    const tiktokOrders = tiktokOk
      ? (platforms.tiktok.data?.recent_orders ?? []).map((o) => ({ ...o, source: "TikTok" }))
      : [];

    return [...shopifyOrders, ...tiktokOrders];
  }, [platforms, shopifyOk, tiktokOk]);

  // ─── Filter & Process Data ───
  const processedOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Platform filter
    if (activePlatform === "shopify") {
      filtered = filtered.filter((o) => o.source === "Shopify");
    } else if (activePlatform === "tiktok") {
      filtered = filtered.filter((o) => o.source === "TikTok");
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Search query (matches order ID, customer, or item name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          (o.item_name && o.item_name.toLowerCase().includes(q))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "time-desc") return b.time.localeCompare(a.time);
      if (sortBy === "time-asc") return a.time.localeCompare(b.time);
      if (sortBy === "total-desc") return b.total - a.total;
      if (sortBy === "total-asc") return a.total - b.total;
      return 0;
    });

    return filtered;
  }, [allOrders, activePlatform, statusFilter, searchQuery, sortBy]);

  // ─── Calculate Stats ───
  const stats = useMemo(() => {
    const total = processedOrders.length;
    const value = processedOrders.reduce((sum, o) => sum + o.total, 0);
    const pending = processedOrders.filter((o) => o.status === "pending").length;
    const fulfilled = processedOrders.filter((o) => o.status === "fulfilled").length;
    const cancelled = processedOrders.filter((o) => o.status === "cancelled").length;

    return { total, value, pending, fulfilled, cancelled };
  }, [processedOrders]);

  function statusBadge(status) {
    const map = {
      fulfilled: { label: "Fulfilled", className: "status-fulfilled" },
      pending: { label: "Pending", className: "status-pending" },
      cancelled: { label: "Cancelled", className: "status-cancelled" },
    };
    return map[status] ?? { label: status, className: "status-default" };
  }

  return (
    <div className="orders-page-root">
      
      {/* ── Platform Warnings ── */}
      {(!shopifyOk || !tiktokOk) && (
        <div className="orders-page-warnings">
          {!shopifyOk && (
            <div className="orders-warning-banner banner-shopify">
              <span className="warning-banner-icon">🔴</span>
              <div>
                <strong className="warning-banner-title">Shopify Sync Offline</strong>
                <p className="warning-banner-desc">We cannot fetch live orders from Shopify. Displaying cached data.</p>
              </div>
            </div>
          )}
          {!tiktokOk && (
            <div className="orders-warning-banner banner-tiktok">
              <span className="warning-banner-icon">🔴</span>
              <div>
                <strong className="warning-banner-title">TikTok Shop Sync Offline</strong>
                <p className="warning-banner-desc">TikTok API is not responding. Recent TikTok orders cannot be shown.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 1. KPI Stats Grid ── */}
      <div className="orders-stats-grid">
        <OrderStatCard
          label="Total Orders"
          value={stats.total}
          subtext="Filtered orders count"
          icon="📦"
          color="var(--accent-blue)"
        />
        <OrderStatCard
          label="Total Value"
          value={`$${stats.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Revenue generated"
          icon="💰"
          color="var(--green)"
        />
        <OrderStatCard
          label="Awaiting Fulfillment"
          value={stats.pending}
          subtext="Action required"
          icon="⏳"
          color="var(--amber)"
        />
        <OrderStatCard
          label="Fulfilled"
          value={stats.fulfilled}
          subtext="Completed deliveries"
          icon="✓"
          color="var(--green)"
        />
      </div>

      {/* ── 2. Toolbar & Controls ── */}
      <div className="orders-toolbar">
        {/* Platform tabs */}
        <div className="orders-platform-tabs">
          <button
            className={`orders-tab ${activePlatform === "all" ? "active" : ""}`}
            onClick={() => setActivePlatform("all")}
            id="orders-tab-all"
          >
            All Channels
          </button>
          <button
            className={`orders-tab ${activePlatform === "shopify" ? "active" : ""}`}
            onClick={() => setActivePlatform("shopify")}
            id="orders-tab-shopify"
          >
            <span className="source-indicator dot-shopify" /> Shopify
          </button>
          <button
            className={`orders-tab ${activePlatform === "tiktok" ? "active" : ""}`}
            onClick={() => setActivePlatform("tiktok")}
            id="orders-tab-tiktok"
          >
            <span className="source-indicator dot-tiktok" /> TikTok Shop
          </button>
        </div>

        {/* Filter / Sort Actions */}
        <div className="orders-actions">
          {/* Search bar */}
          <div className="orders-search-wrapper">
            <IconSearch />
            <input
              type="text"
              placeholder="Search by ID, customer or item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="orders-search-input"
              id="orders-search"
            />
          </div>

          {/* Status selector */}
          <div className="orders-dropdown-wrapper">
            <IconFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="orders-select"
              id="orders-filter-status"
            >
              <option value="all">All Statuses</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="orders-dropdown-wrapper">
            <IconCalendar />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="orders-select"
              id="orders-sort"
            >
              <option value="time-desc">Newest First</option>
              <option value="time-asc">Oldest First</option>
              <option value="total-desc">Value: High to Low</option>
              <option value="total-asc">Value: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Orders List Table ── */}
      <div className="orders-table-container">
        {processedOrders.length === 0 ? (
          <div className="orders-empty-state">
            <span className="empty-state-emoji">🔍</span>
            <h3>No Orders Found</h3>
            <p>We couldn't find any orders matching your selected filters or search terms.</p>
          </div>
        ) : (
          <table className="orders-dashboard-table" aria-label="Customer Orders">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product Details</th>
                <th>Customer</th>
                <th>Value</th>
                <th>Fulfillment</th>
                <th>Order Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedOrders.map((order) => {
                const { label, className } = statusBadge(order.status);
                const isShopify = order.source === "Shopify";

                return (
                  <tr key={`${order.source}-${order.id}`} className="orders-table-row">
                    {/* Order ID & Source */}
                    <td>
                      <div className="orders-id-cell">
                        <span className={`orders-platform-tag ${isShopify ? "tag-shopify" : "tag-tiktok"}`}>
                          {order.source}
                        </span>
                        <span className="orders-id-num">{order.id}</span>
                      </div>
                    </td>

                    {/* Product Details */}
                    <td>
                      <div className="orders-product-cell">
                        {order.item_image && (
                          <div className="orders-product-thumb">
                            <span>{order.item_image}</span>
                          </div>
                        )}
                        <div className="orders-product-info">
                          <span className="orders-product-name">{order.item_name ?? "Unknown Item"}</span>
                          <span className="orders-qty-badge">
                            {order.items} {order.items === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="orders-customer-cell">
                        <span className="orders-cust-name">{order.customer}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td>
                      <span className="orders-value-cell">${order.total.toFixed(2)}</span>
                    </td>

                    {/* Status badge */}
                    <td>
                      <span className={`order-status ${className}`}>{label}</span>
                    </td>

                    {/* Timing */}
                    <td>
                      <span className="orders-time-cell">{order.time}</span>
                    </td>

                    {/* Action */}
                    <td>
                      <button className="orders-action-btn" id={`btn-order-action-${order.id}`}>
                        <span>Details</span>
                        <IconExternalLink />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
