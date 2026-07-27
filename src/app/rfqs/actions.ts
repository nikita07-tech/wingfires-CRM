"use server";

import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { revalidatePath } from "next/cache";

// Items are entered as one per line: "partNumber, description, quantity, condition"
function parseItemLines(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [partNumber, description, quantity, condition] = line.split(",").map((s) => s?.trim());
      return {
        partNumber: partNumber || "Unspecified",
        description: description || null,
        quantity: quantity ? parseInt(quantity, 10) || 1 : 1,
        condition: condition || null,
      };
    });
}

export async function createRfq(formData: FormData) {
  const rfqNumber = await nextNumber("rfq");
  const itemsRaw = String(formData.get("items") || "");

  await prisma.rfq.create({
    data: {
      rfqNumber,
      customerId: String(formData.get("customerId")),
      aircraftModel: String(formData.get("aircraftModel") || "") || null,
      isAog: formData.get("isAog") === "on",
      needByDate: formData.get("needByDate") ? new Date(String(formData.get("needByDate"))) : null,
      notes: String(formData.get("notes") || "") || null,
      items: { create: parseItemLines(itemsRaw) },
    },
  });
  revalidatePath("/rfqs");
}

export async function updateRfqStatus(rfqId: string, status: string) {
  await prisma.rfq.update({ where: { id: rfqId }, data: { status: status as any } });
  revalidatePath("/rfqs");
  revalidatePath(`/rfqs/${rfqId}`);
}

export async function addVendorQuote(formData: FormData) {
  const rfqId = String(formData.get("rfqId"));
  await prisma.vendorQuote.create({
    data: {
      rfqId,
      vendorId: String(formData.get("vendorId")),
      price: parseFloat(String(formData.get("price") || "0")),
      currency: String(formData.get("currency") || "USD"),
      leadTime: String(formData.get("leadTime") || "") || null,
      condition: String(formData.get("condition") || "") || null,
      certifications: String(formData.get("certifications") || "") || null,
      warranty: String(formData.get("warranty") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath(`/rfqs/${rfqId}`);
}

export async function markVendorQuoteAccepted(vendorQuoteId: string, rfqId: string) {
  // Only one vendor quote can be the accepted/winning one per RFQ
  await prisma.vendorQuote.updateMany({ where: { rfqId }, data: { status: "REJECTED" } });
  await prisma.vendorQuote.update({ where: { id: vendorQuoteId }, data: { status: "ACCEPTED" } });
  revalidatePath(`/rfqs/${rfqId}`);
}
