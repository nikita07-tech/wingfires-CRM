import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "var(--text-muted)", SENT: "var(--accent)", VIEWED: "#7c3aed", PAID: "var(--success)",
  PARTIALLY_PAID: "var(--warning)", OVERDUE: "var(--danger)", CANCELLED: "var(--text-muted)", REFUNDED: "var(--text-muted)",
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true } });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Invoices</h1>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Total</th><th>Paid</th><th>Status</th><th>Due</th></tr></thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No invoices yet — generate one from a sales order.</td></tr>
            ) : (
              invoices.map((inv) => {
                const total = inv.subtotal + inv.tax + inv.freight;
                return (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}><Link href={`/invoices/${inv.id}`} style={{ color: "var(--accent)" }}>{inv.invoiceNumber}</Link></td>
                    <td>{inv.customer.companyName}</td>
                    <td>{inv.currency} {total.toFixed(2)}</td>
                    <td>{inv.currency} {inv.amountPaid.toFixed(2)}</td>
                    <td><span style={{ color: STATUS_STYLE[inv.status] }}>{inv.status.replace(/_/g, " ")}</span></td>
                    <td style={{ color: "var(--text-muted)" }}>{inv.dueDate ? inv.dueDate.toLocaleDateString() : "—"}</td>
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
