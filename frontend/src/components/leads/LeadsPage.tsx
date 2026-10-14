"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { crmLeadSamples, type CRMLead, type LeadSource, type LeadStage } from "@/data/mock-data";
import { readLeads, saveLeads } from "@/lib/lead-storage";
import { formatCurrency } from "@/lib/currency";

const PAGE_SIZE = 6;
const LEAD_SOURCES: LeadSource[] = [
  "Website",
  "WhatsApp",
  "Referral",
  "Instagram",
  "Other",
];
const LEAD_STAGES: LeadStage[] = [
  "New",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];
const OWNERS = [...new Set(crmLeadSamples.map((lead) => lead.owner))];

function stageClass(stage: LeadStage) {
  return `stage-badge stage-${stage.toLowerCase()}`;
}

function leadInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function LeadAvatar({ lead }: { lead: CRMLead }) {
  return (
    <span className={`lead-avatar avatar-${lead.color}`} aria-hidden="true">
      {lead.initials}
    </span>
  );
}

function LeadForm({
  onCancel,
  onSubmit,
  error,
}: {
  onCancel: () => void;
  onSubmit: (lead: CRMLead) => void;
  error: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const company = String(form.get("company")).trim();
    const owner = String(form.get("owner"));
    const ownerLead = crmLeadSamples.find((lead) => lead.owner === owner);
    const value = Number(form.get("value"));
    const lead: CRMLead = {
      id: Date.now(),
      name,
      initials: leadInitials(name),
      company,
      companyType: String(form.get("companyType")).trim() || "Business",
      email: String(form.get("email")).trim(),
      phone: String(form.get("phone")).trim(),
      source: String(form.get("source")) as LeadSource,
      value: Number.isFinite(value) ? value : 0,
      stage: String(form.get("stage")) as LeadStage,
      owner,
      ownerInitials: leadInitials(owner),
      lastActivity: "Lead created · Just now",
      createdAt: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
      color: ownerLead?.color ?? "blue",
      notes: String(form.get("notes")).trim(),
    };
    onSubmit(lead);
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="lead-form-grid">
        <label className="form-field">
          <span>Contact name <b>*</b></span>
          <input autoFocus autoComplete="name" name="name" placeholder="e.g. Taylor Morgan" required />
        </label>
        <label className="form-field">
          <span>Company <b>*</b></span>
          <input autoComplete="organization" name="company" placeholder="Company or organization" required />
        </label>
        <label className="form-field">
          <span>Email address <b>*</b></span>
          <input autoComplete="email" name="email" placeholder="name@company.com" required type="email" />
        </label>
        <label className="form-field">
          <span>Phone</span>
          <input autoComplete="tel" name="phone" placeholder="+1 (555) 000-0000" type="tel" />
        </label>
        <label className="form-field">
          <span>Company type</span>
          <input name="companyType" placeholder="e.g. Professional services" />
        </label>
        <label className="form-field">
          <span>Lead source</span>
          <select defaultValue="Website" name="source">
            {LEAD_SOURCES.map((source) => <option key={source}>{source}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Estimated value</span>
          <div className="currency-input">
            <span>₹</span>
            <input min="0" name="value" placeholder="0" type="number" />
          </div>
        </label>
        <label className="form-field">
          <span>Sales stage</span>
          <select defaultValue="New" name="stage">
            {LEAD_STAGES.filter((stage) => stage !== "Won" && stage !== "Lost").map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </label>
        <label className="form-field form-field-full">
          <span>Assigned to</span>
          <select defaultValue={OWNERS[0]} name="owner">
            {OWNERS.map((owner) => <option key={owner}>{owner}</option>)}
          </select>
        </label>
        <label className="form-field form-field-full">
          <span>Notes</span>
          <textarea name="notes" placeholder="Add useful context for your team..." rows={3} />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <button className="button-secondary" onClick={onCancel} type="button">Cancel</button>
        <button className="button-primary" type="submit">
          <Icon name="plus" size={15} /> Create lead
        </button>
      </div>
    </form>
  );
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState(crmLeadSamples);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All stages");
  const [source, setSource] = useState("All sources");
  const [owner, setOwner] = useState("All owners");
  const [segment, setSegment] = useState("All leads");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingLead, setDeletingLead] = useState<CRMLead | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setLeads(readLeads());
      } catch (error) {
        setStorageError(
          error instanceof Error ? error.message : "Saved lead data could not be loaded.",
        );
      }
    });
  }, []);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          lead.name,
          lead.company,
          lead.email,
          lead.phone,
          lead.owner,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesStage = stage === "All stages" || lead.stage === stage;
      const matchesSource = source === "All sources" || lead.source === source;
      const matchesOwner = owner === "All owners" || lead.owner === owner;
      const matchesSegment =
        segment === "All leads" ||
        (segment === "Open" && lead.stage !== "Won" && lead.stage !== "Lost") ||
        lead.stage === segment;
      return matchesQuery && matchesStage && matchesSource && matchesOwner && matchesSegment;
    });
  }, [leads, owner, query, segment, source, stage]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const visibleLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const businessLeads = leads.filter((lead) => !lead.isDemo);
  const openLeads = businessLeads.filter((lead) => lead.stage !== "Won" && lead.stage !== "Lost").length;

  function changeFilter(change: () => void) {
    change();
    setPage(1);
  }

  function handleCreateLead(lead: CRMLead) {
    const nextLeads = [lead, ...leads];
    try {
      saveLeads(nextLeads);
      setLeads(nextLeads);
      setFormOpen(false);
      setFormError("");
      setStorageError("");
      setSuccessMessage(`${lead.name} was added to your leads.`);
      setPage(1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The lead could not be saved.");
    }
  }

  function deleteLead(lead: CRMLead) {
    const nextLeads = leads.filter((item) => item.id !== lead.id);
    saveLeads(nextLeads);
    setLeads(nextLeads);
    setDeletingLead(null);
    setSuccessMessage("Record deleted successfully.");
    setStorageError("");
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(nextLeads.length / PAGE_SIZE))));
  }

  return (
    <div className="records-page leads-page">
      <div className="records-page-header">
        <div>
          <div className="records-breadcrumb">Sales <span>/</span> Workspace</div>
          <h1>Leads</h1>
          <p>Build relationships from first conversation to signed deal.</p>
        </div>
        <button className="button-primary add-lead-button" onClick={() => setFormOpen(true)} type="button">
          <Icon name="plus" size={16} /> Add lead
        </button>
      </div>

      {storageError && <div className="inline-error" role="alert">{storageError}</div>}
      {successMessage && (
        <div className="inline-success" role="status">
          <Icon name="check" size={15} /> {successMessage}
          <button aria-label="Dismiss message" onClick={() => setSuccessMessage("")} type="button">×</button>
        </div>
      )}

      <div className="lead-overview-strip">
        <button
          aria-pressed={segment === "All leads"}
          className={`lead-segment${segment === "All leads" ? " selected" : ""}`}
          onClick={() => changeFilter(() => setSegment("All leads"))}
          type="button"
        >
          All leads <span>{businessLeads.length}</span>
        </button>
        <button
          aria-pressed={segment === "Open"}
          className={`lead-segment${segment === "Open" ? " selected" : ""}`}
          onClick={() => changeFilter(() => setSegment("Open"))}
          type="button"
        >
          Open <span>{openLeads}</span>
        </button>
        <button
          aria-pressed={segment === "Won"}
          className={`lead-segment${segment === "Won" ? " selected" : ""}`}
          onClick={() => changeFilter(() => setSegment("Won"))}
          type="button"
        >
          Won <span>{businessLeads.filter((lead) => lead.stage === "Won").length}</span>
        </button>
        <button
          aria-pressed={segment === "Lost"}
          className={`lead-segment${segment === "Lost" ? " selected" : ""}`}
          onClick={() => changeFilter(() => setSegment("Lost"))}
          type="button"
        >
          Lost <span>{businessLeads.filter((lead) => lead.stage === "Lost").length}</span>
        </button>
      </div>

      <section aria-label="Lead records" className="records-surface">
        <div className="records-toolbar">
          <label className="records-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Search leads"
              onChange={(event) => changeFilter(() => setQuery(event.target.value))}
              placeholder="Search leads, companies, email..."
              type="search"
              value={query}
            />
            <kbd>⌘ F</kbd>
          </label>
          <div className="records-filters">
            <label className="filter-select">
              <Icon name="filter" size={14} />
              <select
                aria-label="Filter by stage"
                onChange={(event) => changeFilter(() => setStage(event.target.value))}
                value={stage}
              >
                <option>All stages</option>
                {LEAD_STAGES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="filter-select">
              <select
                aria-label="Filter by source"
                onChange={(event) => changeFilter(() => setSource(event.target.value))}
                value={source}
              >
                <option>All sources</option>
                {LEAD_SOURCES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="filter-select owner-filter">
              <select
                aria-label="Filter by owner"
                onChange={(event) => changeFilter(() => setOwner(event.target.value))}
                value={owner}
              >
                <option>All owners</option>
                {OWNERS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="lead-list-meta">
          <span><strong>{filteredLeads.filter((lead) => !lead.isDemo).length}</strong> leads{filteredLeads.some((lead) => lead.isDemo) && <small> · sample record shown</small>}</span>
          <button
            className="clear-filters"
            onClick={() => {
              setQuery("");
              setStage("All stages");
              setSource("All sources");
              setOwner("All owners");
              setSegment("All leads");
              setPage(1);
            }}
            type="button"
          >
            Clear filters
          </button>
        </div>

        {visibleLeads.length ? (
          <div className="crm-table-wrap">
            <table className="crm-table leads-table">
              <thead>
                <tr>
                  <th scope="col">Lead</th>
                  <th scope="col">Company</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Source</th>
                  <th scope="col">Value</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Last activity</th>
                  <th scope="col">Created</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)}>
                    <td>
                      <span className="table-lead-name">
                        <LeadAvatar lead={lead} />
                        <span><strong>{lead.name}</strong><small>{lead.isDemo ? "Demo record" : `#${lead.id}`}</small></span>
                      </span>
                    </td>
                    <td>
                      <span className="table-primary">{lead.company}</span>
                      <small className="table-secondary">{lead.companyType}</small>
                    </td>
                    <td>
                      <a className="contact-link" href={`mailto:${lead.email}`} onClick={(event) => event.stopPropagation()}>
                        <Icon name="mail" size={13} /> {lead.email}
                      </a>
                      <a className="contact-link" href={`tel:${lead.phone}`} onClick={(event) => event.stopPropagation()}>
                        <Icon name="phone" size={12} /> {lead.phone}
                      </a>
                    </td>
                    <td><span className="table-source"><i className={`source-dot source-${lead.source.toLowerCase()}`} />{lead.source}</span></td>
                    <td className="table-value">{formatCurrency(lead.value)}</td>
                    <td><span className={stageClass(lead.stage)}>{lead.stage}</span></td>
                    <td>
                      <span className="table-owner">
                        <span className={`owner-avatar avatar-${lead.color}`}>{lead.ownerInitials}</span>
                        {lead.owner}
                      </span>
                    </td>
                    <td className="table-secondary">{lead.lastActivity}</td>
                    <td className="table-secondary">{lead.createdAt}</td>
                    <td><span className="record-row-actions"><Link aria-label={`View ${lead.name}`} className="table-open" href={`/leads/${lead.id}`} onClick={(event) => event.stopPropagation()}><Icon name="arrowUpRight" size={15} /></Link><button aria-label={`Delete lead: ${lead.name}`} className="record-delete-action" onClick={(event) => { event.stopPropagation(); setDeletingLead(lead); }} title="Delete lead" type="button"><Icon name="trash" size={15} /></button></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="lead-mobile-list">
              {visibleLeads.map((lead) => (
                <Link className="lead-mobile-row" href={`/leads/${lead.id}`} key={lead.id}>
                  <LeadAvatar lead={lead} />
                  <span className="lead-mobile-copy">
                    <strong>{lead.name}</strong>
                    <span>{lead.company}</span>
                    <span className="lead-mobile-meta">{lead.email} · {formatCurrency(lead.value)}</span>
                  </span>
                  <span className={stageClass(lead.stage)}>{lead.stage}</span>
                  <Icon name="arrowUpRight" size={15} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="leads-empty-state">
            <span className="empty-state-icon"><Icon name="leads" size={22} /></span>
            <h2>{leads.length ? "No leads match these filters" : "No leads yet"}</h2>
            <p>{leads.length ? "Try a different search or clear the filters to see your leads." : "Add your first lead to start building your pipeline."}</p>
            {leads.length ? (
              <button
                className="button-secondary"
                onClick={() => {
                  setQuery("");
                  setStage("All stages");
                  setSource("All sources");
                  setOwner("All owners");
                  setSegment("All leads");
                  setPage(1);
                }}
                type="button"
              >
                Clear filters
              </button>
            ) : (
              <button className="button-primary" onClick={() => setFormOpen(true)} type="button"><Icon name="plus" size={15} />Add lead</button>
            )}
          </div>
        )}

        <footer className="table-pagination">
          <span>
            Showing <strong>{filteredLeads.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredLeads.length)}</strong> of <strong>{filteredLeads.length}</strong> leads
          </span>
          <div>
            <button
              aria-label="Previous page"
              className="pagination-button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Previous
            </button>
            <span className="pagination-current">{page} / {totalPages}</span>
            <button
              aria-label="Next page"
              className="pagination-button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      {formOpen && (
        <Modal
          description="Capture the details your team needs to start a conversation."
          onClose={() => {
            setFormOpen(false);
            setFormError("");
          }}
          size="wide"
          title="Add a lead"
        >
          <LeadForm
            error={formError}
            onCancel={() => {
              setFormOpen(false);
              setFormError("");
            }}
            onSubmit={handleCreateLead}
          />
        </Modal>
      )}
      {deletingLead && <DeleteConfirmation onClose={() => setDeletingLead(null)} onDelete={() => deleteLead(deletingLead)} />}
    </div>
  );
}
