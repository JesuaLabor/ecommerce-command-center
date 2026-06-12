/**
 * TopBar — search bar + icon actions + scenario strip.
 * Props: scenario {string}, onScenarioChange {function}
 */
export default function TopBar({ scenario, onScenarioChange }) {
  return (
    <>
      <header className="topbar" id="topbar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            id="global-search"
            className="search-input"
            placeholder="Search across stores, orders, or inventory"
            aria-label="Global search"
          />
          <span className="search-shortcut">/</span>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button className="topbar-icon-btn" aria-label="Notifications" id="btn-notifications">🔔</button>
          <button className="topbar-icon-btn" aria-label="Settings" id="btn-settings">⚙️</button>
          <button className="topbar-icon-btn" aria-label="Help" id="btn-help">❓</button>
        </div>
      </header>

      {/* Demo scenario strip — slim informational bar */}
      <div className="scenario-strip">
        <label htmlFor="scenario-select" style={{ whiteSpace: "nowrap" }}>🎛 Demo Mode:</label>
        <select
          id="scenario-select"
          className="scenario-select"
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
        >
          <option value="healthy">✅ All Healthy</option>
          <option value="stale">⚠️ TikTok Stale (18 min)</option>
          <option value="unavailable">🔴 TikTok Down</option>
          <option value="shopify_down">🔴 Shopify Down</option>
          <option value="both_down">🔴🔴 Both Platforms Down</option>
        </select>
        <span style={{ color: "var(--accent-blue)", fontSize: "0.72rem" }}>
          Switch scenarios to see how the dashboard handles partial data failures.
        </span>
      </div>
    </>
  );
}
