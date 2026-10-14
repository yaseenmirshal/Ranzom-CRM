export type DocumentKind = "quotation" | "invoice" | "receipt";

export type BusinessDocument = {
  id: string;
  kind: DocumentKind;
  number: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  owner: string;
  paid?: number;
  method?: string;
  reference?: string;
  contact?: string;
  email?: string;
  phone?: string;
  notes?: string;
  terms?: string;
  lineItems?: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  }[];
  relatedInvoice?: string;
};

export const customers = [
  {
    name: "Northstar Studio",
    contact: "Olivia Chen",
    email: "olivia@northstar.studio",
    phone: "+1 (415) 555-0132",
  },
];

export const businessDocuments: BusinessDocument[] = [
  { id: "quotation-demo", kind: "quotation", number: "QT-DEMO", customer: "Northstar Studio", issueDate: "Not issued", dueDate: "Not scheduled", amount: 0, status: "Draft", owner: "Workspace admin", contact: "Olivia Chen", email: "olivia@northstar.studio" },
  { id: "invoice-demo", kind: "invoice", number: "INV-DEMO", customer: "Northstar Studio", issueDate: "Not issued", dueDate: "Not scheduled", amount: 0, status: "Draft", owner: "Workspace admin", paid: 0, contact: "Olivia Chen", email: "olivia@northstar.studio" },
  { id: "receipt-demo", kind: "receipt", number: "RCT-DEMO", customer: "Northstar Studio", issueDate: "Not issued", dueDate: "Not scheduled", amount: 0, status: "Draft", owner: "Workspace admin", method: "Not selected", contact: "Olivia Chen", email: "olivia@northstar.studio" },
];

export const documentStatuses: Record<DocumentKind, string[]> = {
  quotation: ["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired"],
  invoice: ["Draft", "Sent", "Partially paid", "Paid", "Overdue", "Cancelled"],
  receipt: ["Draft", "Issued", "Void"],
};

function isBusinessDocument(value: unknown): value is BusinessDocument {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" &&
    typeof item.number === "string" &&
    typeof item.customer === "string" &&
    typeof item.issueDate === "string" &&
    typeof item.dueDate === "string" &&
    typeof item.amount === "number" &&
    typeof item.status === "string" &&
    typeof item.owner === "string" &&
    (item.paid === undefined || typeof item.paid === "number") &&
    (item.method === undefined || typeof item.method === "string") &&
    (item.reference === undefined || typeof item.reference === "string") &&
    (item.contact === undefined || typeof item.contact === "string") &&
    (item.email === undefined || typeof item.email === "string") &&
    (item.phone === undefined || typeof item.phone === "string") &&
    (item.notes === undefined || typeof item.notes === "string") &&
    (item.terms === undefined || typeof item.terms === "string") &&
    (item.relatedInvoice === undefined || typeof item.relatedInvoice === "string") &&
    (item.kind === "quotation" || item.kind === "invoice" || item.kind === "receipt");
}

const legacyDemoDocumentIds = new Set([
  "q-1048", "q-1047", "q-1046", "q-1045", "q-1044",
  "i-2034", "i-2033", "i-2032", "i-2031",
  "r-809", "r-808",
]);

export function getStoredDocuments(kind: DocumentKind): BusinessDocument[] {
  const storageKey = `ranzomtech-${kind}s`;
  const value = window.localStorage.getItem(storageKey);
  if (!value) return businessDocuments.filter((document) => document.kind === kind);
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isBusinessDocument)) {
    throw new Error(`Saved ${kind} records could not be loaded.`);
  }
  if (parsed.length === 0) return [];
  const userDocuments = parsed.filter((document) => document.kind === kind && !legacyDemoDocumentIds.has(document.id));
  return userDocuments.length
    ? userDocuments
    : businessDocuments.filter((document) => document.kind === kind);
}

export function saveStoredDocuments(kind: DocumentKind, documents: BusinessDocument[]) {
  window.localStorage.setItem(`ranzomtech-${kind}s`, JSON.stringify(documents));
}
