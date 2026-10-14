"use client";

import { useEffect, useState, type FormEvent } from "react";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { followUpRecords } from "@/data/operations-data";

type FollowUp = (typeof followUpRecords)[number];
const KEY = "ranzomtech-follow-ups";
const buckets = ["Overdue", "Today", "Upcoming", "Completed"];

function loadFollowUps(): FollowUp[] {
  const value = window.localStorage.getItem(KEY);
  if (!value) return followUpRecords;
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "object" || item === null || !("task" in item) || !("bucket" in item))) {
    throw new Error("Saved follow-ups could not be loaded.");
  }
  if (parsed.length === 0) return [];
  return (parsed as FollowUp[]).filter((item) => item.id > 6 || item.task === followUpRecords[0].task);
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>(followUpRecords);
  const [bucketFilter, setBucketFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingFollowUp, setDeletingFollowUp] = useState<FollowUp | null>(null);

  useEffect(() => { Promise.resolve().then(() => { try { setItems(loadFollowUps()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Follow-ups could not be loaded."); } }); }, []);
  const businessItems = items.filter((item) => item.id !== followUpRecords[0].id);

  function persist(next: FollowUp[], message: string) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setItems(next);
      setNotice(message);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Follow-up changes could not be saved.");
    }
  }

  function complete(item: FollowUp) {
    persist(items.map((entry) => entry.id === item.id ? { ...entry, bucket: "Completed", due: `Completed · ${entry.due}` } : entry), `${item.task} marked complete.`);
  }

  function create(item: FollowUp) {
    const next = [item, ...items];
    persist(next, "Follow-up added to today.");
    setCreateOpen(false);
  }

  function deleteFollowUp(item: FollowUp) {
    const next = items.filter((entry) => entry.id !== item.id);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
    setNotice("Record deleted successfully.");
    setError("");
  }

  return (
    <div className="records-page work-page">
      <header className="records-page-header"><div><div className="records-breadcrumb">Relationships <span>/</span> Activity</div><h1>Follow-ups</h1><p>Stay intentional with every customer conversation.</p></div><button className="button-primary" onClick={() => setCreateOpen(true)} type="button"><Icon name="plus" size={16} />New follow-up</button></header>
      <div className="work-overview-strip">{buckets.map((bucket) => <button aria-pressed={bucketFilter === bucket} className={bucketFilter === bucket ? "selected" : ""} key={bucket} onClick={() => setBucketFilter(bucketFilter === bucket ? "All" : bucket)} type="button"><span>{bucket}</span><strong>{businessItems.filter((item) => item.bucket === bucket).length}</strong></button>)}</div>
      <div className="work-toolbar"><span><strong>{businessItems.filter((item) => (ownerFilter === "All" || item.owner === ownerFilter) && (bucketFilter === "All" || item.bucket === bucketFilter)).length}</strong> follow-ups{items.some((item) => item.id === followUpRecords[0].id) && <small> · sample preview shown</small>}</span><label className="filter-select"><Icon name="filter" size={14} /><select aria-label="Filter by assignee" onChange={(event) => setOwnerFilter(event.target.value)} value={ownerFilter}><option value="All">Everyone</option>{[...new Set(items.map((item) => item.owner))].map((owner) => <option key={owner}>{owner}</option>)}</select></label></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {notice && <div className="inline-success" role="status"><Icon name="check" size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")} type="button">×</button></div>}
      <div className="followup-workspace">{buckets.filter((bucket) => bucketFilter === "All" || bucketFilter === bucket).map((bucket) => {
        const records = items.filter((item) => item.bucket === bucket && (ownerFilter === "All" || item.owner === ownerFilter));
        const recordCount = records.filter((item) => item.id !== followUpRecords[0].id).length;
        return <section className="work-group" key={bucket}><header className={`work-group-header work-group-${bucket.toLowerCase()}`}><div><span className="work-group-dot" /><h2>{bucket}</h2><span className="pipeline-column-count">{recordCount}</span></div>{bucket !== "Completed" && <span>{bucket === "Today" ? "Due today" : bucket === "Overdue" ? "Needs attention" : "Coming up"}</span>}</header>{records.length ? records.map((item) => <article className={`followup-record${bucket === "Completed" ? " is-completed" : ""}`} key={item.id}><span className="followup-date-icon"><Icon name="calendar" size={16} /></span><div className="followup-record-main"><strong>{item.task}</strong><span><b>{item.person}</b> · {item.company}</span><small>{item.due}</small></div><span className={`priority-badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span><span className="followup-owner">{item.owner}</span>{bucket !== "Completed" && <button aria-label={`Complete follow-up: ${item.task}`} className="complete-work-button" onClick={() => complete(item)} title="Mark complete" type="button"><Icon name="check" size={15} /></button>}<button aria-label={`Delete follow-up: ${item.task}`} className="record-delete-action" onClick={() => setDeletingFollowUp(item)} title="Delete follow-up" type="button"><Icon name="trash" size={16} /></button></article>) : <div className="work-group-empty">{bucket === "Completed" ? "Completed follow-ups will appear here." : `No ${bucket.toLowerCase()} follow-ups.`}</div>}</section>;
      })}</div>
      {createOpen && <Modal description="Keep a conversation moving with a clear next step." onClose={() => setCreateOpen(false)} title="Create follow-up"><FollowUpForm onCancel={() => setCreateOpen(false)} onCreate={create} /></Modal>}
      {deletingFollowUp && <DeleteConfirmation onClose={() => setDeletingFollowUp(null)} onDelete={() => deleteFollowUp(deletingFollowUp)} />}
    </div>
  );
}

function FollowUpForm({ onCancel, onCreate }: { onCancel: () => void; onCreate: (item: FollowUp) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onCreate({ id: Date.now(), person: String(data.get("person")), company: String(data.get("company")), task: String(data.get("task")), due: `${String(data.get("date"))} · ${String(data.get("time"))}`, bucket: "Today", owner: String(data.get("owner")), priority: String(data.get("priority")), related: "Lead" });
  }
  return <form className="lead-form" onSubmit={submit}><div className="lead-form-grid"><label className="form-field form-field-full"><span>Follow-up task *</span><input autoFocus name="task" placeholder="e.g. Confirm proposal details" required /></label><label className="form-field"><span>Contact *</span><input name="person" placeholder="Contact name" required /></label><label className="form-field"><span>Company</span><input name="company" placeholder="Company name" /></label><label className="form-field"><span>Due date</span><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label><label className="form-field"><span>Time</span><input name="time" type="time" defaultValue="14:00" /></label><label className="form-field"><span>Assigned to</span><select name="owner"><option>Workspace admin</option></select></label><label className="form-field"><span>Priority</span><select name="priority"><option>Normal</option><option>High</option><option>Low</option></select></label></div><div className="modal-actions"><button className="button-secondary" onClick={onCancel} type="button">Cancel</button><button className="button-primary" type="submit"><Icon name="check" size={15} />Create follow-up</button></div></form>;
}
