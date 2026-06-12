import { useState, useEffect, useCallback } from "react";
import { fetchDashboard } from "./api/mockData";

import Sidebar        from "./components/Sidebar";
import OverviewPage   from "./components/OverviewPage";
import KPISummary     from "./components/KPISummary";
import StorePerformance from "./components/StorePerformance";
import LoadingScreen  from "./components/LoadingScreen";

/**
 * App — root component.
 * Removed the TopBar/scenario strip from the grid; demo mode moved to main header.
 */
export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [scenario, setScenario]           = useState("healthy");
  const [activePage, setActivePage]       = useState("overview");

  const loadDashboard = useCallback(async (s) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard(s);
      setDashboardData(data);
    } catch (err) {
      setError("Unable to reach the dashboard service. Please refresh.");
      console.error("[Dashboard] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(scenario); }, [scenario, loadDashboard]);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <h2>Dashboard Unavailable</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => loadDashboard(scenario)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pageLabels = {
    overview:  { title: "Overview",           sub: "Full performance snapshot across all connected platforms." },
    shopify:   { title: "Shopify Management", sub: "7-day performance overview across all active Shopify storefronts." },
    tiktok:    { title: "TikTok Shop",        sub: "TikTok Shop orders, revenue, and sync status." },
    inventory: { title: "Inventory",          sub: "Stock levels, low-stock alerts, and SKU health." },
    orders:    { title: "Orders",             sub: "Unified order feed across Shopify and TikTok Shop." },
  };
  const page = pageLabels[activePage] ?? pageLabels.overview;

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* ── Main ── */}
      <main className="main" id="main-content">

        {/* Top-right actions bar */}
        <div className="main-topbar">
          <div className="main-topbar-left">
            <label className="demo-label">🎛 Demo:</label>
            <select
              id="scenario-select"
              className="scenario-select"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              <option value="healthy">✅ All Healthy</option>
              <option value="stale">⚠️ TikTok Stale</option>
              <option value="unavailable">🔴 TikTok Down</option>
              <option value="shopify_down">🔴 Shopify Down</option>
              <option value="both_down">🔴🔴 Both Down</option>
            </select>
          </div>
          <div className="main-topbar-right">
            <button className="topbar-icon-btn" aria-label="Notifications" id="btn-notifications">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="notif-badge">2</span>
            </button>
            <div className="user-avatar" id="btn-user-menu">JL</div>
          </div>
        </div>

        {/* Page content */}
        {activePage === "overview" ? (
          <OverviewPage platforms={dashboardData.platforms} />
        ) : (
          <>
            <div className="page-header">
              <div className="page-title-block">
                <h1 className="page-title">{page.title}</h1>
                <p className="page-subtitle">{page.sub}</p>
              </div>
              <div className="page-actions">
                <button className="btn-outline" id="btn-date-range">📅 Last 7 Days</button>
                <button className="btn-primary" id="btn-sync-stores" onClick={() => loadDashboard(scenario)}>↻ Sync Stores</button>
              </div>
            </div>
            <KPISummary platforms={dashboardData.platforms} />
            <StorePerformance platforms={dashboardData.platforms} />
          </>
        )}
      </main>
    </div>
  );
}
