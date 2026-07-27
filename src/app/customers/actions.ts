"use server";

import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
  const customerNumber = await nextNumber("customer");
  await prisma.customer.create({
    data: {
      customerNumber,
      companyName: String(formData.get("companyName") || ""),
      taxId: String(formData.get("taxId") || "") || null,
      country: String(formData.get("country") || "") || null,
      billingAddress: String(formData.get("billingAddress") || "") || null,
      fleetInfo: String(formData.get("fleetInfo") || "") || null,
      aircraftModels: String(formData.get("aircraftModels") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath("/customers");
}

// Converts a WON lead into a real customer, carrying over its info,
// and links the lead to the new customer so history isn't lost.
export async function convertLeadToCustomer(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  if (lead.convertedCustomerId) return; // already converted

  const customerNumber = await nextNumber("customer");
  const customer = await prisma.customer.create({
    data: {
      customerNumber,
      companyName: lead.companyName,
      country: lead.country,
      aircraftModels: lead.aircraftTypes,
      notes: lead.notes,
      contacts: lead.contactName
        ? { create: [{ name: lead.contactName, email: lead.email, phone: lead.phone, isPrimary: true }] }
        : undefined,
    },
  });

  await prisma.lead.update({ where: { id: lead.id }, data: { convertedCustomerId: customer.id } });
  await prisma.leadActivity.create({
    data: { leadId: lead.id, action: "converted", detail: `Converted to customer ${customer.customerNumber}` },
  });

  revalidatePath("/leads");
  revalidatePath("/customers");
}

export async function addCustomerContact(formData: FormData) {
  const customerId = String(formData.get("customerId"));
  await prisma.customerContact.create({
    data: {
      customerId,
      name: String(formData.get("name") || ""),
      title: String(formData.get("title") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
    },
  });
  revalidatePath(`/customers/${customerId}`);
}
