import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PayForm from "./pay-form";
import ResendButton from "./resend-button";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { customer: true, items: true, salesOrder: { include: { quotation: { include: { rfq: true } } } } },
  });
  if (!invoice) return notFound();

  const total = invoice.subtotal + invoice.tax + invoice.freight;
  const balance = total - invoice.amountPaid;

  return (
    <div>
      <Link href="/invoices" style={{ color: "var(--accent)", fontSize: 13 }}>&larr; Back to invoices</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0 }}>{invoice.invoiceNumber}</h1>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{invoice.customer.companyName}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`/invoices/${invoice.id}/pdf`} target="_blank" className="btn-outline" style={{ textDecoration: "none" }}>Download PDF</a>
          <ResendButton invoiceId={invoice.id} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead>
          <tbody>
            {invoice.items.map((i) => (
              <tr key={i.id}>
                <td>{i.description}</td><td>{i.quantity}</td>
                <td>{invoice.currency} {i.unitPrice.toFixed(2)}</td>
                <td>{invoice.currency} {(i.unitPrice * i.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, marginLeft: "auto", width: 260 }}>
          <Row label="Subtotal" value={invoice.subtotal} currency={invoice.currency} />
          <Row label="Tax" value={invoice.tax} currency={invoice.currency} />
          <Row label="Freight" value={invoice.freight} currency={invoice.currency} />
          <Row label="Total" value={total} currency={invoice.currency} bold />
          <Row label="Paid" value={invoice.amountPaid} currency={invoice.currency} />
          <Row label="Balance due" value={balance} currency={invoice.currency} bold />
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
          Status: <strong style={{ color: "var(--text)" }}>{invoice.status.replace(/_/g, " ")}</strong>
          {invoice.dueDate && <> · Due {invoice.dueDate.toLocaleDateString()}</>}
          {invoice.paymentTerms && <> · Terms: {invoice.paymentTerms}</>}
        </div>
      </div>

      {balance > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Record a payment</h2>
          <PayForm invoiceId={invoice.id} maxAmount={balance} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, currency, bold }: { label: string; value: number; currency: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", fontWeight: bold ? 700 : 400, borderTop: bold ? "1px solid var(--border)" : undefined }}>
      <span>{label}</span><span>{currency} {value.toFixed(2)}</span>
    </div>
  );
}
