"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Brand from "./Brand";
import NavigationLinks from "./NavigationLinks";

type MobileNavProps = {
  activePath: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileNav({
  activePath,
  isOpen,
  onClose,
}: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="mobile-navigation-layer">
      <button
        aria-label="Close navigation"
        className="mobile-navigation-backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Mobile navigation menu"
        aria-modal="true"
        className="mobile-navigation-panel"
        role="dialog"
      >
        <div className="mobile-panel-top">
          <Brand onClick={onClose} />
          <button
            aria-label="Close navigation"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        <NavigationLinks
          activePath={activePath}
          onNavigate={onClose}
        />
        <div className="mobile-settings-link">
          <Link
            className="mobile-settings-copy"
            href="/settings"
            onClick={onClose}
          >
            <Icon name="settings" size={17} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
