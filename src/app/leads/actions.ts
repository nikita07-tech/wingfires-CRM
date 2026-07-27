"use server";

import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { syncRfqsFromWebsite } from "@/lib/sync";

export async function syncNow() {
  const result = await syncRfqsFromWebsite();
  revalidatePath("/leads");
  return result;
}

export async function createLead(formData: FormData) {
  const session = await getServerSession(authOptions);
  const leadNumber = await nextNumber("lead");

  const lead = await prisma.lead.create({
    data: {
      leadNumber,
      companyName: String(formData.get("companyName") || ""),
      contactName: String(formData.get("contactName") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      country: String(formData.get("country") || "") || null,
      aircraftTypes: String(formData.get("aircraftTypes") || "") || null,
      interestedParts: String(formData.get("interestedParts") || "") || null,
      source: String(formData.get("source") || "") || null,
      priority: String(formData.get("priority") || "medium"),
      notes: String(formData.get("notes") || "") || null,
      createdById: (session?.user as any)?.id ?? null,
    },
  });

  await prisma.leadActivity.create({
    data: { leadId: lead.id, action: "created", detail: `Lead ${lead.leadNumber} created` },
  });

  revalidatePath("/leads");
}

export async function updateLeadStatus(leadId: string, status: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { status: status as any } });
  await prisma.leadActivity.create({
    data: { leadId, action: "status_changed", detail: `Status changed to ${status}` },
  });
  revalidatePath("/leads");
}
