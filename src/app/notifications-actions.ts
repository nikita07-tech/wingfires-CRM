"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRecentNotifications() {
  return prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 15 });
}

export async function markNotificationRead(id: string) {
  await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  await prisma.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/");
}
