import Brand from "./Brand";

export default function AppShellFallback() {
  return (
    <div
      aria-label="Loading RanzomTech CRM"
      aria-live="polite"
      className="app-shell-fallback"
      role="status"
    >
      <aside className="fallback-sidebar">
        <Brand />
        <div className="fallback-skeleton fallback-workspace" />
        <div className="fallback-navigation">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="fallback-skeleton fallback-navigation-item"
              key={index}
            />
          ))}
        </div>
      </aside>
      <div className="fallback-main">
        <header className="fallback-header">
          <div className="fallback-skeleton fallback-heading" />
          <div className="fallback-skeleton fallback-search" />
          <div className="fallback-skeleton fallback-avatar" />
        </header>
        <main className="fallback-content">
          <div className="fallback-skeleton fallback-page-title" />
          <div className="fallback-skeleton fallback-description" />
        </main>
      </div>
    </div>
  );
}
