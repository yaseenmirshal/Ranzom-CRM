import type { ReactNode } from "react";

export type IconName =
  | "dashboard"
  | "leads"
  | "pipeline"
  | "contacts"
  | "clients"
  | "followups"
  | "tasks"
  | "projects"
  | "quotation"
  | "invoice"
  | "receipt"
  | "reports"
  | "settings"
  | "search"
  | "bell"
  | "menu"
  | "close"
  | "chevron"
  | "sparkle"
  | "plus"
  | "arrowUpRight"
  | "calendar"
  | "clock"
  | "check"
  | "sun"
  | "moon"
  | "mail"
  | "phone"
  | "filter"
  | "dots"
  | "edit"
  | "trash"
  | "eye"
  | "eyeOff";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

export default function Icon({
  name,
  size = 18,
  strokeWidth = 1.7,
}: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth,
  };

  const shapes = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.4" />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.4" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      </>
    ),
    leads: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17 15c2 .5 3.2 2.1 3.5 4.5" />
      </>
    ),
    pipeline: (
      <>
        <path d="M4 6h16M6.5 12h11M9 18h6" />
        <circle cx="8" cy="6" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="11" cy="18" r="1.5" />
      </>
    ),
    contacts: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.5-3.1 2.3-4.8 5.5-4.8s5 1.7 5.5 4.8M16 5.5a3 3 0 0 1 0 5.5M17 14.5c2 .6 3.2 2 3.5 4.5" />
      </>
    ),
    clients: (
      <>
        <path d="M3 20h18M5 20V8l7-4 7 4v12M9 20v-5h6v5" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </>
    ),
    followups: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3.5 2M8 2.8 6.5 4M16 2.8 17.5 4" />
      </>
    ),
    tasks: (
      <>
        <rect x="4" y="4" width="16" height="17" rx="2" />
        <path d="m8 12 2.3 2.3L16 8.7M8 7.5h2" />
      </>
    ),
    projects: (
      <>
        <path d="M3.5 7.5h7l2 2h8v9.7a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8z" />
        <path d="M3.5 7.5V5.3a1.8 1.8 0 0 1 1.8-1.8h4.2l2 2h7.2a1.8 1.8 0 0 1 1.8 1.8v2.2" />
      </>
    ),
    quotation: (
      <>
        <path d="M7 3.5h7l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
        <path d="M14 3.8v4h4M8.5 12h7M8.5 16h5" />
      </>
    ),
    invoice: (
      <>
        <path d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15l-3-1.8-3 1.8-3-1.8-3 1.8-3-1.8V5A1.5 1.5 0 0 1 6 3.5Z" />
        <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15l-3-1.8-3 1.8-3-1.8-3 1.8-3-1.8V5A1.5 1.5 0 0 1 6 3.5Z" />
        <path d="M8.5 8.5h7M8.5 12h4M14.5 15.5l1.5 1.5 3-3" />
      </>
    ),
    reports: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        <path d="m3.5 7 5-3 5 5 6-5" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
        <path d="m19.4 13.5 1.1.9-1.3 2.3-1.4-.5a7.6 7.6 0 0 1-1.7 1l-.2 1.5h-2.7l-.4-1.4a7.4 7.4 0 0 1-1.9-.1l-.8 1.2-2.5-1.1.4-1.5a7.6 7.6 0 0 1-1.2-1.5l-1.5.1-.8-2.6 1.3-.8a7.4 7.4 0 0 1 .1-1.9l-1.2-.9 1.3-2.3 1.4.5a7.6 7.6 0 0 1 1.7-1l.2-1.5h2.7l.4 1.4a7.4 7.4 0 0 1 1.9.1l.8-1.2 2.5 1.1-.4 1.5a7.6 7.6 0 0 1 1.2 1.5l1.5-.1.8 2.6-1.3.8a7.4 7.4 0 0 1-.1 1.9Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4.2 4.2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
    calendar: (
      <>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    check: <path d="m5 12.5 4.2 4.2L19 7" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: <path d="M20.2 15.3A8.4 8.4 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    phone: <path d="M7.2 3.5h3l1.5 4-2 1.8a15 15 0 0 0 5 5l1.8-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5.2 5.7a2 2 0 0 1 2-2.2Z" />,
    filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
    dots: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10.6 6.2A9.9 9.9 0 0 1 12 6c6.2 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.7M6.2 6.3C3.8 8 2.5 12 2.5 12s3.3 6 9.5 6c1 0 2-.2 2.8-.5" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
        <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
      </>
    ),
  } satisfies Record<IconName, ReactNode>;

  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...common}
    >
      {shapes[name]}
    </svg>
  );
}
