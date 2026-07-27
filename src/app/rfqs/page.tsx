import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createRfq } from "./actions";

export default async function RfqsPage() {
  const [rfqs, customers] = await Promise.all([
    prisma.rfq.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true, items: true } }),
    prisma.customer.findMany({ orderBy: { companyName: "asc" } }),
  ]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>RFQs</h1>

      <form action={createRfq} style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <select name="customerId" required style={inputStyle}>
          <option value="">Select customer *</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
        </select>
        <input name="aircraftModel" placeholder="Aircraft model" style={inputStyle} />
        <input name="needByDate" type="date" style={inputStyle} />
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="isAog" /> AOG (urgent)
        </label>
        <textarea
          name="items"
          placeholder={"One part per line: partNumber, description, quantity, condition\ne.g. 123-456, Fuel pump, 2, Serviceable"}
          rows={4}
          style={{ ...inputStyle, gridColumn: "span 2" }}
        />
        <textarea name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 2" }} rows={2} />
        <button type="submit" style={{ gridColumn: "span 2", padding: 12, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
          Create RFQ
        </button>
      </form>

      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <table>
          <thead>
            <tr><th>RFQ #</th><th>Customer</th><th>Items</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {rfqs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#6b7686" }}>No RFQs yet — create one above</td></tr>
            ) : (
              rfqs.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                    <Link href={`/rfqs/${r.id}`} style={{ color: "#2563eb" }}>{r.rfqNumber}</Link>
                    {r.isAog && <span style={{ marginLeft: 6, fontSize: 10, background: "#fee2e2", color: "#b91c1c", padding: "2px 6px", borderRadius: 4 }}>AOG</span>}
                  </td>
                  <td>{r.customer.companyName}</td>
                  <td>{r.items.length} part{r.items.length === 1 ? "" : "s"}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.status.replace(/_/g, " ").toLowerCase()}</td>
                  <td style={{ color: "#6b7686" }}>{r.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 10, borderRadius: 8, border: "1px solid #e5e9f0", fontSize: 14,
};
