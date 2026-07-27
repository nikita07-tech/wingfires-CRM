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
  await prisma.quotation.update({ where: { id: quotationId }, data: { status: status as any } });
  revalidatePath("/quotations");
  revalidatePath(`/quotations/${quotationId}`);
}
