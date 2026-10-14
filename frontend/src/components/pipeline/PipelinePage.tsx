"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { crmLeadSamples, type CRMLead, type LeadStage } from "@/data/mock-data";
import { readLeads, saveLeads } from "@/lib/lead-storage";

const stages: LeadStage[] = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const stageTone: Record<LeadStage, string> = {
  New: "stage-new",
  Qualified: "stage-qualified",
  Proposal: "stage-proposal",
  Negotiation: "stage-negotiation",
  Won: "stage-won",
  Lost: "stage-lost",
};
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const followUpDates = ["Today, 10:30 AM", "Tomorrow, 9:00 AM", "Oct 17, 2:00 PM", "Oct 18, 11:00 AM", "Oct 19, 3:30 PM"];

function followUpFor(index: number) {
  return followUpDates[index % followUpDates.length];
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<CRMLead[]>(crmLeadSamples);
  const [query, setQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("Everyone");
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [sort, setSort] = useState("value-desc");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [storageError, setStorageError] = useState("");
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [deletingLead, setDeletingLead] = useState<CRMLead | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setLeads(readLeads());
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : "Pipeline data could not be loaded.");
      }
    });
  }, []);

  const activeLeads = useMemo(() => leads.filter((lead) => !lead.isDemo), [leads]);
  const owners = useMemo(() => ["Everyone", ...new Set(activeLeads.map((lead) => lead.owner))], [activeLeads]);
  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase();
    const result = activeLeads.filter((lead) =>
      (!search || `${lead.name} ${lead.company} ${lead.owner} ${lead.source}`.toLowerCase().includes(search)) &&
      (ownerFilter === "Everyone" || lead.owner === ownerFilter) &&
      (sourceFilter === "All sources" || lead.source === sourceFilter),
    );
    return result.toSorted((a, b) => {
      if (sort === "value-asc") return a.value - b.value;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.value - a.value;
    });
  }, [activeLeads, ownerFilter, query, sort, sourceFilter]);
  const openLeads = activeLeads.filter((lead) => lead.stage !== "Won" && lead.stage !== "Lost");
  const pipelineTotal = openLeads.reduce((sum, lead) => sum + lead.value, 0);

  function moveLead(id: number, stage: LeadStage) {
    const updated = leads.map((lead) => lead.id === id ? { ...lead, stage, lastActivity: `Moved to ${stage} · Just now` } : lead);
    try {
      saveLeads(updated);
      setLeads(updated);
      setStorageError("");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "The stage change could not be saved.");
    }
  }

  function deleteLead(lead: CRMLead) {
    const updated = leads.filter((item) => item.id !== lead.id);
    saveLeads(updated);
    setLeads(updated);
    setNotice("Record deleted successfully.");
    setStorageError("");
  }

  return (
    <div className="records-page pipeline-page">
      <header className="records-page-header">
        <div>
          <div className="records-breadcrumb">Sales <span>/</span> Opportunities</div>
          <h1>Sales pipeline</h1>
          <p>See every opportunity in motion and what needs attention next.</p>
        </div>
        <Link className="button-primary" href="/leads"><Icon name="plus" size={16} /> Add opportunity</Link>
      </header>

      <section aria-label="Pipeline overview" className="pipeline-summary-strip">
        <div><span>Open pipeline</span><strong>{formatter.format(pipelineTotal)}</strong></div>
        <div><span>Active opportunities</span><strong>{openLeads.length}</strong></div>
        <div><span>Average deal size</span><strong>{formatter.format(openLeads.length ? Math.round(pipelineTotal / openLeads.length) : 0)}</strong></div>
        <div className="pipeline-summary-note"><span className="pipeline-live-dot" /> Updated just now</div>
      </section>

      {storageError && <div className="inline-error" role="alert">{storageError}</div>}
      {notice && <div className="inline-success" role="status"><Icon name="check" size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")} type="button">×</button></div>}

      <div className="pipeline-toolbar">
        <label className="records-search">
          <Icon name="search" size={16} />
          <input aria-label="Search pipeline" onChange={(event) => setQuery(event.target.value)} placeholder="Search opportunities..." value={query} />
        </label>
        <div className="pipeline-toolbar-controls">
          <label className="filter-select">
            <Icon name="filter" size={14} />
            <select aria-label="Filter by owner" onChange={(event) => setOwnerFilter(event.target.value)} value={ownerFilter}>
              {owners.map((owner) => <option key={owner}>{owner}</option>)}
            </select>
          </label>
          <label className="filter-select">
            <select aria-label="Filter by source" onChange={(event) => setSourceFilter(event.target.value)} value={sourceFilter}>
              <option>All sources</option>
              {["Website", "WhatsApp", "Referral", "Instagram", "Other"].map((source) => <option key={source}>{source}</option>)}
            </select>
          </label>
          <label className="pipeline-sort">
            <span>Sort</span>
            <select aria-label="Sort opportunities" onChange={(event) => setSort(event.target.value)} value={sort}>
              <option value="value-desc">Highest value</option>
              <option value="value-asc">Lowest value</option>
              <option value="name">Name</option>
            </select>
          </label>
          <div aria-label="Pipeline view" className="view-switch" role="group">
            <button aria-pressed={view === "kanban"} className={view === "kanban" ? "selected" : ""} onClick={() => setView("kanban")} type="button"><Icon name="pipeline" size={15} /> Board</button>
            <button aria-pressed={view === "list"} className={view === "list" ? "selected" : ""} onClick={() => setView("list")} type="button"><Icon name="dashboard" size={15} /> List</button>
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="pipeline-board" aria-label="Sales pipeline stages">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((lead) => lead.stage === stage);
            const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);
            return (
              <section
                aria-label={`${stage}, ${stageLeads.length} opportunities`}
                className={`pipeline-column pipeline-column-${stage.toLowerCase()}`}
                key={stage}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const id = Number(event.dataTransfer.getData("text/plain")) || draggedLeadId;
                  if (id !== null) moveLead(id, stage);
                  setDraggedLeadId(null);
                }}
              >
                <div className="pipeline-column-heading">
                  <div><span className={`pipeline-stage-marker marker-${stage === "Won" ? "green" : stage === "Lost" ? "slate" : stage === "Proposal" ? "violet" : stage === "Negotiation" ? "amber" : stage === "Qualified" ? "blue" : "slate"}`} /><h2>{stage}</h2><span className="pipeline-column-count">{stageLeads.length}</span></div>
                  <strong>{formatter.format(stageValue)}</strong>
                </div>
                <div className="pipeline-column-cards">
                  {stageLeads.length ? stageLeads.map((lead) => {
                    const leadIndex = leads.findIndex((item) => item.id === lead.id);
                    return (
                      <article
                        className="opportunity-card"
                        draggable
                        key={lead.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", String(lead.id));
                          setDraggedLeadId(lead.id);
                        }}
                        onDragEnd={() => setDraggedLeadId(null)}
                      >
                        <div className="opportunity-card-top">
                          <Link href={`/leads/${lead.id}`} className="opportunity-name">{lead.name}</Link>
                          <span className="opportunity-card-actions"><button aria-label={`Delete lead: ${lead.name}`} className="record-delete-action" onClick={(event) => { event.stopPropagation(); setDeletingLead(lead); }} title="Delete lead" type="button"><Icon name="trash" size={15} /></button><span className="opportunity-drag" aria-label="Drag to move stage">⠿</span></span>
                        </div>
                        <div className="opportunity-company">{lead.company}</div>
                        <div className="opportunity-value">{formatter.format(lead.value)}</div>
                        <div className="opportunity-meta">
                          <span className="table-source"><i className={`source-dot source-${lead.source.toLowerCase()}`} />{lead.source}</span>
                          <span className={`owner-avatar avatar-${lead.color}`} title={lead.owner}>{lead.ownerInitials}</span>
                        </div>
                        <div className="opportunity-follow-up"><Icon name="calendar" size={13} /><span>{followUpFor(leadIndex)}</span></div>
                        <div className="opportunity-card-footer">
                          <span className={`stage-badge ${stageTone[lead.stage]}`}>{lead.stage}</span>
                          <span>{lead.lastActivity.replace(" · ", " · ")}</span>
                        </div>
                        <label className="sr-only" htmlFor={`move-${lead.id}`}>Move {lead.name} to stage</label>
                        <select id={`move-${lead.id}`} className="opportunity-stage-select" onChange={(event) => moveLead(lead.id, event.target.value as LeadStage)} value={lead.stage}>
                          {stages.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </article>
                    );
                  }                  ) : <div className="pipeline-column-empty">{filteredLeads.length ? "Drop an opportunity here" : "Add an opportunity to start your pipeline."}</div>}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section aria-label="Pipeline opportunities" className="records-surface pipeline-list-surface">
          <div className="crm-table-wrap">
            <table className="crm-table pipeline-list-table">
              <thead><tr><th>Opportunity</th><th>Stage</th><th>Value</th><th>Source</th><th>Owner</th><th>Last activity</th><th>Next follow-up</th><th>Move stage</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td><Link className="pipeline-list-lead" href={`/leads/${lead.id}`}><span className={`lead-avatar avatar-${lead.color}`}>{lead.initials}</span><span><strong>{lead.name}</strong><small>{lead.company}</small></span></Link></td>
                    <td><span className={`stage-badge ${stageTone[lead.stage]}`}>{lead.stage}</span></td>
                    <td className="table-value">{formatter.format(lead.value)}</td>
                    <td>{lead.source}</td>
                    <td>{lead.owner}</td>
                    <td>{lead.lastActivity}</td>
                    <td>{followUpFor(leads.findIndex((item) => item.id === lead.id))}</td>
                    <td><select aria-label={`Move ${lead.name} to stage`} className="pipeline-list-select" onChange={(event) => moveLead(lead.id, event.target.value as LeadStage)} value={lead.stage}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></td>
                    <td><button aria-label={`Delete lead: ${lead.name}`} className="record-delete-action" onClick={() => setDeletingLead(lead)} title="Delete lead" type="button"><Icon name="trash" size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredLeads.length && <div className="leads-empty-state"><h2>{activeLeads.length ? "No opportunities found" : "No opportunities yet"}</h2><p>{activeLeads.length ? "Adjust your filters or add a new opportunity." : "Add your first lead to start building the pipeline."}</p><Link className="button-primary" href="/leads"><Icon name="plus" size={15} />Add opportunity</Link></div>}
        </section>
      )}
      {deletingLead && <DeleteConfirmation onClose={() => setDeletingLead(null)} onDelete={() => deleteLead(deletingLead)} />}
    </div>
  );
}
