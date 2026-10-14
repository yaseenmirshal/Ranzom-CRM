import Icon from "@/components/ui/Icon";
import { dashboardData } from "@/data/mock-data";
import { clientRecords, followUpRecords, projectRecords } from "@/data/operations-data";

const salesByMonth = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((month) => ({
  month,
  actual: 0,
  target: 0,
}));
const team = [
  { name: "Workspace admin", initials: "WA", won: 0, value: 0, conversion: 0, color: "blue" },
];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function ReportsPage() {
  const outstanding = clientRecords.reduce((sum, client) => sum + client.outstanding, 0);
  const portfolio = projectRecords.reduce((sum, project) => sum + project.value, 0);
  const actualFollowUps = followUpRecords.filter((item) => item.id !== 1);
  const completedFollowUps = actualFollowUps.filter((item) => item.bucket === "Completed").length;
  const followUpRate = actualFollowUps.length ? Math.round(completedFollowUps / actualFollowUps.length * 100) : 0;

  return <div className="records-page reports-page">
    <header className="records-page-header"><div><div className="records-breadcrumb">Insights <span>/</span> Performance</div><h1>Reports</h1><p>Measure momentum, revenue health, and how work moves through your team.</p></div><label className="filter-select report-period"><Icon name="calendar" size={16} /><select aria-label="Report period"><option>Last 6 months</option><option>This quarter</option><option>This year</option></select></label></header>
    <div className="report-kpi-grid">
      <article><span className="report-kpi-icon"><Icon name="leads" size={18} /></span><span>Leads created</span><strong>0</strong><small className="report-muted">No leads recorded yet</small></article>
      <article><span className="report-kpi-icon"><Icon name="pipeline" size={18} /></span><span>Conversion rate</span><strong>0%</strong><small className="report-muted">No closed leads yet</small></article>
      <article><span className="report-kpi-icon"><Icon name="clients" size={18} /></span><span>Won revenue</span><strong>{currency.format(0)}</strong><small className="report-muted">No revenue recorded</small></article>
      <article><span className="report-kpi-icon"><Icon name="invoice" size={18} /></span><span>Outstanding</span><strong>{currency.format(outstanding)}</strong><small className="report-muted">Across active accounts</small></article>
    </div>
    <div className="report-main-grid">
      <section className="records-surface report-panel sales-report-panel"><div className="detail-section-heading"><div><h2>Revenue performance</h2><p>Monthly closed revenue against target</p></div><span className="report-legend"><i /> Revenue <i /> Target</span></div>
        <div className="report-zero-state"><strong>No revenue data yet</strong><span>Your chart will grow as invoices are recorded.</span></div>
        <div className="revenue-chart" role="img" aria-label="No revenue data recorded for the last six months">{salesByMonth.map((item) => <div className="revenue-chart-month" key={item.month}><div className="revenue-bars"><span className="revenue-bar-target" style={{ height: `${item.target}%` }} /><span className="revenue-bar-actual" style={{ height: `${item.actual}%` }} /></div><small>{item.month}</small></div>)}</div>
        <div className="revenue-chart-summary"><span>Closed revenue <strong>{currency.format(0)}</strong></span><span>Target attainment <strong>0%</strong></span></div>
      </section>
      <section className="records-surface report-panel"><div className="detail-section-heading"><div><h2>Lead sources</h2><p>Where qualified opportunities start</p></div></div><div className="report-source-list">{dashboardData.sources.map((source) => <div className="report-source-item" key={source.name}><div><span>{source.name}</span><strong>0</strong><small>0%</small></div><span className="report-bar-track"><i className={source.color} style={{ width: "0%" }} /></span></div>)}</div></section>
    </div>
    <div className="report-bottom-grid">
      <section className="records-surface report-panel team-report-panel"><div className="detail-section-heading"><div><h2>Team performance</h2><p>Closed deals and conversion this period</p></div></div><div className="team-report-list">{team.map((member) => <div className="team-report-row" key={member.name}><span className={`lead-avatar avatar-${member.color}`}>{member.initials}</span><strong>{member.name}</strong><span>{member.won} deals won</span><b>{currency.format(member.value)}</b><span className="conversion-rate">{member.conversion}% conv.</span></div>)}</div></section>
      <section className="records-surface report-panel followup-report-panel"><div className="detail-section-heading"><div><h2>Follow-up performance</h2><p>Keeping conversations active</p></div></div><div className="followup-performance-score"><strong>{followUpRate}%</strong><span>of planned follow-ups completed</span></div><div className="report-progress-track"><i style={{ width: `${followUpRate}%` }} /></div><div className="report-stat-pair"><span>Completed this period <strong>{completedFollowUps}</strong></span><span>Upcoming <strong>{actualFollowUps.filter((item) => item.bucket === "Upcoming").length}</strong></span></div><div className="portfolio-callout"><span><Icon name="projects" size={17} /> Active project value</span><strong>{currency.format(portfolio)}</strong></div></section>
    </div>
  </div>;
}
