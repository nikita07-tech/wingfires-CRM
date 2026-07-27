import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addVendorQuote } from "../actions";
import StatusForm from "./status-form";
import AcceptButton from "./accept-button";
import CreateQuotationForm from "./create-quotation-form";

const STATUSES = ["NEW", "VENDOR_SOURCING", "AWAITING_VENDOR_QUOTE", "QUOTE_PREPARATION", "SENT", "NEGOTIATION", "WON", "LOST", "CANCELLED"];

export default async function RfqDetailPage({ params }: { params: { id: string } }) {
  const [rfq, vendors] = await Promise.all([
    prisma.rfq.findUnique({
      where: { id: params.id },
      include: { customer: true, items: true, vendorQuotes: { include: { vendor: true }, orderBy: { price: "asc" } }, quotations: true },
    }),
    prisma.vendor.findMany({ orderBy: { companyName: "asc" } }),
  ]);
  if (!rfq) return notFound();

  const acceptedQuote = rfq.vendorQuotes.find((q) => q.status === "ACCEPTED");

  return (
    <div>
      <Link href="/rfqs" style={{ color: "#2563eb", fontSize: 13 }}>&larr; Back to RFQs</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div>
          <h1 style={{ margin: 0 }}>{rfq.rfqNumber} {rfq.isAog && <span style={{ fontSize: 12, background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: 6 }}>AOG</span>}</h1>
          <div style={{ color: "#6b7686", fontSize: 14 }}>{rfq.customer.companyName}{rfq.aircraftModel && ` · ${rfq.aircraftModel}`}</div>
        </div>
        <StatusForm rfqId={rfq.id} status={rfq.status} statuses={STATUSES} />
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: 14, color: "#6b7686", marginTop: 0 }}>Requested parts</h2>
        <table>
          <thead><tr><th>Part #</th><th>Description</th><th>Qty</th><th>Condition</th></tr></thead>
          <tbody>
            {rfq.items.map((i) => (
              <tr key={i.id}><td>{i.partNumber}</td><td>{i.description}</td><td>{i.quantity}</td><td>{i.condition}</td></tr>
            ))}
          </tbody>
        </table>
        {rfq.notes && <div style={{ marginTop: 12, fontSize: 13, color: "#6b7686" }}>Notes: {rfq.notes}</div>}
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: 14, color: "#6b7686", marginTop: 0 }}>Vendor quotes (sorted by price, lowest first)</h2>
        {rfq.vendorQuotes.length === 0 ? (
          <div style={{ color: "#6b7686", fontSize: 14, marginBottom: 16 }}>No vendor quotes yet</div>
        ) : (
          <table style={{ marginBottom: 16 }}>
            <thead><tr><th>Vendor</th><th>Price</th><th>Lead time</th><th>Condition</th><th>Certs</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rfq.vendorQuotes.map((q) => (
                <tr key={q.id} style={q.status === "ACCEPTED" ? { background: "#f0fdf4" } : undefined}>
                  <td>{q.vendor.companyName}{q.vendor.isPreferred && " ★"}</td>
                  <td>{q.currency} {q.price.toFixed(2)}</td>
                  <td>{q.leadTime}</td>
                  <td>{q.condition}</td>
                  <td style={{ fontSize: 12 }}>{q.certifications}</td>
                  <td style={{ textTransform: "capitalize", fontSize: 12 }}>{q.status.toLowerCase()}</td>
                  <td>{q.status !== "ACCEPTED" && <AcceptButton vendorQuoteId={q.id} rfqId={rfq.id} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={addVendorQuote} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <input type="hidden" name="rfqId" value={rfq.id} />
          <select name="vendorId" required style={inputStyle}>
            <option value="">Select vendor *</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.companyName}</option>)}
          </select>
          <input name="price" type="number" step="0.01" placeholder="Price *" required style={inputStyle} />
          <input name="currency" placeholder="Currency (USD)" style={inputStyle} />
          <input name="leadTime" placeholder="Lead time" style={inputStyle} />
          <input name="condition" placeholder="Condition" style={inputStyle} />
          <input name="certifications" placeholder="Certifications" style={inputStyle} />
          <input name="warranty" placeholder="Warranty" style={inputStyle} />
          <input name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 2" }} />
          <button type="submit" style={{ padding: 10, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
            Add vendor quote
          </button>
        </form>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: 14, color: "#6b7686", marginTop: 0 }}>Customer quotation</h2>
        {rfq.quotations.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {rfq.quotations.map((q) => (
              <li key={q.id}>
                <Link href={`/quotations/${q.id}`} style={{ color: "#2563eb" }}>{q.quotationNumber}</Link>
                {" — "}{q.status}
              </li>
            ))}
          </ul>
        ) : acceptedQuote ? (
          <CreateQuotationForm rfqId={rfq.id} customerId={rfq.customer.id} vendorQuoteId={acceptedQuote.id} defaultPrice={acceptedQuote.price} items={rfq.items} />
        ) : (
          <div style={{ color: "#6b7686", fontSize: 14 }}>Accept a vendor quote above first to generate a customer quotation.</div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 10, borderRadius: 8, border: "1px solid #e5e9f0", fontSize: 14,
};
