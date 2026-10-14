import { crmLeadSamples, type CRMLead } from "@/data/mock-data";

const STORAGE_KEY = "ranzomtech-crm-leads";

function isCRMLead(value: unknown): value is CRMLead {
  if (typeof value !== "object" || value === null) return false;
  const lead = value as Record<string, unknown>;
  return (
    typeof lead.id === "number" &&
    typeof lead.name === "string" &&
    typeof lead.email === "string" &&
    typeof lead.company === "string" &&
    typeof lead.stage === "string"
  );
}

export function readLeads(): CRMLead[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return crmLeadSamples;

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isCRMLead)) {
    throw new Error("Saved leads could not be read. Clear the saved CRM data and try again.");
  }
  if (parsed.length === 0) return [];

  const migrated = parsed.filter((lead) => lead.id < 1033 || lead.id > 1042);
  if (!migrated.length) return crmLeadSamples;
  if (migrated.length !== parsed.length && !migrated.some((lead) => lead.id === crmLeadSamples[0].id)) {
    return [...crmLeadSamples, ...migrated];
  }
  return migrated;
}

export function saveLeads(leads: CRMLead[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}
