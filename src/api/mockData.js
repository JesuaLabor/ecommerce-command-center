/**
 * Mock API data simulating the unified /api/v1/dashboard endpoint.
 * In production, this would be replaced with real fetch() calls.
 *
 * ASSUMPTION: TikTok data staleness threshold = 15 minutes.
 * ASSUMPTION: "unavailable" means API timed out or returned 5xx.
 * ASSUMPTION: Merchants are non-technical; messaging must be calm and actionable.
 */

// --- Healthy response (both platforms OK) ---
export const MOCK_DASHBOARD_HEALTHY = {
  request_id: "req_abc123",
  generated_at: new Date().toISOString(),
  merchant_id: "merchant_9021",
  date: new Date().toISOString().split("T")[0],
  platforms: {
    shopify: {
      status: "ok",
      last_synced: new Date(Date.now() - 60_000).toISOString(), // 1 min ago
      data: {
        revenue: { amount: 12480.5, currency: "USD" },
        orders: { total: 214, pending: 18, fulfilled: 182, cancelled: 14 },
        units_sold: 387,
        inventory: {
          total_skus: 52,
          low_stock: [
            { sku: "SHIRT-BLK-M", name: "Classic Black Tee (M)", stock: 3, threshold: 5 },
            { sku: "HAT-WHT-OS", name: "White Snapback", stock: 2, threshold: 5 },
          ],
          out_of_stock: [{ sku: "SOCK-GRY-L", name: "Grey Crew Socks (L)", stock: 0 }],
        },
        recent_orders: [
          { id: "SH-10091", customer: "Maria Santos", items: 2, total: 58.99, status: "fulfilled", time: "09:14 AM" },
          { id: "SH-10090", customer: "James Reyes", items: 1, total: 24.5, status: "pending", time: "08:52 AM" },
          { id: "SH-10089", customer: "Ana Lim", items: 3, total: 105.0, status: "fulfilled", time: "08:31 AM" },
        ],
      },
    },
    tiktok: {
      status: "ok",
      last_synced: new Date(Date.now() - 8 * 60_000).toISOString(), // 8 min ago
      data: {
        revenue: { amount: 4320.0, currency: "USD" },
        orders: { total: 89, pending: 11, fulfilled: 74, cancelled: 4 },
        units_sold: 143,
        inventory: {
          total_skus: 18,
          low_stock: [{ sku: "TTSHIRT-RED-S", name: "Viral Red Tee (S)", stock: 4, threshold: 5 }],
          out_of_stock: [],
        },
        recent_orders: [
          { id: "TT-5521", customer: "Kyla Tan", items: 1, total: 39.99, status: "pending", time: "09:05 AM" },
          { id: "TT-5520", customer: "Bea Cruz", items: 2, total: 79.98, status: "fulfilled", time: "08:44 AM" },
        ],
      },
    },
  },
};

// --- Degraded response (TikTok stale/unavailable, Shopify ok) ---
export const MOCK_DASHBOARD_TIKTOK_STALE = {
  request_id: "req_xyz789",
  generated_at: new Date().toISOString(),
  merchant_id: "merchant_9021",
  date: new Date().toISOString().split("T")[0],
  platforms: {
    shopify: {
      status: "ok",
      last_synced: new Date(Date.now() - 90_000).toISOString(), // 1.5 min ago
      data: {
        revenue: { amount: 12480.5, currency: "USD" },
        orders: { total: 214, pending: 18, fulfilled: 182, cancelled: 14 },
        units_sold: 387,
        inventory: {
          total_skus: 52,
          low_stock: [
            { sku: "SHIRT-BLK-M", name: "Classic Black Tee (M)", stock: 3, threshold: 5 },
          ],
          out_of_stock: [{ sku: "SOCK-GRY-L", name: "Grey Crew Socks (L)", stock: 0 }],
        },
        recent_orders: [
          { id: "SH-10091", customer: "Maria Santos", items: 2, total: 58.99, status: "fulfilled", time: "09:14 AM" },
          { id: "SH-10090", customer: "James Reyes", items: 1, total: 24.5, status: "pending", time: "08:52 AM" },
        ],
      },
    },
    tiktok: {
      // "stale" = data returned but exceeds the 15-minute freshness threshold
      status: "stale",
      last_synced: new Date(Date.now() - 18 * 60_000).toISOString(), // 18 min ago
      staleness_minutes: 18,
      data: {
        // Last-known data is still surfaced — never blank the section entirely
        revenue: { amount: 4320.0, currency: "USD" },
        orders: { total: 89, pending: 11, fulfilled: 74, cancelled: 4 },
        units_sold: 143,
        inventory: {
          total_skus: 18,
          low_stock: [{ sku: "TTSHIRT-RED-S", name: "Viral Red Tee (S)", stock: 4, threshold: 5 }],
          out_of_stock: [],
        },
        recent_orders: [
          { id: "TT-5521", customer: "Kyla Tan", items: 1, total: 39.99, status: "pending", time: "09:05 AM" },
        ],
      },
    },
  },
};

