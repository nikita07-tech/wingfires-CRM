import { prisma } from "@/lib/prisma";
import { addCustomerContact } from "../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { contacts: true, sourceLead: { include: { activities: { orderBy: { createdAt: "desc" } } } } },
  });
  if (!customer) return notFound();

  return (
    <div>
      <Link href="/customers" style={{ color: "#2563eb", fontSize: 13 }}>&larr; Back to customers</Link>
      <h1 style={{ marginTop: 8 }}>{customer.companyName}</h1>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7686", marginBottom: 20 }}>{customer.customerNumber}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, color: "#6b7686", marginTop: 0 }}>Account details</h2>
          <Row k="Country" v={customer.country} />
          <Row k="Tax ID" v={customer.taxId} />
          <Row k="Billing address" v={customer.billingAddress} />
          <Row k="Fleet info" v={customer.fleetInfo} />
          <Row k="Aircraft models" v={customer.aircraftModels} />
          <Row k="Notes" v={customer.notes} />
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, color: "#6b7686", marginTop: 0 }}>Contacts</h2>
          {customer.contacts.length === 0 ? (
            <div style={{ color: "#6b7686", fontSize: 14, marginBottom: 12 }}>No contacts yet</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}>
              {customer.contacts.map((c) => (
                <li key={c.id} style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>{c.name}</strong>{c.isPrimary && " (primary)"}
                  <div style={{ color: "#6b7686", fontSize: 12 }}>{c.title} {c.email} {c.phone}</div>
                </li>
              ))}
            </ul>
          )}
          <form action={addCustomerContact} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="hidden" name="customerId" value={customer.id} />
            <input name="name" placeholder="Name" required style={smallInput} />
            <input name="title" placeholder="Title" style={smallInput} />
            <input name="email" placeholder="Email" style={smallInput} />
            <input name="phone" placeholder="Phone" style={smallInput} />
            <button type="submit" style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontSize: 13, cursor: "pointer" }}>
              Add contact
            </button>
          </form>
        </div>
      </div>

      {customer.sourceLead && (
        <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, color: "#6b7686", marginTop: 0 }}>
            History (converted from lead {customer.sourceLead.leadNumber})
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {customer.sourceLead.activities.map((a) => (
              <li key={a.id} style={{ fontSize: 13, borderLeft: "2px solid #e5e9f0", paddingLeft: 10, marginBottom: 8 }}>
                <div style={{ color: "#6b7686", fontSize: 11 }}>{a.createdAt.toLocaleString()}</div>
                {a.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", borderBottom: "1px solid #f0f2f5" }}>
      <span style={{ color: "#6b7686" }}>{k}</span>
      <span>{v || "—"}</span>
    </div>
  );
}

const smallInput: React.CSSProperties = {
  padding: 8, borderRadius: 6, border: "1px solid #e5e9f0", fontSize: 13, flex: "1 1 100px",
};
