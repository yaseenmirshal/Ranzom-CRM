"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";

const settingsSections = [
  { title: "General", description: "Workspace preferences, language, and regional defaults.", href: "/settings/general", icon: "settings" as const },
  { title: "Company", description: "Business profile and contact information.", href: "/settings/company", icon: "clients" as const },
  { title: "Team members", description: "People, invitations, and workspace access.", href: "/settings/team", icon: "contacts" as const },
  { title: "Roles & permissions", description: "Control what each role can view and manage.", href: "/settings/permissions", icon: "settings" as const },
  { title: "Pipeline stages", description: "Customize how opportunities move through sales.", href: "/settings/pipeline-stages", icon: "pipeline" as const },
  { title: "Lead sources", description: "Organize the channels bringing in new business.", href: "/settings/lead-sources", icon: "leads" as const },
  { title: "Services & products", description: "Manage reusable offerings for quotes and invoices.", href: "/settings/services", icon: "projects" as const },
  { title: "Invoice settings", description: "Invoice numbering, due dates, and business defaults.", href: "/settings/invoice", icon: "invoice" as const },
  { title: "Quotation settings", description: "Quotation numbering, validity, and standard terms.", href: "/settings/quotation", icon: "quotation" as const },
  { title: "Payment methods", description: "Payment methods accepted by your business.", href: "/settings/payment-methods", icon: "receipt" as const },
  { title: "Notifications", description: "Choose what updates reach your team.", href: "/settings/notifications", icon: "bell" as const },
  { title: "Appearance", description: "Light and dark appearance preferences.", href: "/settings/appearance", icon: "sun" as const },
];

const teamMembers = [
  { name: "Workspace admin", email: "", role: "Administrator", status: "Active", initials: "WA", color: "blue" },
];

export default function SettingsPage() {
  return <div className="records-page settings-page"><header className="records-page-header"><div><div className="records-breadcrumb">Workspace <span>/</span> System</div><h1>Settings</h1><p>Configure RanzomTech CRM to work the way your team does.</p></div></header><div className="settings-layout"><nav aria-label="Settings navigation" className="settings-nav">{settingsSections.map((section) => <Link className="settings-nav-link" href={section.href} key={section.title}><Icon name={section.icon} size={16} />{section.title}<Icon name="arrowUpRight" size={13} /></Link>)}</nav><div className="settings-section-grid">{settingsSections.map((section) => <Link className="settings-category-card" href={section.href} key={section.title}><span className="settings-category-icon"><Icon name={section.icon} size={17} /></span><strong>{section.title}</strong><span>{section.description}</span><span className="settings-category-arrow"><Icon name="arrowUpRight" size={14} /></span></Link>)}</div></div></div>;
}

