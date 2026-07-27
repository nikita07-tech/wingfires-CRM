import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createCustomer } from "./actions";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { contacts: true },
  });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Customers</h1>

      <form action={createCustomer} style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input name="companyName" placeholder="Company name *" required style={inputStyle} />
        <input name="country" placeholder="Country" style={inputStyle} />
        <input name="taxId" placeholder="Tax ID" style={inputStyle} />
        <input name="billingAddress" placeholder="Billing address" style={{ ...inputStyle, gridColumn: "span 2" }} />
        <input name="aircraftModels" placeholder="Aircraft models" style={inputStyle} />
        <input name="fleetInfo" placeholder="Fleet info" style={{ ...inputStyle, gridColumn: "span 2" }} />
        <textarea name="notes" placeholder="Notes" style={inputStyle} rows={2} />
        <button type="submit" style={{ gridColumn: "span 3", padding: 12, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
          Add customer
        </button>
      </form>

      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <table>
          <thead>
            <tr>
              <th>Customer #</th><th>Company</th><th>Country</th><th>Contacts</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#6b7686" }}>No customers yet — add one above, or convert a won Lead</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{c.customerNumber}</td>
                  <td><Link href={`/customers/${c.id}`} style={{ color: "#2563eb" }}>{c.companyName}</Link></td>
                  <td>{c.country}</td>
                  <td>{c.contacts.length}</td>
                  <td style={{ color: "#6b7686" }}>{c.createdAt.toLocaleDateString()}</td>
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
