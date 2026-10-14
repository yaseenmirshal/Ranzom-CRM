export type ContactRecord = {
  id: number;
  name: string;
  initials: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  relationship: "Lead" | "Client";
  owner: string;
  lastActivity: string;
  color: string;
};

export type ClientRecord = {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  industry: string;
  projects: number;
  revenue: number;
  outstanding: number;
  owner: string;
  lastActivity: string;
  status: "Active" | "Onboarding" | "At risk";
  services: string[];
};

export type ProjectRecord = {
  id: number;
  name: string;
  client: string;
  status: "In progress" | "Planning" | "On hold" | "Completed";
  startDate: string;
  dueDate: string;
  value: number;
  team: string[];
  progress: number;
  description: string;
};

export const contactRecords: ContactRecord[] = [
  {
    id: 1,
    name: "Olivia Chen",
    initials: "OC",
    company: "Northstar Studio",
    email: "olivia@northstar.studio",
    phone: "+1 (415) 555-0132",
    position: "Primary contact",
    relationship: "Client",
    owner: "Workspace admin",
    lastActivity: "Demo record",
    color: "coral",
  },
];

export const clientRecords: ClientRecord[] = [
  {
    id: 1,
    name: "Northstar Studio",
    contact: "Olivia Chen",
    email: "olivia@northstar.studio",
    phone: "+1 (415) 555-0132",
    industry: "Business services",
    projects: 0,
    revenue: 0,
    outstanding: 0,
    owner: "Workspace admin",
    lastActivity: "Demo record",
    status: "Onboarding",
    services: [],
  },
];

export const projectRecords: ProjectRecord[] = [
  {
    id: 1,
    name: "Northstar Studio introduction",
    client: "Northstar Studio",
    status: "Planning",
    startDate: "Not scheduled",
    dueDate: "Not scheduled",
    value: 0,
    team: ["Workspace admin"],
    progress: 0,
    description: "A sample project record to demonstrate how client work is organized.",
  },
];

export const followUpRecords = [
  {
    id: 1,
    person: "Olivia Chen",
    company: "Northstar Studio",
    task: "Sample: plan an introductory conversation",
    due: "Not scheduled",
    bucket: "Upcoming",
    owner: "Workspace admin",
    priority: "Normal",
    related: "Client",
  },
];

export const taskRecords = [
  {
    id: 1,
    title: "Sample: prepare an introduction for Northstar Studio",
    related: "Northstar Studio · Client",
    owner: "Workspace admin",
    priority: "Normal",
    due: "Not scheduled",
    status: "Pending",
  },
];