export function SettingsDetailPage({ section }: { section: string }) {
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const normalized = section.toLowerCase();
  const current = settingsSections.find((item) => item.href.endsWith(`/${normalized}`));
  const title = current?.title ?? normalized.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const key = `ranzomtech-settings-${normalized}`;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entries = [...new FormData(event.currentTarget).entries()].map(([name, value]) => [name, String(value)]);
    try {
      window.localStorage.setItem(key, JSON.stringify(entries));
      setSaved(`${title} preferences saved.`);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Settings could not be saved.");
    }
  }

  return <div className="records-page settings-page"><div className="detail-back-row"><Link className="subtle-link" href="/settings">← All settings</Link></div><header className="records-page-header settings-detail-header"><div><div className="records-breadcrumb">Settings <span>/</span> {title}</div><h1>{title}</h1><p>{current?.description ?? "Manage workspace preferences and business defaults."}</p></div>{normalized === "team" && <button className="button-primary" onClick={() => setInviteOpen(true)} type="button"><Icon name="plus" size={15} />Invite member</button>}</header>
    {saved && <div className="inline-success" role="status"><Icon name="check" size={15} />{saved}<button aria-label="Dismiss message" onClick={() => setSaved("")} type="button">×</button></div>}{error && <div className="inline-error" role="alert">{error}</div>}
    {normalized === "team" ? <section className="records-surface settings-content-panel"><div className="detail-section-heading"><div><h2>Workspace members</h2><p>Manage your people and their access.</p></div><span className="pipeline-column-count">{teamMembers.length} members</span></div><div className="team-members-list">{teamMembers.map((member) => <div className="team-member-row" key={member.email}><span className={`lead-avatar avatar-${member.color}`}>{member.initials}</span><span><strong>{member.name}</strong><small>{member.email}</small></span><span className="team-member-role">{member.role}</span><span className={`document-status ${member.status === "Active" ? "status-accepted" : "status-sent"}`}>{member.status}</span><button aria-label={`Edit ${member.name}`} className="table-open" type="button"><Icon name="dots" size={16} /></button></div>)}</div></section>
      : normalized === "permissions" ? <section className="records-surface settings-content-panel"><div className="detail-section-heading"><div><h2>Role access</h2><p>Review the default capabilities assigned to each role.</p></div></div><div className="crm-table-wrap"><table className="crm-table permissions-table"><thead><tr><th>Role</th><th>Leads</th><th>Clients</th><th>Projects</th><th>Finance</th><th>Settings</th></tr></thead><tbody>{[["Administrator", "Full access", "Full access", "Full access", "Full access", "Full access"], ["Sales manager", "Manage", "View & edit", "View", "View", "No access"], ["Sales representative", "Assigned only", "View", "View", "No access", "No access"], ["Project manager", "View", "View & edit", "Manage", "View", "No access"]].map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <td key={cell}><strong>{cell}</strong></td> : <td key={`${row[0]}-${cell}-${index}`}><span className={`permission-value ${cell === "No access" ? "permission-none" : ""}`}>{cell}</span></td>)}</tr>)}</tbody></table></div></section>
      : normalized === "appearance" ? <AppearanceSettings />
      : <SettingsForm key={normalized} section={normalized} title={title} onSave={save} />}
    {inviteOpen && <Modal description="Add a teammate to your RanzomTech workspace." onClose={() => setInviteOpen(false)} title="Invite team member"><InviteForm onCancel={() => setInviteOpen(false)} onSubmit={() => { setInviteOpen(false); setSaved("Invitation prepared. It will be sent when your workspace is connected."); }} /></Modal>}
  </div>;
}

