import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "#6b7686", SENT: "#2563eb", VIEWED: "#7c3aed", ACCEPTED: "#16a34a", REJECTED: "#dc2626", EXPIRED: "#9ca3af",
};

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
  });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Quotations</h1>
      <p style={{ color: "#6b7686", fontSize: 13, marginTop: -8 }}>
        Quotations are created from an RFQ once a vendor quote is accepted — go to an RFQ's page to generate one.
      </p>

      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginTop: 16 }}>
        <table>
          <thead><tr><th>Quotation #</th><th>Customer</th><th>Total</th><th>Status</th><th>Valid until</th></tr></thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#6b7686" }}>No quotations yet</td></tr>
            ) : (
              quotations.map((q) => {
                const total = q.subtotal + q.tax + q.freight;
                return (
                  <tr key={q.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                      <Link href={`/quotations/${q.id}`} style={{ color: "#2563eb" }}>{q.quotationNumber}</Link>
                    </td>
                    <td>{q.customer.companyName}</td>
                    <td>{q.currency} {total.toFixed(2)}</td>
                    <td><span style={{ color: STATUS_STYLE[q.status] }}>{q.status}</span></td>
                    <td style={{ color: "#6b7686" }}>{q.validUntil ? q.validUntil.toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
