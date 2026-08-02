import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SalesOrdersPage() {
  const orders = await prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, invoices: true, purchaseOrders: true },
  });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Sales Orders</h1>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>Created automatically whenever a quotation is accepted.</p>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>Purchase orders</th><th>Invoice</th><th>Created</th></tr></thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No sales orders yet — accept a vendor quote on an RFQ, then accept the resulting quotation.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}><Link href={`/sales-orders/${o.id}`} style={{ color: "var(--accent)" }}>{o.orderNumber}</Link></td>
                  <td>{o.customer.companyName}</td>
                  <td><span className="badge" style={{ background: "var(--success-bg)", color: "var(--success)" }}>{o.status.replace(/_/g, " ").toLowerCase()}</span></td>
                  <td>{o.purchaseOrders.length}</td>
                  <td>{o.invoices.length > 0 ? <Link href={`/invoices/${o.invoices[0].id}`} style={{ color: "var(--accent)" }}>{o.invoices[0].invoiceNumber}</Link> : "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{o.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
