/**
 * ActiveIntelligence — right panel live activity feed.
 * Shows real-time events: inventory mismatches, sync events, webhook receipts, anomalies.
 * Props: platforms {object}
 */

function timeAgo(mins) {
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function ActiveIntelligence({ platforms }) {
  const tiktokOk    = platforms.tiktok.status  !== "unavailable";
  const tiktokStale  = platforms.tiktok.status  === "stale";
  const shopifyOk    = platforms.shopify.status !== "unavailable";
  const bothDown     = !shopifyOk && !tiktokOk;

  const events = [
    {
      id: "stock-mismatch",
      type: "warn",
      icon: "⚠",
      title: "Stock level mismatch detected",
      desc: "Main Store (US) SKU: APPL-123 differs from master inventory by 14 units.",
      link: "Resolve Sync Issue",
      mins: 2,
    },
    {
      id: "api-sync",
      type: "ok",
      icon: "✓",
      title: "API Sync Success",
      desc: "Hourly catalog sync completed across all 3 active storefronts. 0 errors.",
      link: null,
      mins: 14,
    },
    {
      id: "webhook",
      type: "info",
      icon: "↗",
      title: "New Webhook Received",
      desc: "Large wholesale order (#8492) placed on Boutique Collection. Value: $4,200.",
      link: null,
      mins: 60,
    },
    // Platform-specific events based on scenario
    ...(!shopifyOk ? [{
      id: "shopify-down",
      type: "drop",
      icon: "✕",
      title: "Shopify Unreachable",
      desc: "Shopify API did not respond within 10s. Your TikTok Shop data is unaffected. Retrying automatically.",
      link: null,
      mins: 3,
    }] : []),
    ...(tiktokStale ? [{
      id: "tiktok-delay",
      type: "warn",
      icon: "⚠",
      title: "TikTok Sync Delayed",
      desc: `TikTok Shop data is ${platforms.tiktok.staleness_minutes} minutes old (threshold: 15 min). Last-known data is displayed.`,
      link: null,
      mins: platforms.tiktok.staleness_minutes,
    }] : []),
    ...(!tiktokOk && !tiktokStale && !bothDown ? [{
      id: "tiktok-down",
      type: "drop",
      icon: "✕",
      title: "TikTok Shop Unreachable",
      desc: "API did not respond within 10s. Your Shopify data is unaffected. Retrying automatically.",
      link: null,
      mins: 3,
    }] : []),
    ...(bothDown ? [{
      id: "both-down",
      type: "drop",
      icon: "✕",
      title: "All Platforms Unreachable",
      desc: "Both Shopify and TikTok Shop APIs are not responding. Dashboard metrics are unavailable. Our team has been notified.",
      link: null,
      mins: 1,
    }] : []),
    {
      id: "conversion-drop",
      type: "drop",
      icon: "↙",
      title: "Conversion Drop Detected",
      desc: "Main Store (EU) checkout drop-off increased by 14% in the last 24 hours. Consider reviewing local payment gateways.",
      link: "View Analysis →",
      mins: 180,
    },
  ];

  const iconClass = { warn: "icon-warn", ok: "icon-ok", info: "icon-info", drop: "icon-drop" };

  return (
    <aside className="right-panel" aria-label="Active Intelligence">
      <div className="right-panel-header">
        <div className="right-panel-title">
          <span className="lightning-icon">⚡</span>
          Active Intelligence
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          Live
        </div>
      </div>

      <div className="intelligence-list">
        {events.map((ev) => (
          <div key={ev.id} id={`intel-${ev.id}`} className="intel-item">
            <div className="intel-header">
              <div className={`intel-icon-wrap ${iconClass[ev.type]}`}>{ev.icon}</div>
              <div className="intel-title-row">
                <div className="intel-title">{ev.title}</div>
              </div>
              <span className="intel-time">{timeAgo(ev.mins)}</span>
            </div>
            <div className="intel-desc">{ev.desc}</div>
            {ev.link && (
              <a href="#" className="intel-link" onClick={(e) => e.preventDefault()}>
                {ev.link}
              </a>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
