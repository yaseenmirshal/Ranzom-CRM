"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";

const THEME_STORAGE_KEY = "ranzomtech-theme";
const THEME_CHANGE_EVENT = "ranzomtech-theme-change";

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): "light" | "dark" {
  return "light";
}

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePath =
    pathname === "/leads" && searchParams.get("view") === "pipeline"
      ? "/pipeline"
      : pathname;
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  useEffect(() => {
    if (!mobileNavigationOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavigationOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    document.body.classList.add("navigation-open");
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("navigation-open");
    };
  }, [mobileNavigationOpen]);

  return (
    <div className="app-shell">
      <Sidebar activePath={activePath} />
      <div className="app-main">
        <Header
          activePath={activePath}
          onMenuClick={() => setMobileNavigationOpen(true)}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        <main className="app-content">{children}</main>
      </div>
      <MobileNav
        activePath={activePath}
        isOpen={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
      />
    </div>
  );
}
