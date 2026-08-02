"use server";

import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { sendEmail, emailShell } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSalesOrderStatus(orderId: string, status: string) {
  await prisma.salesOrder.update({ where: { id: orderId }, data: { status: status as any } });
  await prisma.automationLog.create({
    data: { entityType: "sales_order", entityId: orderId, action: "status_changed", detail: `Status changed to ${status}`, systemGenerated: false },
  });
  revalidatePath("/sales-orders");
  revalidatePath(`/sales-orders/${orderId}`);
}

export async function updatePurchaseOrderStatus(poId: string, status: string) {
  await prisma.purchaseOrder.update({ where: { id: poId }, data: { status: status as any } });
  await prisma.automationLog.create({
    data: { entityType: "purchase_order", entityId: poId, action: "status_changed", detail: `Status changed to ${status}`, systemGenerated: false },
  });
  revalidatePath("/sales-orders");
}

// The core "auto invoice" feature: generates a full invoice from the sales
// order's linked quotation, computes the due date from Automation Settings,
// stores it, and emails the customer automatically.
export async function generateInvoice(salesOrderId: string) {
  const existing = await prisma.invoice.findFirst({ where: { salesOrderId } });
  if (existing) redirect(`/invoices/${existing.id}`);

  const settings = await prisma.automationSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  const order = await prisma.salesOrder.findUniqueOrThrow({
    where: { id: salesOrderId },
    include: { customer: { include: { contacts: true } }, quotation: { include: { items: true } } },
  });

  const invoiceNumber = await nextNumber("invoice");
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + settings.invoiceDueDays);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      salesOrderId,
      customerId: order.customerId,
      subtotal: order.quotation.subtotal,
      tax: order.quotation.tax,
      freight: order.quotation.freight,
      currency: order.quotation.currency,
      paymentTerms: order.quotation.paymentTerms || settings.defaultPaymentTerms,
      dueDate,
      status: "SENT",
      sentAt: new Date(),
      items: {
        create: order.quotation.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
      },
    },
  });

  await prisma.automationLog.create({
    data: { entityType: "invoice", entityId: invoice.id, action: "generated", detail: `Auto-generated from sales order ${order.orderNumber}` },
  });
  await prisma.notification.create({
    data: { title: `Invoice ${invoice.invoiceNumber} generated and sent`, entityType: "invoice", entityId: invoice.id },
  });

  const total = invoice.subtotal + invoice.tax + invoice.freight;
  const primaryEmail = order.customer.contacts.find((c) => c.isPrimary)?.email || order.customer.contacts[0]?.email;
  if (primaryEmail) {
    await sendEmail({
      to: primaryEmail,
      subject: `Invoice ${invoice.invoiceNumber} from Wing Fires`,
      html: emailShell(
        `Invoice ${invoice.invoiceNumber}`,
        `<p>Dear ${order.customer.companyName},</p>
         <p>Please find your invoice total of <strong>${invoice.currency} ${total.toFixed(2)}</strong>, due by ${dueDate.toLocaleDateString()}.</p>
         <p>Payment terms: ${invoice.paymentTerms}</p>`
      ),
    });
  }

  revalidatePath(`/sales-orders/${salesOrderId}`);
  redirect(`/invoices/${invoice.id}`);
}
