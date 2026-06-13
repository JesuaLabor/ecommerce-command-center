/**
 * Header — purely presentational (no local state).
 * Displays merchant name, current date, platform identity badges,
 * and a scenario switcher for demo purposes.
 *
 * Props:
 *   merchantName {string}
 *   date {string}
 *   scenario {string} — current data scenario
 *   onScenarioChange {function}
 */
export default function Header({ merchantName, date, scenario, onScenarioChange }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-brand">
          <div className="brand-icon">⚡</div>
          <div>
            <h1 className="brand-name">Intelligence Dashboard</h1>
            <p className="brand-sub">eCommerce Intelligence Dashboard</p>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="merchant-badge">
          <span className="merchant-icon">🏪</span>
          <span className="merchant-name">{merchantName}</span>
        </div>
        <div className="platform-badges">
          <span className="badge badge-shopify">
            <span className="badge-dot dot-green" />
            Shopify
          </span>
          <span className="badge badge-tiktok">
            <span className="badge-dot dot-pink" />
            TikTok Shop
          </span>
        </div>
      </div>

      <div className="header-right">
        <div className="date-chip">
          <span className="date-icon">📅</span>
          <span>{date}</span>
        </div>
        {/* Demo scenario switcher — not part of production UI */}
        <div className="scenario-switcher">
          <label className="scenario-label">Demo Mode:</label>
          <select
            value={scenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="scenario-select"
          >
            <option value="healthy">✅ All Healthy</option>
            <option value="stale">⚠️ TikTok Stale</option>
            <option value="unavailable">🔴 TikTok Down</option>
          </select>
        </div>
      </div>
    </header>
  );
}
