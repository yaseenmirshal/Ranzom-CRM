"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import {
  dashboardData,
  type DashboardActivity,
  type DashboardFollowUp,
  type DashboardLead,
  type LeadSource,
  type LeadStage,
} from "@/data/mock-data";
import { readLeads } from "@/lib/lead-storage";
import { formatCompactCurrency, formatCurrency } from "@/lib/currency";

const stageStyles: Record<LeadStage, string> = {
  New: "stage-new",
  Qualified: "stage-qualified",
  Proposal: "stage-proposal",
  Negotiation: "stage-negotiation",
  Won: "stage-won",
  Lost: "stage-lost",
};

const sourceStyles: Record<LeadSource, string> = {
  Website: "source-sage",
  WhatsApp: "source-amber",
  Referral: "source-blue",
  Instagram: "source-rose",
  Other: "source-slate",
};

const activityIcons: Record<DashboardActivity["icon"], IconName> = {
  leads: "leads",
  pipeline: "pipeline",
  quotation: "quotation",
  followups: "followups",
  clients: "clients",
};

function getDateLabel() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function subscribeToDate() {
  return () => {};
}

function SectionHeading({
  title,
  titleId,
  caption,
  action,
}: {
  title: string;
  titleId?: string;
  caption?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="dashboard-section-heading">
      <div>
        <h2 id={titleId}>{title}</h2>
        {caption && <p>{caption}</p>}
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  metric,
}: {
  metric: (typeof dashboardData.kpis)[number];
}) {
  return (
    <article className="metric-card">
      <div className="metric-topline">
        <span className="metric-label">{metric.label}</span>
        <span className={`metric-icon metric-icon-${metric.tone}`}>
          <Icon name={metric.icon} size={17} />
        </span>
      </div>
      <div className="metric-value">{metric.value}</div>
      <div className="metric-foot"><span className="metric-context">{metric.context}</span></div>
    </article>
  );
}

