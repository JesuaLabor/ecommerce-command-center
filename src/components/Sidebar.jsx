/**
 * Sidebar — presentational, no local state.
 * Props: activePage {string}, onNavigate {function}
 */
export default function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { id: "overview",   icon: "▦",  label: "Overview" },
    { id: "shopify",    icon: "🛍",  label: "Shopify" },
    { id: "tiktok",     icon: "♪",  label: "TikTok Shop" },
    { id: "inventory",  icon: "📦", label: "Inventory" },
    { id: "orders",     icon: "🧾", label: "Orders" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">O</div>
        <div className="brand-text">
          <span className="brand-title">Operational...</span>
          <span className="brand-sub">Enterprise Merchant</span>
        </div>
      </div>

      <nav>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            role="button"
            tabIndex={0}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-bottom">
        <div className="nav-item" id="nav-merchant-profile">
          <span className="nav-icon">👤</span>
          Merchant Profile
        </div>
      </div>
    </aside>
  );
}
