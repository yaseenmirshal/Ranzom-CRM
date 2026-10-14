"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { businessDocuments, documentStatuses, getStoredDocuments, saveStoredDocuments, type BusinessDocument, type DocumentKind } from "@/data/business-data";
import { formatCurrency } from "@/lib/currency";
const labels: Record<DocumentKind, { title: string; singular: string; icon: "quotation" | "invoice" | "receipt"; action: string }> = {
  quotation: { title: "Quotations", singular: "quotation", icon: "quotation", action: "Create quotation" },
  invoice: { title: "Invoices", singular: "invoice", icon: "invoice", action: "Create invoice" },
  receipt: { title: "Receipts", singular: "receipt", icon: "receipt", action: "Create receipt" },
};

function statusClass(status: string) {
  return `document-status status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

export default function DocumentWorkspace({ kind }: { kind: DocumentKind }) {
  const config = labels[kind];
  const [documents, setDocuments] = useState(businessDocuments.filter((document) => document.kind === kind));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<BusinessDocument | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setDocuments(getStoredDocuments(kind));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : `Could not load ${config.title.toLowerCase()}.`);
      }
    });
  }, [config.title, kind]);

  const filtered = useMemo(() => documents.filter((document) => {
    const query = search.trim().toLowerCase();
    return (!query || `${document.number} ${document.customer} ${document.owner}`.toLowerCase().includes(query)) &&
      (statusFilter === "All statuses" || document.status === statusFilter);
  }), [documents, search, statusFilter]);
  const realDocuments = documents.filter((document) => document.id !== `${kind}-demo`);
  const total = realDocuments.reduce((sum, document) => sum + document.amount, 0);
  const pendingCount = realDocuments.filter((document) => !["Accepted", "Paid", "Issued", "Void", "Cancelled", "Rejected"].includes(document.status)).length;

  function updateStatus(document: BusinessDocument, status: string) {
    const updated = documents.map((item) => item.id === document.id
      ? { ...item, status, ...(kind === "invoice" && status === "Paid" ? { paid: item.amount } : {}) }
      : item);
    try {
      saveStoredDocuments(kind, updated);
      setDocuments(updated);
      setFeedback(`${document.number} marked ${status.toLowerCase()}.`);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The document update could not be saved.");
    }
  }

  function deleteDocument(document: BusinessDocument) {
    const updated = documents.filter((item) => item.id !== document.id);
    saveStoredDocuments(kind, updated);
    setDocuments(updated);
    setSelectedDocument(null);
    setFeedback("Record deleted successfully.");
    setError("");
  }

  return (
    <div className="records-page document-workspace">
      <header className="records-page-header">
        <div>
          <div className="records-breadcrumb">Workspace <span>/</span> {config.title}</div>
          <h1>{config.title}</h1>
          <p>{kind === "quotation" ? "Prepare proposals and keep every customer decision in view." : kind === "invoice" ? "Keep billing clear, current, and easy to follow." : "A clear record of payments received from your customers."}</p>
        </div>
        <Link className="button-primary" href={`/${kind}s/new`}><Icon name="plus" size={16} />{config.action}</Link>
      </header>

      {error && <div className="inline-error" role="alert">{error}</div>}
      {feedback && <div className="inline-success" role="status"><Icon name="check" size={15} />{feedback}<button aria-label="Dismiss message" onClick={() => setFeedback("")} type="button">×</button></div>}

      <div className="document-metrics">
        <div><span>{config.title}</span><strong>{realDocuments.length}</strong><small>All records</small></div>
        <div><span>Total value</span><strong>{formatCurrency(total)}</strong><small>Across all records</small></div>
        <div><span>{kind === "quotation" ? "Awaiting response" : kind === "invoice" ? "Needs attention" : "Payments recorded"}</span><strong>{kind === "receipt" ? realDocuments.length : pendingCount}</strong><small>{kind === "receipt" ? "Successfully issued" : "Open records"}</small></div>
      </div>

      <section aria-label={`${config.title} records`} className="records-surface document-list-surface">
        <div className="records-toolbar">
          <label className="records-search"><Icon name="search" size={16} /><input aria-label={`Search ${config.title.toLowerCase()}`} onChange={(event) => setSearch(event.target.value)} placeholder={`Search by number or customer...`} value={search} /></label>
          <div className="records-filters"><label className="filter-select"><Icon name="filter" size={14} /><select aria-label="Filter by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>All statuses</option>{documentStatuses[kind].map((status) => <option key={status}>{status}</option>)}</select></label></div>
        </div>
        <div className="document-list-meta"><strong>{filtered.filter((document) => document.id !== `${kind}-demo`).length}</strong> {config.title.toLowerCase()}{filtered.some((document) => document.id === `${kind}-demo`) && <span>Sample preview shown</span>}{statusFilter !== "All statuses" && <span>{statusFilter}</span>}</div>
        {filtered.length ? (
          <div className="crm-table-wrap">
            <table className="crm-table document-table">
              <thead><tr><th>{kind === "receipt" ? "Receipt" : kind === "invoice" ? "Invoice" : "Quotation"}</th><th>Customer</th><th>{kind === "receipt" ? "Payment date" : "Date"}</th>{kind === "receipt" ? <><th>Payment method</th><th>Related invoice</th><th>Reference</th></> : <th>{kind === "invoice" ? "Due date" : "Expiry date"}</th>}<th>Amount</th>{kind === "invoice" && <th>Paid / outstanding</th>}<th>Status</th><th>Salesperson</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((document) => (
                  <tr key={document.id}>
                    <td><span className="document-number"><span className="document-icon"><Icon name={config.icon} size={15} /></span><strong>{document.number}</strong></span></td>
                    <td><span className="table-primary">{document.customer}</span></td>
                    <td>{document.issueDate}</td>
                    {kind === "receipt" ? <><td>{document.method}</td><td>{document.relatedInvoice || "—"}</td><td>{document.reference || "—"}</td></> : <td>{document.dueDate}</td>}
                    <td className="table-value">{formatCurrency(document.amount)}</td>
                    {kind === "invoice" && <td><span className="invoice-balance">{formatCurrency(document.paid ?? 0)} paid</span><small className="table-secondary">{formatCurrency(document.amount - (document.paid ?? 0))} outstanding</small></td>}
                    <td><span className={statusClass(document.status)}>{document.status}</span></td>
                    <td>{document.owner}</td>
                    <td><div className="document-actions">
                      {kind === "invoice" && document.status !== "Paid" && <button aria-label={`Mark ${document.number} paid`} onClick={() => updateStatus(document, "Paid")} title="Mark paid" type="button"><Icon name="check" size={15} /></button>}
                      {kind === "quotation" && document.status === "Draft" && <button aria-label={`Send ${document.number}`} onClick={() => updateStatus(document, "Sent")} title="Mark as sent" type="button"><Icon name="arrowUpRight" size={15} /></button>}
                      {kind === "receipt" && <button aria-label={`View and print ${document.number}`} onClick={() => setSelectedDocument(document)} title="View receipt" type="button"><Icon name="invoice" size={15} /></button>}
                      <button aria-label={`View ${document.number}`} onClick={() => setSelectedDocument(document)} title="View details" type="button"><Icon name="arrowUpRight" size={15} /></button>
                      <button aria-label={`Delete ${config.singular}: ${document.number}`} className="record-delete-action" onClick={() => setDeletingDocument(document)} title={`Delete ${config.singular}`} type="button"><Icon name="trash" size={15} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="document-mobile-list">
              {filtered.map((document) => <article className="document-mobile-row" key={document.id}><button className="document-mobile-content" onClick={() => setSelectedDocument(document)} type="button"><span className="document-number"><span className="document-icon"><Icon name={config.icon} size={15} /></span><strong>{document.number}</strong></span><strong className="document-mobile-customer">{document.customer}</strong><small>{document.issueDate} · {formatCurrency(document.amount)}</small></button><span className={statusClass(document.status)}>{document.status}</span><button aria-label={`View ${document.number}`} onClick={() => setSelectedDocument(document)} type="button"><Icon name="arrowUpRight" size={15} /></button><button aria-label={`Delete ${config.singular}: ${document.number}`} className="record-delete-action" onClick={() => setDeletingDocument(document)} type="button"><Icon name="trash" size={15} /></button></article>)}
            </div>
          </div>
        ) : (
          <div className="leads-empty-state"><span className="empty-state-icon"><Icon name={config.icon} size={22} /></span><h2>{documents.length ? `No ${config.title.toLowerCase()} found` : `No ${config.title.toLowerCase()} yet`}</h2><p>{documents.length ? "Try changing your search or status filter." : `Create your first ${config.singular} to keep this workspace up to date.`}</p><Link className="button-secondary" href={`/${kind}s/new`}>{config.action}</Link></div>
        )}
      </section>
      {selectedDocument && <Modal description={`${config.singular} · ${selectedDocument.number}`} onClose={() => setSelectedDocument(null)} title={selectedDocument.customer}>
        <div className="document-detail-modal">{kind === "receipt" && <div className="business-document-preview receipt-print-preview"><div className="preview-brand-row"><span className="preview-brand-mark">R</span><span><strong>RanzomTech</strong><small>Payment confirmation</small></span><b>RECEIPT</b></div><div className="preview-document-number">{selectedDocument.number}</div><div className="receipt-preview-amount"><small>Amount received</small><strong>{formatCurrency(selectedDocument.amount)}</strong><span>{selectedDocument.method} · {selectedDocument.issueDate}</span></div><div className="preview-parties"><div><small>Received from</small><strong>{selectedDocument.customer}</strong></div><div><small>Related invoice</small><strong>{selectedDocument.relatedInvoice || "Not linked"}</strong></div></div><div className="preview-notes"><strong>Transaction reference</strong><span>{selectedDocument.reference || "—"}</span></div><div className="preview-footer">RanzomTech CRM · Thank you for your payment</div></div>}<div className="document-detail-modal-total"><span>Document total</span><strong>{formatCurrency(selectedDocument.amount)}</strong></div><dl><div><dt>Status</dt><dd><span className={statusClass(selectedDocument.status)}>{selectedDocument.status}</span></dd></div><div><dt>{kind === "receipt" ? "Payment date" : "Issue date"}</dt><dd>{selectedDocument.issueDate}</dd></div>{kind !== "receipt" && <div><dt>{kind === "invoice" ? "Due date" : "Expiry date"}</dt><dd>{selectedDocument.dueDate}</dd></div>}<div><dt>Salesperson</dt><dd>{selectedDocument.owner}</dd></div>{kind === "invoice" && <div><dt>Paid</dt><dd>{formatCurrency(selectedDocument.paid ?? 0)}</dd></div>}{kind === "receipt" && <><div><dt>Method</dt><dd>{selectedDocument.method}</dd></div><div><dt>Related invoice</dt><dd>{selectedDocument.relatedInvoice || "Not linked"}</dd></div><div><dt>Reference</dt><dd>{selectedDocument.reference || "—"}</dd></div></>}</dl>{selectedDocument.lineItems?.length ? <div className="document-detail-note"><strong>Line items</strong>{selectedDocument.lineItems.map((line, index) => <p key={`${line.name}-${index}`}>{line.quantity} × {line.name} — {formatCurrency(line.quantity * line.unitPrice * (1 - line.discount / 100) * (1 + line.tax / 100))}</p>)}</div> : null}{selectedDocument.notes && <div className="document-detail-note"><strong>Notes</strong><p>{selectedDocument.notes}</p></div>}{selectedDocument.terms && <div className="document-detail-note"><strong>Terms</strong><p>{selectedDocument.terms}</p></div>}<div className="modal-actions">{kind === "receipt" && <button className="button-secondary" onClick={() => window.print()} type="button">Print / download</button>}<button className="button-danger" onClick={() => { setDeletingDocument(selectedDocument); setSelectedDocument(null); }} type="button"><Icon name="trash" size={15} />Delete</button><button className="button-secondary" onClick={() => setSelectedDocument(null)} type="button">Close</button></div></div>
      </Modal>}
      {deletingDocument && <DeleteConfirmation onClose={() => setDeletingDocument(null)} onDelete={() => deleteDocument(deletingDocument)} />}
    </div>
  );
}