function PipelinePanel() {
  const totalCount = dashboardData.pipeline.reduce(
    (total, item) => total + item.count,
    0,
  );
  const totalValue = dashboardData.pipeline.reduce(
    (total, item) => total + item.value,
    0,
  );
  const maxCount = Math.max(1, ...dashboardData.pipeline.map((item) => item.count));

  return (
    <section aria-labelledby="pipeline-title" className="dashboard-panel pipeline-panel">
      <SectionHeading
        title="Sales pipeline"
        titleId="pipeline-title"
        caption="A snapshot of opportunities by stage"
        action={
          <Link className="subtle-link" href="/leads?view=pipeline">
            View pipeline <Icon name="arrowUpRight" size={14} />
          </Link>
        }
      />
      <div aria-label="Sales pipeline by stage" className="pipeline-stages">
        {dashboardData.pipeline.map((item) => (
          <div className="pipeline-stage" key={item.stage}>
            <div className="pipeline-stage-top">
              <span className={`pipeline-marker marker-${item.color}`} />
              <span className="pipeline-stage-name">{item.stage}</span>
            </div>
            <div className="pipeline-count">{item.count}</div>
            <div className="pipeline-deals-label">deals</div>
            <div className="pipeline-track">
              <span
                className={`pipeline-fill fill-${item.color}`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="pipeline-stage-value">{item.value === 0 ? "₹0" : formatCompactCurrency(item.value)}</div>
          </div>
        ))}
      </div>
      {!totalCount && <p className="dashboard-panel-empty">Your pipeline will take shape as you add opportunities.</p>}
      <div className="pipeline-summary">
        <span><strong>{totalCount}</strong> total deals</span>
        <span className="pipeline-summary-divider" />
        <span><strong>{formatCurrency(totalValue)}</strong> total value</span>
        <span className="pipeline-summary-note">Across all stages</span>
      </div>
    </section>
  );
}

function SourcesPanel() {
  return (
    <section aria-labelledby="sources-title" className="dashboard-panel sources-panel">
      <SectionHeading
        title="Lead sources"
        titleId="sources-title"
        caption="Where opportunities begin"
        action={<span className="period-label">This month</span>}
      />
      <div aria-label="Lead counts by source" className="source-list">
        {dashboardData.sources.map((source) => (
          <div className="source-row" key={source.name}>
            <div className="source-label">
              <span className={`source-dot ${source.color}`} />
              <span>{source.name}</span>
              <strong>{source.count}</strong>
            </div>
            <div
              aria-label={`${source.percent}%`}
              className="source-track"
              role="img"
            >
              <span
                className={`source-fill ${source.color}`}
                style={{ width: `${source.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="source-footer">
        <span><strong>0</strong> leads from all sources</span>
        <Link className="subtle-link" href="/leads">Add a lead <Icon name="arrowUpRight" size={14} /></Link>
      </div>
    </section>
  );
}

function StageBadge({ stage }: { stage: LeadStage }) {
  return <span className={`stage-badge ${stageStyles[stage]}`}>{stage}</span>;
}

function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className="lead-source">
      <span className={`source-dot ${sourceStyles[source]}`} />
      {source}
    </span>
  );
}

function LeadRow({ lead }: { lead: DashboardLead }) {
  return (
    <tr>
      <td>
        <Link className="lead-name-link" href={`/leads/${lead.id}`}>
          <span className={`lead-avatar avatar-${lead.color}`}>{lead.initials}</span>
          <span className="lead-person">
            <strong>{lead.name}</strong>
            <span className="mobile-company">{lead.company}</span>
          </span>
        </Link>
      </td>
      <td>
        <span className="company-name">{lead.company}</span>
        <span className="company-type">{lead.companyType}</span>
      </td>
      <td><SourceBadge source={lead.source} /></td>
      <td className="lead-value">{formatCurrency(lead.value)}</td>
      <td><StageBadge stage={lead.stage} /></td>
      <td>
        <span className="owner-cell">
          <span className={`owner-avatar avatar-${lead.color}`}>{lead.ownerInitials}</span>
          <span>{lead.owner}</span>
        </span>
      </td>
      <td className="lead-date">{lead.date}</td>
    </tr>
  );
}

function RecentLeads({ leads }: { leads: DashboardLead[] }) {
  return (
    <section aria-labelledby="recent-leads-title" className="dashboard-panel leads-panel">
      <SectionHeading
        title="Recent leads"
        titleId="recent-leads-title"
        caption={leads.some((lead) => lead.isDemo) ? "One sample record to show how your workspace will look" : "Latest opportunities added to your workspace"}
        action={
          <Link className="subtle-link" href="/leads">
            All leads <Icon name="arrowUpRight" size={14} />
          </Link>
        }
      />
      {leads.length ? <><div className="lead-table-wrap">
        <table className="lead-table">
          <thead>
            <tr>
              <th scope="col">Lead</th>
              <th scope="col">Company</th>
              <th scope="col">Source</th>
              <th scope="col">Value</th>
              <th scope="col">Stage</th>
              <th scope="col">Owner</th>
              <th scope="col">Added</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-leads">
        {leads.slice(0, 3).map((lead) => (
          <Link className="mobile-lead-row" href={`/leads/${lead.id}`} key={lead.id}>
            <span className={`lead-avatar avatar-${lead.color}`}>{lead.initials}</span>
            <span className="mobile-lead-main">
              <strong>{lead.name}</strong>
              <span>{lead.company}</span>
              <span className="mobile-lead-submeta">
                {lead.source} <span>·</span> {lead.owner} <span>·</span> {lead.date}
              </span>
              <span className="mobile-lead-meta">
                <StageBadge stage={lead.stage} />
                <span>{formatCurrency(lead.value)}</span>
              </span>
            </span>
            <Icon name="arrowUpRight" size={15} />
          </Link>
        ))}
      </div></> : <div className="dashboard-panel-empty"><p>No leads yet. Add your first lead to start building your pipeline.</p><Link className="subtle-link" href="/leads">Add a lead <Icon name="arrowUpRight" size={14} /></Link></div>}
    </section>
  );
}

const followUpLabels: Record<DashboardFollowUp["status"], string> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
};

function FollowUpItem({ item }: { item: DashboardFollowUp }) {
  return (
    <Link className={`follow-up-item follow-up-${item.status}`} href="/follow-ups">
      <span className="follow-up-marker">
        {item.status === "overdue" ? (
          <Icon name="clock" size={14} />
        ) : item.status === "today" ? (
          <Icon name="calendar" size={14} />
        ) : (
          <Icon name="check" size={14} />
        )}
      </span>
      <span className="follow-up-content">
        <span className="follow-up-main">{item.subject}</span>
        <span className="follow-up-person">{item.person} <span>·</span> {item.company}</span>
      </span>
      <span className="follow-up-time">{item.time}</span>
    </Link>
  );
}

function FollowUpsPanel() {
  const orderedStatuses: DashboardFollowUp["status"][] = [
    "overdue",
    "today",
    "upcoming",
  ];

  return (
    <section aria-labelledby="follow-ups-title" className="dashboard-panel follow-ups-panel">
      <SectionHeading
        title="Follow-ups"
        titleId="follow-ups-title"
        caption="Stay close to every opportunity"
        action={
          <Link className="subtle-link" href="/follow-ups">
            View all <Icon name="arrowUpRight" size={14} />
          </Link>
        }
      />
      <div className="follow-up-groups">
        {orderedStatuses.map((status) => {
          const items = dashboardData.followUps.filter(
            (item) => item.status === status,
          );
          if (!items.length) return null;
          return (
            <div className="follow-up-group" key={status}>
              <div className={`follow-up-group-heading group-${status}`}>
                <span>{followUpLabels[status]}</span>
                <span>{items.length}</span>
              </div>
              {items.map((item) => (
                <FollowUpItem item={item} key={item.id} />
              ))}
            </div>
          );
        })}
        {!dashboardData.followUps.length && (
          <div className="dashboard-panel-empty">
            <p>No follow-ups due. Create one when you have a next step.</p>
            <Link className="subtle-link" href="/follow-ups">Schedule a follow-up <Icon name="arrowUpRight" size={14} /></Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ActivityItem({ item }: { item: DashboardActivity }) {
  return (
    <div className="activity-item">
      <span className={`activity-icon activity-${item.tone}`}>
        <Icon name={activityIcons[item.icon]} size={14} />
      </span>
      <span className="activity-copy">
        <strong>{item.title}</strong>
        <span>{item.detail}</span>
      </span>
      <time>{item.time}</time>
    </div>
  );
}

function ActivityPanel() {
  return (
    <section aria-labelledby="activity-title" className="dashboard-panel activity-panel">
      <SectionHeading
        title="Recent activity"
        titleId="activity-title"
        caption="The latest from your team"
        action={
          <Link className="subtle-link" href="/reports">
            Activity log <Icon name="arrowUpRight" size={14} />
          </Link>
        }
      />
      <div className="activity-list">
        {dashboardData.activities.map((item) => (
          <ActivityItem item={item} key={item.id} />
        ))}
        {!dashboardData.activities.length && <div className="dashboard-panel-empty"><p>Your team activity will appear here as work gets underway.</p></div>}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const todayLabel = useSyncExternalStore(subscribeToDate, getDateLabel, () => "Today");
  const [leads, setLeads] = useState<DashboardLead[]>(dashboardData.leads);
  const [leadsError, setLeadsError] = useState("");
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setLeads(readLeads().map((lead) => ({
          id: lead.id,
          name: lead.name,
          initials: lead.initials,
          company: lead.company,
          companyType: lead.companyType,
          source: lead.source,
          value: lead.value,
          stage: lead.stage,
          owner: lead.owner,
          ownerInitials: lead.ownerInitials,
          date: lead.createdAt,
          color: lead.color,
          isDemo: lead.isDemo,
        })));
      } catch (cause) {
        setLeadsError(cause instanceof Error ? cause.message : "Saved leads could not be loaded.");
      }
    });
  }, []);
  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div className="dashboard-heading-copy">
          <span className="dashboard-date" suppressHydrationWarning>
            <Icon name="calendar" size={14} />
            {todayLabel}
          </span>
          <h1>Dashboard</h1>
          <p>A clear view of your pipeline, team activity and next steps.</p>
        </div>
        {leadsError && <div className="inline-error" role="alert">{leadsError}</div>}
        <div className="dashboard-heading-actions">
          <Link className="dashboard-add-button" href="/leads">
            <Icon name="plus" size={16} />
            Add lead
          </Link>
        </div>
      </div>

      <section aria-label="CRM performance" className="metrics-grid">
        {dashboardData.kpis.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="dashboard-overview-grid">
        <PipelinePanel />
        <SourcesPanel />
      </div>

      <div className="dashboard-work-grid">
        <RecentLeads leads={leads} />
        <div className="dashboard-side-stack">
          <FollowUpsPanel />
          <ActivityPanel />
        </div>
      </div>
    </div>
  );
}
