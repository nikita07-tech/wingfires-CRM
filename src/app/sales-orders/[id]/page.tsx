import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generateInvoice, updateSalesOrderStatus, updatePurchaseOrderStatus } from "../actions";
import StatusSelect from "./status-select";
import PoStatusSelect from "./po-status-select";

const STATUSES = ["PENDING", "ORDERED", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED"];

export default async function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.salesOrder.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      quotation: { include: { items: true } },
      purchaseOrders: { include: { vendor: true } },
      invoices: true,
    },
  });
  if (!order) return notFound();

  const total = order.quotation.subtotal + order.quotation.tax + order.quotation.freight;

  return (
    <div>
      <Link href="/sales-orders" style={{ color: "var(--accent)", fontSize: 13 }}>&larr; Back to sales orders</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div>
          <h1 style={{ margin: 0 }}>{order.orderNumber}</h1>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{order.customer.companyName} · from <Link href={`/quotations/${order.quotationId}`} style={{ color: "var(--accent)" }}>{order.quotation.quotationNumber}</Link></div>
        </div>
        <StatusSelect orderId={order.id} status={order.status} statuses={STATUSES} />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Order value</h2>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{order.quotation.currency} {total.toFixed(2)}</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Purchase orders (auto-created per vendor)</h2>
        {order.purchaseOrders.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No purchase orders were generated for this sales order.</div>
        ) : (
          <table>
            <thead><tr><th>PO #</th><th>Vendor</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {order.purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{po.poNumber}</td>
                  <td>{po.vendor.companyName}</td>
                  <td>{po.currency} {po.total.toFixed(2)}</td>
                  <td><PoStatusSelect poId={po.id} status={po.status} statuses={STATUSES} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Invoice</h2>
        {order.invoices.length > 0 ? (
          <Link href={`/invoices/${order.invoices[0].id}`} style={{ color: "var(--accent)" }}>
            View invoice {order.invoices[0].invoiceNumber} →
          </Link>
        ) : (
          <form action={generateInvoice.bind(null, order.id)}>
            <button type="submit" className="btn-primary">Generate &amp; send invoice now</button>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>
              This creates the invoice with Wing Fires branding, a PDF download, and emails it to the customer's primary contact automatically (if an email service is connected).
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
