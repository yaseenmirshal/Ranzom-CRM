import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { SETTINGS_ITEM } from "@/lib/constants";
import Brand from "./Brand";
import NavigationLinks from "./NavigationLinks";

type SidebarProps = {
  activePath: string;
};

export default function Sidebar({ activePath }: SidebarProps) {
  const settingsActive =
    activePath === SETTINGS_ITEM.href ||
    activePath.startsWith(`${SETTINGS_ITEM.href}/`);

  return (
    <aside className="desktop-sidebar">
      <div className="brand-row">
        <Brand />
      </div>

      <button className="workspace-switcher" type="button">
        <span aria-hidden="true" className="workspace-avatar">
          R
        </span>
        <span className="workspace-copy">
          <span className="workspace-label">Workspace</span>
          <span className="workspace-name">RanzomTech</span>
        </span>
        <Icon name="chevron" size={15} />
      </button>

      <NavigationLinks activePath={activePath} />

      <div className="sidebar-bottom">
        <Link className="navigation-link settings-link" href={SETTINGS_ITEM.href}>
          <Icon name={SETTINGS_ITEM.icon} size={17} />
          <span>{SETTINGS_ITEM.label}</span>
          {settingsActive && <span aria-label="Current page" className="active-dot" />}
        </Link>
        <div className="sidebar-plan">
          <span aria-hidden="true" className="plan-icon">
            <Icon name="sparkle" size={16} />
          </span>
          <span className="plan-copy">
            <strong>Your workspace</strong>
            <span>Built for better relationships</span>
          </span>
        </div>
        <div className="sidebar-version">RANZOMTECH CRM <span>·</span> V1.0</div>
      </div>
    </aside>
  );
}
