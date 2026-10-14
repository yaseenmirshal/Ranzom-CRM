"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { projectRecords, type ProjectRecord } from "@/data/operations-data";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All projects");
  const [view, setView] = useState<"cards" | "list">("cards");
  const filtered = useMemo(() => projectRecords.filter((project) =>
    (!query || `${project.name} ${project.client} ${project.team.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (status === "All projects" || project.status === status),
  ), [query, status]);
  const activeCount = projectRecords.filter((project) => project.status === "In progress").length;
  const portfolioValue = projectRecords.reduce((sum, project) => sum + project.value, 0);
  return <div className="records-page projects-page">
    <header className="records-page-header"><div><div className="records-breadcrumb">Delivery <span>/</span> Client work</div><h1>Projects</h1><p>Track delivery progress, value, and the teams behind every engagement.</p></div><Link className="button-secondary" href="/tasks"><Icon name="tasks" size={15} />View tasks</Link></header>
    <div className="document-metrics"><div><span>Active projects</span><strong>{activeCount}</strong><small>Currently in delivery</small></div><div><span>Portfolio value</span><strong>{money.format(portfolioValue)}</strong><small>Across all engagements</small></div><div><span>Completed</span><strong>{projectRecords.filter((project) => project.status === "Completed").length}</strong><small>Successfully delivered</small></div></div>
    <div className="project-controls"><label className="records-search"><Icon name="search" size={16} /><input aria-label="Search projects" onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or clients..." value={query} /></label><label className="filter-select"><Icon name="filter" size={14} /><select aria-label="Filter project status" onChange={(event) => setStatus(event.target.value)} value={status}><option>All projects</option>{["In progress", "Planning", "On hold", "Completed"].map((item) => <option key={item}>{item}</option>)}</select></label><div className="view-switch" role="group" aria-label="Project view"><button aria-pressed={view === "cards"} className={view === "cards" ? "selected" : ""} onClick={() => setView("cards")} type="button">Cards</button><button aria-pressed={view === "list"} className={view === "list" ? "selected" : ""} onClick={() => setView("list")} type="button">List</button></div></div>
    {view === "cards" ? <div className="project-card-grid">{filtered.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <section className="records-surface"><div className="crm-table-wrap"><table className="crm-table project-table"><thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Team</th><th>Due date</th><th>Value</th></tr></thead><tbody>{filtered.map((project) => <tr key={project.id}><td><Link className="table-primary" href={`/projects/${project.id}`}>{project.name}</Link></td><td>{project.client}</td><td><span className={`document-status project-status-${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span></td><td>{project.progress}%</td><td>{project.team.join(", ")}</td><td>{project.dueDate}</td><td className="table-value">{money.format(project.value)}</td></tr>)}</tbody></table></div></section>}
    {!filtered.length && <div className="leads-empty-state"><h2>No projects found</h2><p>Try changing your search or status filter.</p></div>}
  </div>;
}

function ProjectCard({ project }: { project: ProjectRecord }) {
  return <Link className="project-card" href={`/projects/${project.id}`}><div className="project-card-heading"><span className="project-card-icon"><Icon name="projects" size={18} /></span><span className={`document-status project-status-${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span></div><h2>{project.name}</h2><p>{project.client}</p><div className="project-progress-label"><span>Progress</span><strong>{project.progress}%</strong></div><div className="project-progress-track"><span style={{ width: `${project.progress}%` }} /></div><div className="project-card-facts"><span><Icon name="calendar" size={14} />Due {project.dueDate}</span><strong>{money.format(project.value)}</strong></div><div className="project-card-footer"><span>{project.team.map((member) => <i key={member} title={member}>{member.split(" ").map((part) => part[0]).join("")}</i>)}</span><small>{project.team.length} team members</small><Icon name="arrowUpRight" size={15} /></div></Link>;
}

export function ProjectDetailsPage({ id }: { id: string }) {
  const project = projectRecords.find((item) => item.id === Number(id));
  if (!project) return <div className="records-page"><div className="leads-empty-state"><h1>Project not found</h1><p>This project may have been removed or the link is incorrect.</p><Link className="button-secondary" href="/projects">Back to projects</Link></div></div>;
  return <ProjectDetail project={project} />;
}

function ProjectDetail({ project }: { project: ProjectRecord }) {
  return <div className="records-page project-detail-page"><div className="detail-back-row"><Link className="subtle-link" href="/projects">← Back to projects</Link></div><header className="project-detail-header"><div className="project-card-icon"><Icon name="projects" size={20} /></div><div><div className="records-breadcrumb">Projects <span>/</span> Overview</div><h1>{project.name}</h1><p>{project.client} <span>·</span> {project.description}</p></div><span className={`document-status project-status-${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span></header><section className="records-surface project-progress-panel"><div className="project-progress-label"><span>Overall progress</span><strong>{project.progress}%</strong></div><div className="project-progress-track"><span style={{ width: `${project.progress}%` }} /></div><div className="project-detail-dates"><span>Started <strong>{project.startDate}</strong></span><span>Due date <strong>{project.dueDate}</strong></span><span>Project value <strong>{money.format(project.value)}</strong></span></div></section><div className="project-detail-grid"><section className="records-surface detail-section"><div className="detail-section-heading"><div><h2>Project overview</h2><p>Key details and delivery scope</p></div></div><p className="lead-notes">{project.description}</p><div className="project-detail-fact"><span>Client</span><Link href={`/clients/${project.client === "Northstar Studio" ? 1 : project.client === "Meridian Works" ? 2 : project.client === "BrightPath Energy" ? 3 : project.client === "Clearline Advisory" ? 4 : 5}`}>{project.client}</Link></div></section><section className="records-surface detail-section"><div className="detail-section-heading"><div><h2>Project team</h2><p>People contributing to delivery</p></div></div><div className="project-team-list">{project.team.map((member) => <div key={member}><span className="owner-avatar avatar-blue">{member.split(" ").map((part) => part[0]).join("")}</span><strong>{member}</strong><span>{member === "Maya Patel" ? "Project lead" : "Team member"}</span></div>)}</div></section></div></div>;
}
