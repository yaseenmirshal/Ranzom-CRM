import Link from "next/link";
import Icon from "@/components/ui/Icon";

type HeaderProps = {
  activePath: string;
  onMenuClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/contacts": "Contacts",
  "/clients": "Clients",
  "/follow-ups": "Follow-ups",
  "/tasks": "Tasks",
  "/projects": "Projects",
  "/quotations": "Quotations",
  "/invoices": "Invoices",
  "/receipts": "Receipts",
  "/reports": "Reports",
  "/settings": "Settings",
};

function getPageTitle(path: string) {
  if (path.startsWith("/leads/")) return "Lead details";
  if (path.startsWith("/settings/")) return "Settings";
  if (path.startsWith("/clients/")) return "Client details";
  if (path.startsWith("/projects/")) return "Project details";
  if (path === "/quotations/new") return "New quote";
  if (path === "/invoices/new") return "New invoice";
  if (path === "/receipts/new") return "New receipt";
  return PAGE_NAMES[path] ?? "Workspace";
}

export default function Header({
  activePath,
  onMenuClick,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-leading">
        <button
          aria-label="Open navigation"
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          type="button"
        >
          <Icon name="menu" size={20} />
        </button>
        <div className="header-page-title">
          <span className="header-eyebrow">RANZOMTECH CRM</span>
          <span className="header-title">{getPageTitle(activePath)}</span>
        </div>
      </div>

      <label className="global-search">
        <Icon name="search" size={17} />
        <input aria-label="Search CRM" placeholder="Search anything..." type="search" />
        <kbd>⌘ K</kbd>
      </label>

      <div className="header-actions">
        <details className="header-popover notification-popover">
          <summary aria-label="Notifications" className="icon-button notification-button">
            <Icon name="bell" size={18} />
            <span className="notification-indicator" />
          </summary>
          <div className="popover-card notification-card">
            <div className="popover-heading">
              <span>Notifications</span>
            </div>
            <div className="notification-empty">
              <span className="notification-empty-icon">
                <Icon name="bell" size={19} />
              </span>
              <strong>You&apos;re all caught up</strong>
              <span>New activity will appear here.</span>
            </div>
          </div>
        </details>

        <button
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          className="icon-button theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
        </button>

        <span aria-hidden="true" className="header-divider" />

        <details className="header-popover profile-popover">
          <summary aria-label="Open user menu" className="profile-trigger">
            <span aria-hidden="true" className="profile-avatar">RT</span>
            <span className="profile-trigger-copy">
              <strong>Workspace admin</strong>
              <span>Administrator</span>
            </span>
            <Icon name="chevron" size={14} />
          </summary>
          <div className="popover-card profile-card">
            <div className="profile-card-heading">
              <span aria-hidden="true" className="profile-avatar profile-avatar-large">RT</span>
              <span>
                <strong>Workspace admin</strong>
                <span>Administrator</span>
              </span>
            </div>
            <Link className="profile-menu-link" href="/settings">
              <Icon name="settings" size={16} />
              Account settings
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
