import type { CRMRecord } from "@/types/crm";

export const mockData: CRMRecord[] = [];

export type LeadStage =
  | "New"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export type LeadSource =
  | "Website"
  | "WhatsApp"
  | "Referral"
  | "Instagram"
  | "Other";

export type CRMLead = {
  id: number;
  name: string;
  initials: string;
  company: string;
  companyType: string;
  email: string;
  phone: string;
  source: LeadSource;
  value: number;
  stage: LeadStage;
  owner: string;
  ownerInitials: string;
  lastActivity: string;
  createdAt: string;
  color: string;
  notes: string;
  isDemo?: boolean;
};

export type DashboardLead = {
  id: number;
  name: string;
  initials: string;
  company: string;
  companyType: string;
  source: LeadSource;
  value: number;
  stage: LeadStage;
  owner: string;
  ownerInitials: string;
  date: string;
  color: string;
  isDemo?: boolean;
};

export type DashboardFollowUp = {
  id: number;
  person: string;
  company: string;
  subject: string;
  time: string;
  status: "overdue" | "today" | "upcoming";
};

export type DashboardActivity = {
  id: number;
  title: string;
  detail: string;
  time: string;
  icon: "leads" | "pipeline" | "quotation" | "followups" | "clients";
  tone: "green" | "blue" | "amber" | "slate";
};

export const dashboardData = {
  kpis: [
    { label: "Total leads", value: "0", change: "0", context: "No real leads yet", icon: "leads", tone: "sage", trend: "up" },
    { label: "Open pipeline", value: "₹0", change: "0", context: "No active opportunities", icon: "pipeline", tone: "blue", trend: "up" },
    { label: "Won deals", value: "0", change: "0", context: "No deals won yet", icon: "clients", tone: "green", trend: "up" },
    { label: "Revenue", value: "₹0", change: "0", context: "No revenue recorded", icon: "invoice", tone: "amber", trend: "up" },
    { label: "Follow-ups due", value: "0", change: "0", context: "Nothing needs attention", icon: "followups", tone: "rose", trend: "attention" },
  ],
  pipeline: [
    { stage: "New" as const, count: 0, value: 0, color: "slate" },
    { stage: "Qualified" as const, count: 0, value: 0, color: "blue" },
    { stage: "Proposal" as const, count: 0, value: 0, color: "violet" },
    { stage: "Negotiation" as const, count: 0, value: 0, color: "amber" },
    { stage: "Won" as const, count: 0, value: 0, color: "green" },
  ],
  sources: [
    { name: "Website", count: 0, percent: 0, color: "source-sage" },
    { name: "Referral", count: 0, percent: 0, color: "source-blue" },
    { name: "WhatsApp", count: 0, percent: 0, color: "source-amber" },
    { name: "Instagram", count: 0, percent: 0, color: "source-rose" },
    { name: "Other", count: 0, percent: 0, color: "source-slate" },
  ],
  leads: [
    {
      id: 1,
      name: "Olivia Chen",
      initials: "OC",
      company: "Northstar Studio",
      companyType: "Business services",
      source: "Website" as const,
      value: 0,
      stage: "New" as const,
      owner: "Workspace admin",
      ownerInitials: "WA",
      date: "Demo",
      color: "coral",
    },
  ] satisfies DashboardLead[],
  followUps: [] as DashboardFollowUp[],
  activities: [] as DashboardActivity[],
} as const;

export const crmLeadSamples: CRMLead[] = [
  {
    id: 1,
    name: "Olivia Chen",
    initials: "OC",
    company: "Northstar Studio",
    companyType: "Business services",
    email: "olivia@northstar.studio",
    phone: "+1 (415) 555-0132",
    source: "Website",
    value: 0,
    stage: "New",
    owner: "Workspace admin",
    ownerInitials: "WA",
    lastActivity: "Demo record",
    createdAt: "Demo",
    color: "coral",
    notes: "Sample lead to demonstrate the CRM workflow.",
    isDemo: true,
  },
];
