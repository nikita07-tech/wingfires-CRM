import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusSelect from "./status-select";

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: params.id },
    include: { customer: true, items: true, rfq: true },
  });
  if (!quotation) return notFound();

  const total = quotation.subtotal + quotation.tax + quotation.freight;

  return (
    <div>
      <Link href="/quotations" style={{ color: "#2563eb", fontSize: 13 }}>&larr; Back to quotations</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div>
          <h1 style={{ margin: 0 }}>{quotation.quotationNumber}</h1>
          <div style={{ color: "#6b7686", fontSize: 14 }}>
            {quotation.customer.companyName} · from <Link href={`/rfqs/${quotation.rfqId}`} style={{ color: "#2563eb" }}>{quotation.rfq.rfqNumber}</Link>
          </div>
        </div>
        <StatusSelect quotationId={quotation.id} status={quotation.status} />
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 20, marginTop: 20 }}>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead>
          <tbody>
            {quotation.items.map((i) => (
              <tr key={i.id}>
                <td>{i.description}</td>
                <td>{i.quantity}</td>
                <td>{quotation.currency} {i.unitPrice.toFixed(2)}</td>
                <td>{quotation.currency} {(i.unitPrice * i.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16, marginLeft: "auto", width: 260 }}>
          <Row label="Subtotal" value={quotation.subtotal} currency={quotation.currency} />
          <Row label="Tax" value={quotation.tax} currency={quotation.currency} />
          <Row label="Freight" value={quotation.freight} currency={quotation.currency} />
          <Row label="Total" value={total} currency={quotation.currency} bold />
        </div>

        {quotation.paymentTerms && <div style={{ marginTop: 16, fontSize: 13, color: "#6b7686" }}>Payment terms: {quotation.paymentTerms}</div>}
        {quotation.validUntil && <div style={{ fontSize: 13, color: "#6b7686" }}>Valid until: {quotation.validUntil.toLocaleDateString()}</div>}
        {quotation.notes && <div style={{ fontSize: 13, color: "#6b7686", marginTop: 4 }}>Notes: {quotation.notes}</div>}
      </div>

      <p style={{ color: "#6b7686", fontSize: 12, marginTop: 16 }}>
        PDF export and emailing this quotation to the customer isn't built yet —
        that needs an email service connected (Phase 4). For now this is your
        internal record; you can copy these details into an email manually.
      </p>
    </div>
  );
}

function Row({ label, value, currency, bold }: { label: string; value: number; currency: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", fontWeight: bold ? 700 : 400, borderTop: bold ? "1px solid #e5e9f0" : undefined }}>
      <span>{label}</span><span>{currency} {value.toFixed(2)}</span>
    </div>
  );
}
