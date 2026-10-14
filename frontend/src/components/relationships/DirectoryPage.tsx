"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { clientRecords, contactRecords, type ContactRecord } from "@/data/operations-data";
import { formatCurrency } from "@/lib/currency";

const CLIENTS_KEY = "ranzomtech-clients";

function readClients() {
  const value = window.localStorage.getItem(CLIENTS_KEY);
  if (value === null) return clientRecords;
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "object" || item === null || !("name" in item) || !("contact" in item))) {
    throw new Error("Saved clients could not be loaded.");
  }
  return parsed as typeof clientRecords;
}

export function ContactsPage() {
  const [contacts, setContacts] = useState(contactRecords);
  const [query, setQuery] = useState("");
  const [relationship, setRelationship] = useState("All relationships");
  const [selected, setSelected] = useState<ContactRecord | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingContact, setDeletingContact] = useState<ContactRecord | null>(null);
  useEffect(() => {
    Promise.resolve().then(() => {
      const value = window.localStorage.getItem("ranzomtech-contacts");
      if (!value) return;
      try {
        const parsed: unknown = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "object" || item === null || !("name" in item) || !("email" in item))) {
          throw new Error("Saved contacts could not be loaded.");
        }
        if (parsed.length === 0) {
          setContacts([]);
          return;
        }
        const userContacts = (parsed as ContactRecord[]).filter((item) =>
          item.id > 7 ||
          (item.id === contactRecords[0].id && item.email === contactRecords[0].email),
        );
        setContacts(userContacts);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Saved contacts could not be loaded.");
      }
    });
  }, []);
  const filtered = useMemo(() => contacts.filter((contact) => {
    const search = query.trim().toLowerCase();
    return (!search || `${contact.name} ${contact.company} ${contact.email} ${contact.position}`.toLowerCase().includes(search)) &&
      (relationship === "All relationships" || contact.relationship === relationship);
  }), [contacts, query, relationship]);
  const businessContacts = contacts.filter((contact) => contact.id !== contactRecords[0].id);

  function createContact(contact: ContactRecord) {
    const next = [contact, ...contacts];
    try {
      window.localStorage.setItem("ranzomtech-contacts", JSON.stringify(next));
      setContacts(next);
      setSelected(null);
      setNotice(`${contact.name} was added to your contacts.`);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Contact could not be saved.");
    }
  }

  function deleteContact(contact: ContactRecord) {
    const next = contacts.filter((item) => item.id !== contact.id);
    window.localStorage.setItem("ranzomtech-contacts", JSON.stringify(next));
    setContacts(next);
    setSelected(null);
    setNotice("Record deleted successfully.");
    setError("");
  }

  return (
    <div className="records-page directory-page">
      <header className="records-page-header"><div><div className="records-breadcrumb">Relationships <span>/</span> Directory</div><h1>Contacts</h1><p>People behind your active opportunities and client relationships.</p></div><button className="button-primary" onClick={() => setSelected({ id: 0, name: "", initials: "", company: "", email: "", phone: "", position: "", relationship: "Lead", owner: "Workspace admin", lastActivity: "New contact", color: "blue" })} type="button"><Icon name="plus" size={16} />Add contact</button></header>
      <div className="directory-stat-row"><span><strong>{businessContacts.length}</strong> people in your network{contacts.length !== businessContacts.length && <small> · sample preview shown</small>}</span><span>{businessContacts.filter((item) => item.relationship === "Client").length} clients <i /> {businessContacts.filter((item) => item.relationship === "Lead").length} leads</span></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {notice && <div className="inline-success" role="status"><Icon name="check" size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")} type="button">×</button></div>}
      <section className="records-surface">
        <div className="records-toolbar"><label className="records-search"><Icon name="search" size={16} /><input aria-label="Search contacts" onChange={(event) => setQuery(event.target.value)} placeholder="Search people, companies, emails..." value={query} /></label><div className="records-filters"><label className="filter-select"><Icon name="filter" size={14} /><select aria-label="Filter relationship" onChange={(event) => setRelationship(event.target.value)} value={relationship}><option>All relationships</option><option>Lead</option><option>Client</option></select></label></div></div>
        <div className="crm-table-wrap"><table className="crm-table directory-table"><thead><tr><th>Contact</th><th>Company</th><th>Position</th><th>Email & phone</th><th>Relationship</th><th>Owner</th><th>Last activity</th><th>Actions</th></tr></thead><tbody>{filtered.map((contact) => <tr key={contact.id} onClick={() => setSelected(contact)}><td><span className="table-lead-name"><span className={`lead-avatar avatar-${contact.color}`}>{contact.initials}</span><span><strong>{contact.name}</strong><small>Contact #{contact.id.toString().padStart(4, "0")}</small></span></span></td><td><span className="table-primary">{contact.company}</span></td><td>{contact.position}</td><td><a className="contact-link" href={`mailto:${contact.email}`} onClick={(event) => event.stopPropagation()}><Icon name="mail" size={13} />{contact.email}</a><a className="contact-link" href={`tel:${contact.phone}`} onClick={(event) => event.stopPropagation()}>{contact.phone}</a></td><td><span className={`document-status ${contact.relationship === "Client" ? "status-accepted" : "status-sent"}`}>{contact.relationship}</span></td><td>{contact.owner}</td><td>{contact.lastActivity}</td><td><span className="record-row-actions"><button aria-label={`View ${contact.name}`} className="table-open" onClick={(event) => { event.stopPropagation(); setSelected(contact); }} type="button"><Icon name="arrowUpRight" size={15} /></button><button aria-label={`Delete contact: ${contact.name}`} className="record-delete-action" onClick={(event) => { event.stopPropagation(); setDeletingContact(contact); }} title="Delete contact" type="button"><Icon name="trash" size={15} /></button></span></td></tr>)}</tbody></table></div>
        <div className="directory-mobile-list">{filtered.map((contact) => <button className="directory-mobile-row" key={contact.id} onClick={() => setSelected(contact)} type="button"><span className={`lead-avatar avatar-${contact.color}`}>{contact.initials}</span><span><strong>{contact.name}</strong><small>{contact.position} · {contact.company}</small><small>{contact.email}</small></span><Icon name="arrowUpRight" size={15} /></button>)}</div>
        {!filtered.length && <div className="leads-empty-state"><h2>{contacts.length ? "No contacts found" : "No contacts yet"}</h2><p>{contacts.length ? "Try another name, company, or relationship filter." : "Add your first contact to keep important business relationships organized."}</p>{!contacts.length && <button className="button-primary" onClick={() => setSelected({ id: 0, name: "", initials: "", company: "", email: "", phone: "", position: "", relationship: "Lead", owner: "Workspace admin", lastActivity: "New contact", color: "blue" })} type="button"><Icon name="plus" size={16} />Add contact</button>}</div>}
      </section>
      {selected && <Modal description={selected.id ? `${selected.position} · ${selected.company}` : "Add a person to your business network."} onClose={() => setSelected(null)} title={selected.id ? selected.name : "Add contact"}>
        {selected.id ? <div className="contact-profile-modal"><div className="contact-profile-actions"><a className="button-secondary" href={`mailto:${selected.email}`}><Icon name="mail" size={15} />Email contact</a><a className="button-secondary" href={`tel:${selected.phone}`}><Icon name="phone" size={15} />Call</a><button className="button-danger" onClick={() => { setDeletingContact(selected); setSelected(null); }} type="button"><Icon name="trash" size={15} />Delete</button></div><dl><div><dt>Company</dt><dd>{selected.company}</dd></div><div><dt>Email</dt><dd>{selected.email}</dd></div><div><dt>Phone</dt><dd>{selected.phone}</dd></div><div><dt>Relationship</dt><dd>{selected.relationship}</dd></div><div><dt>Account owner</dt><dd>{selected.owner}</dd></div><div><dt>Last activity</dt><dd>{selected.lastActivity}</dd></div></dl></div> : <ContactCreateForm onCancel={() => setSelected(null)} onCreate={createContact} />}</Modal>}
      {deletingContact && <DeleteConfirmation onClose={() => setDeletingContact(null)} onDelete={() => deleteContact(deletingContact)} />}
    </div>
  );
}

function ContactCreateForm({ onCancel, onCreate }: { onCancel: () => void; onCreate: (contact: ContactRecord) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    onCreate({
      id: Date.now(),
      name,
      initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join(""),
      company: String(data.get("company")).trim() || "Independent",
      email: String(data.get("email")).trim(),
      phone: String(data.get("phone")).trim() || "Not provided",
      position: String(data.get("position")).trim() || "Contact",
      relationship: String(data.get("relationship")) === "Client" ? "Client" : "Lead",
      owner: String(data.get("owner")),
      lastActivity: "Contact created · Just now",
      color: "blue",
    });
  }
  return <form className="lead-form" onSubmit={submit}>
    <div className="lead-form-grid">
      <label className="form-field"><span>Full name *</span><input autoFocus name="name" required placeholder="e.g. Taylor Morgan" /></label>
      <label className="form-field"><span>Company</span><input name="company" placeholder="Company name" /></label>
      <label className="form-field"><span>Email *</span><input name="email" required type="email" placeholder="name@company.com" /></label>
      <label className="form-field"><span>Phone</span><input name="phone" type="tel" placeholder="+1 (555) 000-0000" /></label>
      <label className="form-field"><span>Position</span><input name="position" placeholder="Job title" /></label>
      <label className="form-field"><span>Relationship</span><select name="relationship"><option>Lead</option><option>Client</option></select></label>
      <label className="form-field form-field-full"><span>Account owner</span><select name="owner"><option>Workspace admin</option></select></label>
    </div>
    <div className="modal-actions"><button className="button-secondary" onClick={onCancel} type="button">Cancel</button><button className="button-primary" type="submit"><Icon name="check" size={15} />Save contact</button></div>
  </form>;
}

export function ClientsPage() {
  const [clients, setClients] = useState(clientRecords);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingClient, setDeletingClient] = useState<(typeof clientRecords)[number] | null>(null);
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setClients(readClients());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Clients could not be loaded.");
      }
    });
  }, []);
  const filtered = clients.filter((client) =>
    (!query || `${client.name} ${client.contact} ${client.industry} ${client.owner}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (status === "All statuses" || client.status === status),
  );
  const totalRevenue = clients.reduce((sum, client) => sum + client.revenue, 0);
  const outstanding = clients.reduce((sum, client) => sum + client.outstanding, 0);
  function deleteClient(client: (typeof clientRecords)[number]) {
    const next = clients.filter((item) => item.id !== client.id);
    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(next));
    setClients(next);
    setNotice("Record deleted successfully.");
    setError("");
  }
  return (
    <div className="records-page directory-page">
      <header className="records-page-header"><div><div className="records-breadcrumb">Relationships <span>/</span> Accounts</div><h1>Clients</h1><p>Trusted customer relationships, services, and account health.</p></div><Link className="button-primary" href="/contacts"><Icon name="plus" size={16} />Add client</Link></header>
      {error && <div className="inline-error" role="alert">{error}</div>}{notice && <div className="inline-success" role="status"><Icon name="check" size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")} type="button">×</button></div>}
      <div className="document-metrics client-metrics"><div><span>Active clients</span><strong>{clients.filter((client) => client.status === "Active").length}</strong><small>Across your workspace</small></div><div><span>Lifetime revenue</span><strong>{formatCurrency(totalRevenue)}</strong><small>All client accounts</small></div><div><span>Outstanding</span><strong>{formatCurrency(outstanding)}</strong><small>Across open invoices</small></div></div>
      <section className="records-surface">
        <div className="records-toolbar"><label className="records-search"><Icon name="search" size={16} /><input aria-label="Search clients" onChange={(event) => setQuery(event.target.value)} placeholder="Search clients, contacts, industry..." value={query} /></label><div className="records-filters"><label className="filter-select"><Icon name="filter" size={14} /><select aria-label="Filter client status" onChange={(event) => setStatus(event.target.value)} value={status}><option>All statuses</option><option>Active</option><option>Onboarding</option><option>At risk</option></select></label></div></div>
        <div className="crm-table-wrap"><table className="crm-table client-table"><thead><tr><th>Client</th><th>Industry</th><th>Projects</th><th>Total revenue</th><th>Outstanding</th><th>Account owner</th><th>Last activity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((client) => <tr key={client.id}><td><Link className="client-table-link" href={`/clients/${client.id}`}><span className="company-detail-mark">{client.name.slice(0, 1)}</span><span><strong>{client.name}</strong><small>{client.contact}</small></span></Link></td><td>{client.industry}</td><td>{client.projects}</td><td className="table-value">{formatCurrency(client.revenue)}</td><td className="table-value">{formatCurrency(client.outstanding)}</td><td>{client.owner}</td><td>{client.lastActivity}</td><td><span className={`document-status ${client.status === "At risk" ? "status-overdue" : client.status === "Active" ? "status-accepted" : "status-sent"}`}>{client.status}</span></td><td><button aria-label={`Delete client: ${client.name}`} className="record-delete-action" onClick={() => setDeletingClient(client)} title="Delete client" type="button"><Icon name="trash" size={15} /></button></td></tr>)}</tbody></table></div>
        <div className="client-card-grid">{filtered.map((client) => <Link className="client-card" href={`/clients/${client.id}`} key={client.id}><div className="client-card-top"><span className="company-detail-mark">{client.name.slice(0, 1)}</span><span className={`document-status ${client.status === "At risk" ? "status-overdue" : client.status === "Active" ? "status-accepted" : "status-sent"}`}>{client.status}</span></div><strong>{client.name}</strong><span>{client.industry} · {client.contact}</span><div className="client-card-metrics"><span><small>Revenue</small><b>{formatCurrency(client.revenue)}</b></span><span><small>Projects</small><b>{client.projects}</b></span><span><small>Outstanding</small><b>{formatCurrency(client.outstanding)}</b></span></div><div className="client-services">{client.services.slice(0, 2).map((service) => <span key={service}>{service}</span>)}</div></Link>)}</div>
        {!filtered.length && <div className="leads-empty-state"><h2>{clients.length ? "No clients found" : "No clients yet"}</h2><p>{clients.length ? "Try adjusting your search or status filter." : "Client accounts will appear here when you add your first client."}</p>{!clients.length && <Link className="button-primary" href="/contacts"><Icon name="plus" size={15} />Add client</Link>}</div>}
      </section>
      {deletingClient && <DeleteConfirmation onClose={() => setDeletingClient(null)} onDelete={() => deleteClient(deletingClient)} />}
    </div>
  );
}

export function ClientDetailsPage({ id }: { id: string }) {
  const [client, setClient] = useState<(typeof clientRecords)[number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setClient(readClients().find((item) => item.id === Number(id)) ?? null);
      } catch (cause) {
        setLoadError(cause instanceof Error ? cause.message : "Client details could not be loaded.");
      } finally {
        setLoading(false);
      }
    });
  }, [id]);
  function deleteCurrentClient() {
    const next = readClients().filter((item) => item.id !== Number(id));
    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(next));
    setClient(null);
    setDeleted(true);
  }
  if (loading) return <div className="records-page"><p className="lead-loading-state">Loading client details...</p></div>;
  if (!client) return <div className="records-page">{deleted && <div className="inline-success" role="status"><Icon name="check" size={15} />Record deleted successfully.</div>}<div className="leads-empty-state"><h1>{deleted ? "Client deleted" : "Client not found"}</h1><p role={loadError ? "alert" : undefined}>{loadError || (deleted ? "This client is no longer in your workspace." : "This account may have been removed or the link is incorrect.")}</p><Link className="button-secondary" href="/clients">Back to clients</Link></div></div>;
  return <div className="records-page client-detail-page"><div className="detail-back-row"><Link className="subtle-link" href="/clients">← Back to clients</Link></div><header className="client-profile-header"><span className="company-detail-mark client-profile-mark">{client.name.slice(0, 1)}</span><div><div className="records-breadcrumb">Clients <span>/</span> Account</div><h1>{client.name}</h1><p>{client.industry} <span>·</span> Primary contact: {client.contact}</p></div><span className={`document-status ${client.status === "At risk" ? "status-overdue" : "status-accepted"}`}>{client.status}</span><button aria-label={`Delete client: ${client.name}`} className="button-danger" onClick={() => setDeleting(true)} type="button"><Icon name="trash" size={15} />Delete</button></header><div className="client-profile-stats"><div><span>Total revenue</span><strong>{formatCurrency(client.revenue)}</strong></div><div><span>Outstanding</span><strong>{formatCurrency(client.outstanding)}</strong></div><div><span>Active projects</span><strong>{client.projects}</strong></div><div><span>Account owner</span><strong>{client.owner}</strong></div></div>  <div className="client-profile-grid"><section className="records-surface detail-section"><div className="detail-section-heading"><div><h2>Services</h2><p>Current work and capabilities delivered</p></div></div><div className="client-service-list">{client.services.length ? client.services.map((service) => <div key={service}><span className="plan-icon"><Icon name="check" size={15} /></span><strong>{service}</strong><span>Active</span></div>) : <div className="detail-empty-state"><p>No active services have been recorded for this client.</p></div>}</div></section><section className="records-surface detail-section"><div className="detail-section-heading"><div><h2>Account contact</h2><p>Primary relationship information</p></div></div><div className="contact-detail-list"><a href={`mailto:${client.email}`}><span className="contact-detail-icon"><Icon name="mail" size={15} /></span><span><small>{client.contact}</small><strong>{client.email}</strong></span></a><a href={`tel:${client.phone}`}><span className="contact-detail-icon"><Icon name="phone" size={15} /></span><span><small>Phone</small><strong>{client.phone}</strong></span></a></div><div className="client-last-activity"><small>Last interaction</small><strong>{client.lastActivity}</strong></div></section></div>{deleting && <DeleteConfirmation onClose={() => setDeleting(false)} onDelete={deleteCurrentClient} />}</div>;
}
