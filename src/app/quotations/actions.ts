"use server";

import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuotationFromRfq(formData: FormData) {
  const rfqId = String(formData.get("rfqId"));
  const customerId = String(formData.get("customerId"));
  const vendorQuoteId = String(formData.get("vendorQuoteId"));
  const subtotal = parseFloat(String(formData.get("subtotal") || "0"));
  const tax = parseFloat(String(formData.get("tax") || "0"));
  const freight = parseFloat(String(formData.get("freight") || "0"));

  const rfq = await prisma.rfq.findUniqueOrThrow({ where: { id: rfqId }, include: { items: true } });
  const quotationNumber = await nextNumber("quotation");

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber,
      rfqId,
      customerId,
      subtotal,
      tax,
      freight,
      paymentTerms: String(formData.get("paymentTerms") || "") || null,
      validUntil: formData.get("validUntil") ? new Date(String(formData.get("validUntil"))) : null,
      notes: String(formData.get("notes") || "") || null,
      items: {
        create: rfq.items.map((item) => ({
          vendorQuoteId,
          description: `${item.partNumber}${item.description ? " — " + item.description : ""}`,
          quantity: item.quantity,
          unitPrice: item.quantity > 0 ? subtotal / rfq.items.reduce((s, i) => s + i.quantity, 0) : subtotal,
        })),
      },
    },
  });

  revalidatePath(`/rfqs/${rfqId}`);
  redirect(`/quotations/${quotation.id}`);
}

export async function updateQuotationStatus(quotationId: string, status: string) {
  const before = await prisma.quotation.findUniqueOrThrow({ where: { id: quotationId }, include: { customer: true } });
  await prisma.quotation.update({ where: { id: quotationId }, data: { status: status as any } });

  await prisma.automationLog.create({
    data: { entityType: "quotation", entityId: quotationId, action: "status_changed", detail: `Status changed to ${status}`, systemGenerated: false },
  });

  // In-app + email notification whenever a quotation is viewed/accepted/rejected/expired
  if (["VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"].includes(status)) {
    await prisma.notification.create({
      data: { title: `Quotation ${before.quotationNumber} ${status.toLowerCase()}`, entityType: "quotation", entityId: quotationId },
    });
  }

  // Automatic workflow: accepting a quotation creates a Sales Order and one
  // Purchase Order per vendor involved, with no manual data re-entry.
  if (status === "ACCEPTED") {
    await autoCreateOrdersFromQuotation(quotationId);
  }

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${quotationId}`);
}

async function autoCreateOrdersFromQuotation(quotationId: string) {
  const existing = await prisma.salesOrder.findUnique({ where: { quotationId } });
  if (existing) return; // already converted, don't duplicate

  const quotation = await prisma.quotation.findUniqueOrThrow({
    where: { id: quotationId },
    include: { items: { include: { vendorQuote: { include: { vendor: true } } } }, customer: true },
  });

  const orderNumber = await nextNumber("sales_order");
  const salesOrder = await prisma.salesOrder.create({
    data: { orderNumber, quotationId, customerId: quotation.customerId },
  });

  await prisma.automationLog.create({
    data: { entityType: "sales_order", entityId: salesOrder.id, action: "created", detail: `Auto-created from quotation ${quotation.quotationNumber}` },
  });

  // Group line items by vendor so each vendor gets exactly one PO
  const byVendor = new Map<string, { vendorId: string; total: number }>();
  for (const item of quotation.items) {
    const vendorId = item.vendorQuote?.vendorId;
    if (!vendorId) continue;
    const lineTotal = item.unitPrice * item.quantity;
    const existingEntry = byVendor.get(vendorId);
    byVendor.set(vendorId, { vendorId, total: (existingEntry?.total || 0) + lineTotal });
  }

  for (const { vendorId, total } of byVendor.values()) {
    const poNumber = await nextNumber("purchase_order");
    const po = await prisma.purchaseOrder.create({
      data: { poNumber, salesOrderId: salesOrder.id, vendorId, total, currency: quotation.currency },
    });
    await prisma.automationLog.create({
      data: { entityType: "purchase_order", entityId: po.id, action: "created", detail: `Auto-created for sales order ${salesOrder.orderNumber}` },
    });
  }

  await prisma.notification.create({
    data: { title: `Sales Order ${salesOrder.orderNumber} created automatically`, entityType: "sales_order", entityId: salesOrder.id },
  });
}
