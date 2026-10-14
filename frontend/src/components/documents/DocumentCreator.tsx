"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { customers, getStoredDocuments, saveStoredDocuments, type BusinessDocument, type DocumentKind } from "@/data/business-data";

type LineItem = { id: number; name: string; description: string; quantity: number; unitPrice: number; discount: number; tax: number };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const DEFAULT_DATE = "2026-10-14";
const nowISODate = () => DEFAULT_DATE;
const afterDays = (days: number) => new Date(new Date(`${DEFAULT_DATE}T12:00:00`).getTime() + days * 86400000).toISOString().slice(0, 10);
const defaultLine = (): LineItem => ({ id: Date.now(), name: "", description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 });
const documentLabels: Record<DocumentKind, { title: string; numberPrefix: string; action: string }> = {
  quotation: { title: "Create quotation", numberPrefix: "QT", action: "Send quotation" },
  invoice: { title: "Create invoice", numberPrefix: "INV", action: "Generate invoice" },
  receipt: { title: "Create receipt", numberPrefix: "RCT", action: "Issue receipt" },
};

function displayDate(date: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export default function DocumentCreator({ kind }: { kind: DocumentKind }) {
  const router = useRouter();
  const config = documentLabels[kind];
  const [customer, setCustomer] = useState(customers[0].name);
  const [issueDate, setIssueDate] = useState(nowISODate());
  const [dueDate, setDueDate] = useState(afterDays(kind === "quotation" ? 14 : 30));
  const [reference, setReference] = useState("");
  const [contactName, setContactName] = useState(customers[0].contact);
  const [contactEmail, setContactEmail] = useState(customers[0].email);
  const [contactPhone, setContactPhone] = useState(customers[0].phone);
  const [receiptAmount, setReceiptAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Bank transfer");
  const [relatedInvoice, setRelatedInvoice] = useState("INV-DEMO");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days of issue.");
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLine()]);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const customerInfo = customers.find((item) => item.name === customer) ?? customers[0];
  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice), 0), [lineItems]);
  const discountTotal = useMemo(() => lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * Math.max(0, item.discount) / 100, 0), [lineItems]);
  const taxTotal = useMemo(() => lineItems.reduce((sum, item) => {
    const taxable = item.quantity * item.unitPrice * (1 - Math.max(0, item.discount) / 100);
    return sum + taxable * Math.max(0, item.tax) / 100;
  }, 0), [lineItems]);
  const total = subtotal - discountTotal + taxTotal;
  const latestNumber = `${config.numberPrefix}-2026-NEW`;

  function updateLine(id: number, key: keyof Omit<LineItem, "id">, value: string) {
    setLineItems((items) => items.map((item) => item.id === id
      ? { ...item, [key]: ["quantity", "unitPrice", "discount", "tax"].includes(key) ? Math.max(0, Number(value) || 0) : value }
      : item));
  }

  function saveDocument(status: string) {
    if (!customer || (kind !== "receipt" && lineItems.some((item) => !item.name.trim()))) {
      setError(kind === "receipt" ? "Select a customer to issue this receipt." : "Add a product or service description to every line.");
      return;
    }
    setSaving(true);
    try {
      const existing = getStoredDocuments(kind);
      const amount = kind === "receipt" ? receiptAmount : total;
      const number = `${config.numberPrefix}-${issueDate.slice(0, 4)}-${String(Date.now()).slice(-5)}`;
      const next: BusinessDocument = {
        id: `${kind}-${Date.now()}`,
        kind,
        number,
        customer,
        issueDate: displayDate(issueDate),
        dueDate: displayDate(dueDate),
        amount,
        status,
        owner: "Workspace admin",
        contact: contactName,
        email: contactEmail,
        phone: contactPhone,
        notes,
        terms: kind === "receipt" ? "" : terms,
        lineItems: kind === "receipt" ? [] : lineItems.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
        })),
        ...(kind === "invoice" ? { paid: 0 } : {}),
        ...(kind === "receipt" ? {
          method: paymentMethod,
          reference,
          relatedInvoice,
        } : {}),
      };
      saveStoredDocuments(kind, [next, ...existing]);
      setError("");
      router.push(`/${kind}s`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The document could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function selectCustomer(name: string) {
    setCustomer(name);
    const selected = customers.find((item) => item.name === name) ?? customers[0];
    setContactName(selected.contact);
    setContactEmail(selected.email);
    setContactPhone(selected.phone);
  }

  return (
    <div className={`records-page document-creator document-creator-${kind}`}>
      <div className="document-creator-top">
        <div>
          <Link className="subtle-link" href={`/${kind}s`}>← Back to {kind}s</Link>
          <div className="records-breadcrumb">{kind === "quotation" ? "Sales" : "Finance"} <span>/</span> New {kind}</div>
          <h1>{config.title}</h1>
          <p>{kind === "receipt" ? "Record a customer payment and provide a clear confirmation." : "Build a polished customer-ready document with clear line items and terms."}</p>
        </div>
        <button className="button-secondary" onClick={() => setPreview((value) => !value)} type="button"><Icon name="invoice" size={15} />{preview ? "Edit document" : "Preview"}</button>
      </div>

      <form className="document-editor-layout" onSubmit={(event) => {
        event.preventDefault();
        saveDocument(kind === "quotation" ? "Sent" : kind === "invoice" ? "Sent" : "Issued");
      }}>
        {kind === "receipt" ? (
          <section className="records-surface document-editor-form">
            <div className="document-form-section">
              <div className="detail-section-heading"><div><h2>Payment details</h2><p>Enter the payment information from your customer.</p></div></div>
              <div className="document-fields-grid">
                <label className="form-field form-field-full"><span>Customer <b>*</b></span><select onChange={(event) => selectCustomer(event.target.value)} value={customer}>{customers.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
                <label className="form-field"><span>Receipt number</span><input value={latestNumber} readOnly /></label>
                <label className="form-field"><span>Payment date</span><input onChange={(event) => setIssueDate(event.target.value)} type="date" value={issueDate} /></label>
                <label className="form-field"><span>Amount received <b>*</b></span><div className="currency-input"><span>$</span><input min="0.01" onChange={(event) => setReceiptAmount(Number(event.target.value) || 0)} required step="0.01" type="number" value={receiptAmount || ""} /></div></label>
                <label className="form-field"><span>Payment method</span><select onChange={(event) => setPaymentMethod(event.target.value)} value={paymentMethod}><option>Bank transfer</option><option>Card</option><option>Cash</option><option>Check</option><option>Other</option></select></label>
                <label className="form-field form-field-full"><span>Related invoice</span><select onChange={(event) => setRelatedInvoice(event.target.value)} value={relatedInvoice}><option value="INV-DEMO">INV-DEMO · Northstar Studio</option><option value="">Not linked to an invoice</option></select></label>
                <label className="form-field form-field-full"><span>Transaction / reference number</span><input name="transaction" onChange={(event) => setReference(event.target.value)} placeholder="e.g. TXN-884921" value={reference} /></label>
                <label className="form-field form-field-full"><span>Notes</span><textarea onChange={(event) => setNotes(event.target.value)} placeholder="Optional payment notes..." rows={3} value={notes} /></label>
              </div>
            </div>
            <div className="document-editor-actions">
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button-secondary" onClick={() => window.print()} type="button"><Icon name="invoice" size={15} />Print / download</button>
              <button className="button-primary" disabled={saving} type="submit"><Icon name="check" size={15} />{saving ? "Saving..." : "Issue receipt"}</button>
            </div>
          </section>
        ) : (
          <section className="records-surface document-editor-form">
            <div className="document-form-section">
              <div className="detail-section-heading"><div><h2>Customer & document</h2><p>Recipient and reference information.</p></div></div>
              <div className="document-fields-grid">
                <label className="form-field"><span>Customer <b>*</b></span><select onChange={(event) => selectCustomer(event.target.value)} value={customer}>{customers.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
                <label className="form-field"><span>Contact</span><input onChange={(event) => setContactName(event.target.value)} value={contactName} /></label>
                <label className="form-field"><span>Email</span><input onChange={(event) => setContactEmail(event.target.value)} type="email" value={contactEmail} /></label>
                <label className="form-field"><span>Phone</span><input onChange={(event) => setContactPhone(event.target.value)} type="tel" value={contactPhone} /></label>
                <label className="form-field"><span>{kind === "quotation" ? "Quotation number" : "Invoice number"}</span><input readOnly value={latestNumber} /></label>
                <label className="form-field"><span>Reference</span><input onChange={(event) => setReference(event.target.value)} placeholder="Optional reference" value={reference} /></label>
                <label className="form-field"><span>{kind === "quotation" ? "Quotation date" : "Invoice date"}</span><input onChange={(event) => setIssueDate(event.target.value)} type="date" value={issueDate} /></label>
                <label className="form-field"><span>{kind === "quotation" ? "Expiry date" : "Due date"}</span><input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label>
              </div>
            </div>

            <div className="document-form-section line-items-section">
              <div className="detail-section-heading"><div><h2>Products & services</h2><p>Set quantities, pricing, discount, and tax for each item.</p></div><button className="button-secondary add-line-button" onClick={() => setLineItems((items) => [...items, defaultLine()])} type="button"><Icon name="plus" size={14} />Add line item</button></div>
              <div className="line-items-table-wrap"><table className="line-items-table"><thead><tr><th>Item / description</th><th>Qty</th><th>Unit price</th><th>Discount %</th><th>Tax %</th><th>Total</th><th /></tr></thead>
                <tbody>{lineItems.map((item) => <tr key={item.id}>
                  <td><input aria-label="Product or service" onChange={(event) => updateLine(item.id, "name", event.target.value)} placeholder="Service or product" required value={item.name} /><input aria-label="Line description" className="line-item-description" onChange={(event) => updateLine(item.id, "description", event.target.value)} placeholder="Description (optional)" value={item.description} /></td>
                  <td><input aria-label="Quantity" min="0.01" onChange={(event) => updateLine(item.id, "quantity", event.target.value)} step="0.01" type="number" value={item.quantity} /></td>
                  <td><input aria-label="Unit price" min="0" onChange={(event) => updateLine(item.id, "unitPrice", event.target.value)} step="0.01" type="number" value={item.unitPrice} /></td>
                  <td><input aria-label="Discount percent" max="100" min="0" onChange={(event) => updateLine(item.id, "discount", event.target.value)} type="number" value={item.discount} /></td>
                  <td><input aria-label="Tax percent" min="0" onChange={(event) => updateLine(item.id, "tax", event.target.value)} type="number" value={item.tax} /></td>
                  <td className="line-item-total">{money.format(item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + item.tax / 100))}</td>
                  <td><button aria-label="Remove line item" className="remove-line-button" disabled={lineItems.length === 1} onClick={() => setLineItems((items) => items.filter((line) => line.id !== item.id))} type="button">×</button></td>
                </tr>)}</tbody>
              </table></div>
            </div>

            <div className="document-form-section document-bottom-fields">
              <div className="document-fields-grid">
                <label className="form-field"><span>Notes</span><textarea onChange={(event) => setNotes(event.target.value)} placeholder="A note visible to your customer..." rows={3} value={notes} /></label>
                <label className="form-field"><span>{kind === "invoice" ? "Payment terms" : "Terms & conditions"}</span><textarea onChange={(event) => setTerms(event.target.value)} rows={3} value={terms} /></label>
              </div>
            </div>
            <div className="document-editor-actions">
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="document-editor-action-buttons">
                <button className="button-secondary" disabled={saving} onClick={() => saveDocument("Draft")} type="button">Save draft</button>
                <button className="button-secondary" onClick={() => setPreview((value) => !value)} type="button">Preview</button>
                {kind === "invoice" && <button className="button-secondary" onClick={() => window.print()} type="button"><Icon name="invoice" size={14} />Print / download</button>}
                <button className="button-primary" disabled={saving} type="submit"><Icon name={kind === "quotation" ? "arrowUpRight" : "invoice"} size={15} />{saving ? "Saving..." : config.action}</button>
              </div>
            </div>
          </section>
        )}

        <aside className={`document-preview-panel${preview ? " is-previewing" : ""}`}>
          <div className="document-preview-header"><strong>{kind === "receipt" ? "Receipt preview" : `${kind === "quotation" ? "Quotation" : "Invoice"} preview`}</strong><span>Live preview</span></div>
          <div className="business-document-preview">
            <div className="preview-brand-row"><span className="preview-brand-mark">R</span><span><strong>RanzomTech</strong><small>Business services</small></span><b>{kind === "receipt" ? "RECEIPT" : kind === "quotation" ? "QUOTATION" : "INVOICE"}</b></div>
            <div className="preview-document-number">{latestNumber}</div>
            <div className="preview-parties"><div><small>Bill to</small><strong>{customerInfo.name}</strong><span>{contactName}</span><span>{contactEmail}</span>{contactPhone && <span>{contactPhone}</span>}</div><div><small>{kind === "receipt" ? "Payment date" : "Date"}</small><strong>{displayDate(issueDate)}</strong><small>{kind === "receipt" ? "Reference" : kind === "quotation" ? "Valid until" : "Due date"}</small><span>{kind === "receipt" ? (reference || "—") : displayDate(dueDate)}</span>{kind !== "receipt" && reference && <><small>Reference</small><span>{reference}</span></>}</div></div>
            {kind === "receipt" ? (
              <div className="receipt-preview-amount"><small>Amount received</small><strong>{money.format(receiptAmount)}</strong><span>{paymentMethod}</span></div>
            ) : (
              <>
                <div className="preview-line-items"><div className="preview-line-heading"><span>Description</span><span>Amount</span></div>{lineItems.map((item) => <div className="preview-line" key={item.id}><span>{item.name || "Product or service"}<small>{item.description || `${item.quantity} × ${money.format(item.unitPrice)}`}</small></span><strong>{money.format(item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + item.tax / 100))}</strong></div>)}</div>
                <div className="preview-totals"><span>Subtotal <strong>{money.format(subtotal)}</strong></span><span>Discount <strong>−{money.format(discountTotal)}</strong></span><span>Tax <strong>{money.format(taxTotal)}</strong></span><span className="preview-grand-total">Total <strong>{money.format(total)}</strong></span></div>
              </>
            )}
            {kind === "receipt" && notes ? <div className="preview-notes"><strong>Payment notes</strong><span>{notes}</span></div> : null}
            {kind !== "receipt" && notes ? <div className="preview-notes"><strong>Notes</strong><span>{notes}</span></div> : null}
            {kind !== "receipt" && terms ? <div className="preview-notes"><strong>{kind === "invoice" ? "Payment terms" : "Terms & conditions"}</strong><span>{terms}</span></div> : null}
            {kind === "receipt" && reference ? <div className="preview-notes"><strong>Transaction reference</strong><span>{reference}</span></div> : null}
            <div className="preview-footer">RanzomTech CRM · Thank you for your business</div>
          </div>
          {kind === "receipt" && <button className="button-secondary preview-print-button" onClick={() => window.print()} type="button"><Icon name="invoice" size={15} />Print / download</button>}
        </aside>
      </form>
    </div>
  );
}
