import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PurchaseOrdersPage() {
  const pos = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: true, salesOrder: { include: { customer: true } } },
  });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Purchase Orders</h1>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>One is auto-created per vendor whenever a sales order is generated.</p>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead><tr><th>PO #</th><th>Vendor</th><th>For sales order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {pos.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No purchase orders yet</td></tr>
            ) : (
              pos.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{po.poNumber}</td>
                  <td>{po.vendor.companyName}</td>
                  <td><Link href={`/sales-orders/${po.salesOrderId}`} style={{ color: "var(--accent)" }}>{po.salesOrder.orderNumber}</Link></td>
                  <td>{po.salesOrder.customer.companyName}</td>
                  <td>{po.currency} {po.total.toFixed(2)}</td>
                  <td style={{ textTransform: "capitalize" }}>{po.status.replace(/_/g, " ").toLowerCase()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
