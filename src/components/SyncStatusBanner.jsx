import { useState } from "react";

/**
 * SyncStatusBanner — holds local state for tooltip visibility.
 *
 * Reads `platforms` from parent and renders a calm, non-alarming status row.
 * Design principle: amber = delayed, red = unavailable, but NEVER block the view.
 *
 * UX reasoning (Deliverable 4):
 *   - Amber badge with "Last synced X min ago" is informational, not alarming.
 *   - We intentionally do NOT use harsh red for staleness — only for true unavailability.
 *   - Tooltip on hover provides full technical detail for power users.
 *   - Message is phrased as "we're on it" to reduce merchant anxiety.
 *
 * Props:
 *   platforms {object} — { shopify: { status, last_synced }, tiktok: { status, last_synced, staleness_minutes, error } }
 */
export default function SyncStatusBanner({ platforms }) {
  const [tooltipVisible, setTooltipVisible] = useState(null); // "shopify" | "tiktok" | null

  function formatMinutesAgo(isoString) {
    if (!isoString) return null;
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60_000);
    if (diff < 1) return "just now";
    if (diff === 1) return "1 min ago";
    return `${diff} min ago`;
  }

  function getPlatformConfig(key, platform) {
    const platformName = key === "shopify" ? "Shopify" : "TikTok Shop";
    const otherPlatform = key === "shopify" ? "TikTok Shop" : "Shopify";
    if (platform.status === "ok") {
      return {
        icon: "✅",
        label: "Live",
        className: "sync-ok",
        detail: `Last synced ${formatMinutesAgo(platform.last_synced)}`,
        tooltip: `${platformName} is connected and updating normally.`,
      };
    }
    if (platform.status === "stale") {
      const mins = platform.staleness_minutes || "15+";
      return {
        icon: "⚠️",
        label: `Delayed · ${mins} min`,
        className: "sync-stale",
        detail: `Last synced ${formatMinutesAgo(platform.last_synced)} · Showing last known data`,
        tooltip: `${platformName} data is ${mins} minutes old (threshold: 15 min). This is usually resolved within a few minutes. Your dashboard continues to show the most recent available data.`,
      };
    }
    // unavailable
    return {
      icon: "🔴",
      label: "Temporarily Unavailable",
      className: "sync-unavailable",
      detail: platform.error?.message || "Cannot reach platform API",
      tooltip: `${platformName} is currently unreachable (${platform.error?.code ?? "CONNECTION_ERROR"}). We're retrying automatically. Your ${otherPlatform} data is unaffected.`,
    };
  }

  const shopifyCfg = getPlatformConfig("shopify", platforms.shopify);
  const tiktokCfg = getPlatformConfig("tiktok", platforms.tiktok);

  return (
    <div className="sync-banner">
      <div className="sync-title">Platform Sync Status</div>
      <div className="sync-items">
        {[
          { key: "shopify", cfg: shopifyCfg, label: "Shopify" },
          { key: "tiktok", cfg: tiktokCfg, label: "TikTok Shop" },
        ].map(({ key, cfg, label }) => (
          <div
            key={key}
            className={`sync-item ${cfg.className}`}
            onMouseEnter={() => setTooltipVisible(key)}
            onMouseLeave={() => setTooltipVisible(null)}
          >
            <span className="sync-icon">{cfg.icon}</span>
            <div className="sync-text">
              <span className="sync-platform">{label}</span>
              <span className="sync-label">{cfg.label}</span>
              <span className="sync-detail">{cfg.detail}</span>
            </div>
            {tooltipVisible === key && (
              <div className="sync-tooltip">{cfg.tooltip}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
