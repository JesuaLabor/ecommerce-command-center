import { useState, useEffect, useCallback } from "react";
import { fetchDashboard } from "./api/mockData";

import Sidebar            from "./components/Sidebar";
import TopBar             from "./components/TopBar";
import OverviewPage       from "./components/OverviewPage";
import KPISummary         from "./components/KPISummary";
import StorePerformance   from "./components/StorePerformance";
import ActiveIntelligence from "./components/ActiveIntelligence";
import LoadingScreen      from "./components/LoadingScreen";

/**
 * App — root component, owns all global state.
 * Global state: dashboardData, loading, error, scenario, activePage
 */
export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [scenario, setScenario]           = useState("stale");
  const [activePage, setActivePage]       = useState("shopify");

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
    overview: { title: "Overview", sub: "Full performance snapshot across all connected platforms." },
    shopify:  { title: "Shopify Management", sub: "7-day performance overview across all active Shopify storefronts." },
    tiktok:   { title: "TikTok Shop", sub: "TikTok Shop orders, revenue, and sync status." },
    inventory:{ title: "Inventory", sub: "Stock levels, low-stock alerts, and SKU health." },
    orders:   { title: "Orders", sub: "Unified order feed across Shopify and TikTok Shop." },
  };
  const page = pageLabels[activePage] ?? pageLabels.shopify;

  return (
    <div className="app">
      {/* ── Sidebar (grid-area: sidebar) ── */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* ── Topbar + scenario strip (grid-area: topbar) ── */}
      <div className="topbar-wrapper">
        <TopBar scenario={scenario} onScenarioChange={setScenario} />
      </div>

      {/* ── Main content (grid-area: main) ── */}
      <main className="main" id="main-content">
        {activePage === "overview" ? (
          /* Overview has its own internal layout */
          <OverviewPage platforms={dashboardData.platforms} />
        ) : (
          <>
            {/* Page header */}
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

            {/* KPI cards */}
            <KPISummary platforms={dashboardData.platforms} />

            {/* Store performance table */}
            <StorePerformance platforms={dashboardData.platforms} />
          </>
        )}
      </main>

      {/* ── Right panel (grid-area: right) ── */}
      <ActiveIntelligence platforms={dashboardData.platforms} />
    </div>
  );
}