// --- Degraded response (Shopify stale, TikTok ok) ---
export const MOCK_DASHBOARD_SHOPIFY_STALE = {
  request_id: "req_shop_stale",
  generated_at: new Date().toISOString(),
  merchant_id: "merchant_9021",
  date: new Date().toISOString().split("T")[0],
  platforms: {
    shopify: {
      status: "stale",
      last_synced: new Date(Date.now() - 20 * 60_000).toISOString(), // 20 min ago
      staleness_minutes: 20,
      data: {
        revenue: { amount: 12480.5, currency: "USD" },
        orders: { total: 214, pending: 18, fulfilled: 182, cancelled: 14 },
        units_sold: 387,
        inventory: {
          total_skus: 52,
          low_stock: [
            { sku: "SHIRT-BLK-M", name: "Classic Black Tee (M)", stock: 3, threshold: 5 },
            { sku: "HAT-WHT-OS", name: "White Snapback", stock: 2, threshold: 5 },
          ],
          out_of_stock: [{ sku: "SOCK-GRY-L", name: "Grey Crew Socks (L)", stock: 0 }],
        },
        recent_orders: [
          { id: "SH-10091", customer: "Maria Santos", items: 2, total: 58.99, status: "fulfilled", time: "09:14 AM" },
          { id: "SH-10090", customer: "James Reyes", items: 1, total: 24.5, status: "pending", time: "08:52 AM" },
          { id: "SH-10089", customer: "Ana Lim", items: 3, total: 105.0, status: "fulfilled", time: "08:31 AM" },
        ],
      },
    },
    tiktok: {
      status: "ok",
      last_synced: new Date(Date.now() - 60_000).toISOString(), // 1 min ago
      data: {
        revenue: { amount: 4320.0, currency: "USD" },
        orders: { total: 89, pending: 11, fulfilled: 74, cancelled: 4 },
        units_sold: 143,
        inventory: {
          total_skus: 18,
          low_stock: [{ sku: "TTSHIRT-RED-S", name: "Viral Red Tee (S)", stock: 4, threshold: 5 }],
          out_of_stock: [],
        },
        recent_orders: [
          { id: "TT-5521", customer: "Kyla Tan", items: 1, total: 39.99, status: "pending", time: "09:05 AM" },
          { id: "TT-5520", customer: "Bea Cruz", items: 2, total: 79.98, status: "fulfilled", time: "08:44 AM" },
        ],
      },
    },
  },
};

