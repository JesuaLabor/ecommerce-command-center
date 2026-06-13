export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading dashboard">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="loading-text">Loading Intelligence Dashboard…</p>
    </div>
  );
}
