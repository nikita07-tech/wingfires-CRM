"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVendor(formData: FormData) {
  await prisma.vendor.create({
    data: {
      companyName: String(formData.get("companyName") || ""),
      contactName: String(formData.get("contactName") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      country: String(formData.get("country") || "") || null,
      faaCertified: formData.get("faaCertified") === "on",
      easaCertified: formData.get("easaCertified") === "on",
      asaCertified: formData.get("asaCertified") === "on",
      isPreferred: formData.get("isPreferred") === "on",
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath("/vendors");
}

export async function toggleVendorPreferred(vendorId: string, isPreferred: boolean) {
  await prisma.vendor.update({ where: { id: vendorId }, data: { isPreferred } });
  revalidatePath("/vendors");
}
