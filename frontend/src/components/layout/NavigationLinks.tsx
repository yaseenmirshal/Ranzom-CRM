import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { NAVIGATION_GROUPS, type NavigationItem } from "@/lib/constants";

type NavigationLinksProps = {
  activePath: string;
  onNavigate?: () => void;
};

function isActive(item: NavigationItem, activePath: string) {
  if (item.label === "Pipeline") return activePath === "/pipeline";
  if (item.href === "/dashboard") return activePath === "/dashboard";
  return activePath === item.href || activePath.startsWith(`${item.href}/`);
}

export default function NavigationLinks({
  activePath,
  onNavigate,
}: NavigationLinksProps) {
  return (
    <nav aria-label="Main navigation" className="sidebar-navigation">
      {NAVIGATION_GROUPS.map((group) => (
        <div className="navigation-group" key={group.label}>
          <div className="navigation-heading">{group.label}</div>
          <div className="navigation-items">
            {group.items.map((item) => {
              const active = isActive(item, activePath);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`navigation-link${active ? " is-active" : ""}`}
                  href={item.href}
                  key={item.label}
                  onClick={onNavigate}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
