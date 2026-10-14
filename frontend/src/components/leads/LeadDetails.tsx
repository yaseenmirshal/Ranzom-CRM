"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { crmLeadSamples, type CRMLead } from "@/data/mock-data";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { readLeads, saveLeads } from "@/lib/lead-storage";
import { formatCurrency } from "@/lib/currency";

export default function LeadDetails({ id }: { id: string }) {
  const seedLead = crmLeadSamples.find((lead) => lead.id === Number(id)) ?? null;
  const [lead, setLead] = useState<CRMLead | null>(seedLead);
  const [isLoading, setIsLoading] = useState(!seedLead);
  const [loadError, setLoadError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const storedLead = readLeads().find((item) => item.id === Number(id));
        setLead(storedLead ?? null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Lead details could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    });
  }, [id]);

  function deleteLead() {
    saveLeads(readLeads().filter((item) => item.id !== Number(id)));
    setLead(null);
    setDeleted(true);
  }

  if (isLoading) {
    return (
      <div aria-live="polite" className="records-page">
        <p className="lead-loading-state">Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="records-page">
        {deleted && <div className="inline-success" role="status"><Icon name="check" size={15} />Record deleted successfully.</div>}
        <div className="leads-empty-state detail-not-found">
          <span className="empty-state-icon"><Icon name="leads" size={22} /></span>
          <h1>Lead not found</h1>
          <p role={loadError || deleted ? "status" : undefined}>
            {loadError || "This lead may have been removed or the link may be incorrect."}
          </p>
          <Link className="button-primary" href="/leads">Back to leads</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="records-page lead-detail-page">
      <div className="detail-back-row">
        <Link className="subtle-link" href="/leads"><span aria-hidden="true">←</span> Back to leads</Link>
      </div>
      {loadError && <div className="inline-error" role="alert">{loadError}</div>}
      <header className="lead-detail-header">
        <div className="lead-detail-identity">
          <span className={`lead-avatar lead-detail-avatar avatar-${lead.color}`}>{lead.initials}</span>
          <div>
            <div className="records-breadcrumb">Leads <span>/</span> {lead.company}</div>
            <h1>{lead.name}</h1>
            <p>{lead.company} <span>·</span> {lead.companyType}</p>
          </div>
        </div>
        <div className="lead-detail-actions">
          <span className={`stage-badge stage-${lead.stage.toLowerCase()}`}>{lead.stage}</span>
          <Link className="button-secondary" href="/follow-ups"><Icon name="calendar" size={15} /> Add follow-up</Link>
          <button className="button-danger" onClick={() => setDeleting(true)} type="button"><Icon name="trash" size={15} />Delete</button>
        </div>
      </header>

      <div className="lead-detail-grid">
        <div className="lead-detail-main">
          <section className="records-surface detail-section">
            <div className="detail-section-heading">
              <div><h2>Lead overview</h2><p>Contact and opportunity details</p></div>
              <span className="detail-record-id">LEAD-{lead.id}</span>
            </div>
            <div className="detail-fields-grid">
              <div className="detail-field"><span>Estimated value</span><strong className="detail-value">{formatCurrency(lead.value)}</strong></div>
              <div className="detail-field"><span>Lead source</span><strong>{lead.source}</strong></div>
              <div className="detail-field"><span>Assigned to</span><strong className="detail-owner"><span className={`owner-avatar avatar-${lead.color}`}>{lead.ownerInitials}</span>{lead.owner}</strong></div>
              <div className="detail-field"><span>Created</span><strong>{lead.createdAt}</strong></div>
            </div>
          </section>

          <section className="records-surface detail-section">
            <div className="detail-section-heading">
              <div><h2>Notes</h2><p>Context shared with your team</p></div>
              <button aria-label="Edit notes" className="icon-button" type="button"><Icon name="edit" size={15} /></button>
            </div>
            <p className="lead-notes">{lead.notes || "No notes have been added for this lead yet."}</p>
          </section>

          <section className="records-surface detail-section">
            <div className="detail-section-heading"><div><h2>Timeline</h2><p>Recent conversations and updates</p></div></div>
            <div className="detail-empty-state"><p>No activity recorded yet. Conversations and updates will appear here.</p></div>
          </section>
        </div>

        <aside className="lead-detail-aside">
          <section className="records-surface detail-section">
            <div className="detail-section-heading"><div><h2>Contact information</h2></div></div>
            <div className="contact-detail-list">
              <a href={`mailto:${lead.email}`}><span className="contact-detail-icon"><Icon name="mail" size={15} /></span><span><small>Email</small><strong>{lead.email || "Not provided"}</strong></span></a>
              <a href={`tel:${lead.phone}`}><span className="contact-detail-icon"><Icon name="phone" size={15} /></span><span><small>Phone</small><strong>{lead.phone || "Not provided"}</strong></span></a>
            </div>
          </section>

          <section className="records-surface detail-section">
            <div className="detail-section-heading"><div><h2>Company information</h2></div></div>
            <div className="company-detail-mark">{lead.company.slice(0, 1).toUpperCase()}</div>
            <div className="company-detail-name">{lead.company}</div>
            <div className="company-detail-type">{lead.companyType}</div>
          </section>

          <section className="records-surface detail-section">
            <div className="detail-section-heading">
              <div><h2>Next follow-up</h2><p>Keep the conversation moving</p></div>
            </div>
            <div className="next-follow-up">
              <span className="contact-detail-icon"><Icon name="calendar" size={15} /></span>
              <span><strong>No follow-up scheduled</strong><small>Plan a next step when you are ready.</small></span>
            </div>
            <Link className="detail-follow-up-link" href="/follow-ups">View follow-ups <Icon name="arrowUpRight" size={13} /></Link>
          </section>
        </aside>
      </div>
      {deleting && <DeleteConfirmation onClose={() => setDeleting(false)} onDelete={deleteLead} />}
    </div>
  );
}