function SettingsForm({ section, title, onSave }: { section: string; title: string; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  const fields: Record<string, { label: string; name: string; type?: string; value?: string }[]> = {
    company: [{ label: "Company name", name: "company", value: "RanzomTech" }, { label: "Business email", name: "email", type: "email", value: "hello@ranzomtech.com" }, { label: "Phone", name: "phone", value: "+1 (415) 555-0100" }, { label: "Website", name: "website", value: "https://ranzomtech.com" }, { label: "Industry", name: "industry", value: "Professional services" }],
    general: [{ label: "Workspace name", name: "workspace", value: "RanzomTech" }, { label: "Default currency", name: "currency", value: "USD — US Dollar" }, { label: "Timezone", name: "timezone", value: "America/Los_Angeles" }, { label: "Date format", name: "date", value: "MMM D, YYYY" }],
    invoice: [{ label: "Invoice prefix", name: "prefix", value: "INV" }, { label: "Default payment terms", name: "terms", value: "Net 30" }, { label: "Default due days", name: "dueDays", type: "number", value: "30" }, { label: "Footer note", name: "footer", value: "Thank you for your business." }],
    quotation: [{ label: "Quotation prefix", name: "prefix", value: "QT" }, { label: "Default validity (days)", name: "validity", type: "number", value: "14" }, { label: "Standard terms", name: "terms", value: "This quotation is valid until the expiry date shown." }],
  };
  const listOptions: Record<string, string[]> = {
    "pipeline-stages": ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"],
    "lead-sources": ["Website", "WhatsApp", "Referral", "Instagram", "Other"],
    services: [],
    "payment-methods": ["Bank transfer", "Card", "Cash", "Check"],
  };
  const currentFields = fields[section];
  const options = listOptions[section];
  const [editableOptions, setEditableOptions] = useState(options ?? []);
  if (section === "notifications") return <form className="records-surface settings-content-panel settings-form" onSubmit={onSave}><div className="detail-section-heading"><div><h2>Team notifications</h2><p>Choose which activity updates are useful to your team.</p></div></div>{["New lead assigned", "Opportunity stage changes", "Follow-up due reminders", "Quotation accepted", "Invoice overdue", "Project deadline approaching"].map((label, index) => <label className="setting-toggle-row" key={label}><span><strong>{label}</strong><small>Notify workspace members when this activity occurs.</small></span><input defaultChecked={index < 4} name={label} type="checkbox" /></label>)}<SettingsSaveButton /></form>;
  if (options) return <form className="records-surface settings-content-panel settings-form" onSubmit={onSave}><div className="detail-section-heading"><div><h2>{title} configuration</h2><p>Manage the options available across your workspace.</p></div><span className="pipeline-column-count">{editableOptions.length} items</span></div><div className="settings-option-list">{editableOptions.length === 0 && <div className="detail-empty-state"><p>No options configured yet. Add your first item when you are ready.</p></div>}{editableOptions.map((option, index) => <label className="settings-option-row" key={`${index}-${option}`}><span className="pipeline-column-count">{String(index + 1).padStart(2, "0")}</span><input name={`option-${index}`} onChange={(event) => setEditableOptions((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} value={option} /><button aria-label={`Remove ${option || "option"}`} onClick={() => setEditableOptions((items) => items.filter((_, itemIndex) => itemIndex !== index))} type="button">×</button></label>)}</div><button className="button-secondary settings-add-option" onClick={() => setEditableOptions((items) => [...items, ""])} type="button"><Icon name="plus" size={14} />Add option</button><SettingsSaveButton /></form>;
  return <form className="records-surface settings-content-panel settings-form" onSubmit={onSave}><div className="detail-section-heading"><div><h2>{title} details</h2><p>Keep your workspace information accurate and current.</p></div></div><div className="settings-fields">{(currentFields ?? [{ label: "Display name", name: "name", value: title }, { label: "Description", name: "description", value: "" }]).map((field) => <label className="form-field" key={field.name}><span>{field.label}</span><input defaultValue={field.value} name={field.name} placeholder={field.label} type={field.type ?? "text"} /></label>)}</div><SettingsSaveButton /></form>;
}

function SettingsSaveButton() {
  return <div className="settings-save-row"><button className="button-primary" type="submit"><Icon name="check" size={15} />Save changes</button></div>;
}

function AppearanceSettings() {
  const theme = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("ranzomtech-theme-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("ranzomtech-theme-change", onChange);
      };
    },
    () => window.localStorage.getItem("ranzomtech-theme") === "dark" ? "dark" : "light",
    () => "light",
  );
  function choose(next: "light" | "dark") {
    window.localStorage.setItem("ranzomtech-theme", next);
    window.dispatchEvent(new Event("ranzomtech-theme-change"));
  }
  return <section className="records-surface settings-content-panel"><div className="detail-section-heading"><div><h2>Appearance</h2><p>Choose the display style that works best for you. Your choice is saved on this device.</p></div></div><div className="appearance-choice-grid">{(["light", "dark"] as const).map((mode) => <button aria-pressed={theme === mode} className={`appearance-choice appearance-${mode}${theme === mode ? " selected" : ""}`} key={mode} onClick={() => choose(mode)} type="button"><span className="appearance-preview"><i /><i /><i /></span><span><Icon name={mode === "light" ? "sun" : "moon"} size={16} />{mode === "light" ? "Light" : "Dark"}</span>{theme === mode && <Icon name="check" size={16} />}</button>)}</div></section>;
}

function InviteForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: () => void }) {
  return <form className="lead-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><div className="lead-form-grid"><label className="form-field form-field-full"><span>Email address *</span><input autoFocus name="email" placeholder="teammate@company.com" required type="email" /></label><label className="form-field form-field-full"><span>Role</span><select><option>Sales representative</option><option>Sales manager</option><option>Project manager</option><option>Administrator</option></select></label></div><div className="modal-actions"><button className="button-secondary" onClick={onCancel} type="button">Cancel</button><button className="button-primary" type="submit"><Icon name="mail" size={15} />Prepare invitation</button></div></form>;
}
