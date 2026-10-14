import type { IconName } from "@/components/ui/Icon";

export type NavigationItem = {
  label: string;
  href: string;
  icon: IconName;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }],
  },
  {
    label: "Sales",
    items: [
      { label: "Leads", href: "/leads", icon: "leads" },
      { label: "Pipeline", href: "/pipeline", icon: "pipeline" },
      { label: "Quotations", href: "/quotations", icon: "quotation" },
    ],
  },
  {
    label: "Relationships",
    items: [
      { label: "Contacts", href: "/contacts", icon: "contacts" },
      { label: "Clients", href: "/clients", icon: "clients" },
      { label: "Follow-ups", href: "/follow-ups", icon: "followups" },
    ],
  },
  {
    label: "Delivery",
    items: [
      { label: "Tasks", href: "/tasks", icon: "tasks" },
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Invoices", href: "/invoices", icon: "invoice" },
      { label: "Receipts", href: "/receipts", icon: "receipt" },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Reports", href: "/reports", icon: "reports" }],
  },
];

export const SETTINGS_ITEM: NavigationItem = {
  label: "Settings",
  href: "/settings",
  icon: "settings",
};
