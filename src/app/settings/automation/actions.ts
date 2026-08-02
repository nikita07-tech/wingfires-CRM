"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAutomationSettings(formData: FormData) {
  await prisma.automationSettings.upsert({
    where: { id: "default" },
    update: {
      defaultTaxRate: parseFloat(String(formData.get("defaultTaxRate") || "0")),
      defaultPaymentTerms: String(formData.get("defaultPaymentTerms") || "Net 30"),
      quotationValidityDays: parseInt(String(formData.get("quotationValidityDays") || "14"), 10),
      invoiceDueDays: parseInt(String(formData.get("invoiceDueDays") || "30"), 10),
      reminderDaysBeforeExpiry: parseInt(String(formData.get("reminderDaysBeforeExpiry") || "3"), 10),
      companyBankDetails: String(formData.get("companyBankDetails") || "") || null,
      companyContactInfo: String(formData.get("companyContactInfo") || "") || null,
    },
    create: {
      id: "default",
      defaultTaxRate: parseFloat(String(formData.get("defaultTaxRate") || "0")),
      defaultPaymentTerms: String(formData.get("defaultPaymentTerms") || "Net 30"),
      quotationValidityDays: parseInt(String(formData.get("quotationValidityDays") || "14"), 10),
      invoiceDueDays: parseInt(String(formData.get("invoiceDueDays") || "30"), 10),
      reminderDaysBeforeExpiry: parseInt(String(formData.get("reminderDaysBeforeExpiry") || "3"), 10),
      companyBankDetails: String(formData.get("companyBankDetails") || "") || null,
      companyContactInfo: String(formData.get("companyContactInfo") || "") || null,
    },
  });
  revalidatePath("/settings/automation");
}

export async function updateNumberingSequence(formData: FormData) {
  const key = String(formData.get("key"));
  await prisma.numberingSequence.update({
    where: { key },
    data: {
      prefix: String(formData.get("prefix") || ""),
      nextValue: parseInt(String(formData.get("nextValue") || "1"), 10),
      padding: parseInt(String(formData.get("padding") || "5"), 10),
    },
  });
  revalidatePath("/settings/automation");
}