export const MOCK_DASHBOARD_TIKTOK_UNAVAILABLE = {
  request_id: "req_err001",
  generated_at: new Date().toISOString(),
  merchant_id: "merchant_9021",
  date: new Date().toISOString().split("T")[0],
  platforms: {
    shopify: {
      status: "ok",
      last_synced: new Date(Date.now() - 60_000).toISOString(),
      data: {
        revenue: { amount: 12480.5, currency: "USD" },
        orders: { total: 214, pending: 18, fulfilled: 182, cancelled: 14 },
        units_sold: 387,
        inventory: {
          total_skus: 52,
          low_stock: [{ sku: "SHIRT-BLK-M", name: "Classic Black Tee (M)", stock: 3, threshold: 5 }],
          out_of_stock: [{ sku: "SOCK-GRY-L", name: "Grey Crew Socks (L)", stock: 0 }],
        },
        recent_orders: [
          { id: "SH-10091", customer: "Maria Santos", items: 2, total: 58.99, status: "fulfilled", time: "09:14 AM" },
          { id: "SH-10090", customer: "James Reyes", items: 1, total: 24.5, status: "pending", time: "08:52 AM" },
        ],
      },
    },
    tiktok: {
      // "unavailable" = API timed out or returned 5xx — no data surfaced
      status: "unavailable",
      last_synced: null,
      error: {
        code: "UPSTREAM_TIMEOUT",
        message: "TikTok Shop API did not respond within the 10s timeout. Retrying automatically.",
        http_status: 504,
      },
      data: null,
    },
  },
};

// --- Shopify Down, TikTok OK ---
export const MOCK_DASHBOARD_SHOPIFY_UNAVAILABLE = {
  request_id: "req_shop_err",
  generated_at: new Date().toISOString(),
  merchant_id: "merchant_9021",
  date: new Date().toISOString().split("T")[0],
  platforms: {
    shopify: {
      status: "unavailable",
      last_synced: null,
      error: {
        code: "UPSTREAM_TIMEOUT",
        message: "Shopify API did not respond within the 10s timeout. Retrying automatically.",
        http_status: 504,
      },
      data: null,
    },
    tiktok: {
      status: "ok",
      last_synced: new Date(Date.now() - 5 * 60_000).toISOString(),
      data: {
        revenue: { amount: 4320.0, currency: "USD" },
        orders: { total: 89, pending: 11, fulfilled: 74, cancelled: 4 },
        units_sold: 143,
        inventory: {
          total_skus: 18,
          low_stock: [{ sku: "TTSHIRT-RED-S", name: "Viral Red Tee (S)", stock: 4, threshold: 5 }],
          out_of_stock: [],
        },
        recent_orders: [
          { id: "TT-5521", customer: "Kyla Tan", items: 1, total: 39.99, status: "pending", time: "09:05 AM" },
          { id: "TT-5520", customer: "Bea Cruz", items: 2, total: 79.98, status: "fulfilled", time: "08:44 AM" },
        ],
      },
    },
  },
};

// --- Both Platforms Down ---
export const MOCK_DASHBOARD_BOTH_UNAVAILABLE = {
  request_id: "req_both_err",
  generated_at: new Date().toISOString(),
  merchant_id: "merchant_9021",
  date: new Date().toISOString().split("T")[0],
  platforms: {
    shopify: {
      status: "unavailable",
      last_synced: null,
      error: {
        code: "UPSTREAM_TIMEOUT",
        message: "Shopify API did not respond within the 10s timeout. Retrying automatically.",
        http_status: 504,
      },
      data: null,
    },
    tiktok: {
      status: "unavailable",
      last_synced: null,
      error: {
        code: "UPSTREAM_TIMEOUT",
        message: "TikTok Shop API did not respond within the 10s timeout. Retrying automatically.",
        http_status: 504,
      },
      data: null,
    },
  },
};

/**
 * Simulates a fetch to GET /api/v1/dashboard
 * @param {string} scenario - "healthy" | "stale" | "shopify_stale" | "unavailable" | "shopify_down" | "both_down"
 */
export async function fetchDashboard(scenario = "stale") {
  await new Promise((res) => setTimeout(res, 800)); // simulate network latency
  switch (scenario) {
    case "healthy":       return MOCK_DASHBOARD_HEALTHY;
    case "shopify_stale": return MOCK_DASHBOARD_SHOPIFY_STALE;
    case "unavailable":   return MOCK_DASHBOARD_TIKTOK_UNAVAILABLE;
    case "shopify_down":  return MOCK_DASHBOARD_SHOPIFY_UNAVAILABLE;
    case "both_down":     return MOCK_DASHBOARD_BOTH_UNAVAILABLE;
    case "stale":
    default:              return MOCK_DASHBOARD_TIKTOK_STALE;
  }
}
