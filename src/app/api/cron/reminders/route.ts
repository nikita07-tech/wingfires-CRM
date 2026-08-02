import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailShell } from "@/lib/email";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.automationSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  const now = new Date();
  let overdueMarked = 0;
  let expiryReminders = 0;

  // 1. Mark unpaid invoices past their due date as OVERDUE
  const overdueInvoices = await prisma.invoice.findMany({
    where: { dueDate: { lt: now }, status: { in: ["SENT", "VIEWED", "PARTIALLY_PAID"] } },
    include: { customer: { include: { contacts: true } } },
  });
  for (const inv of overdueInvoices) {
    await prisma.invoice.update({ where: { id: inv.id }, data: { status: "OVERDUE" } });
    await prisma.automationLog.create({
      data: { entityType: "invoice", entityId: inv.id, action: "marked_overdue", detail: "Automatically marked overdue by daily reminder job" },
    });
    await prisma.notification.create({
      data: { title: `Invoice ${inv.invoiceNumber} is overdue`, entityType: "invoice", entityId: inv.id },
    });
    overdueMarked++;
  }

  // 2. Remind customers whose quotations are about to expire
  const reminderWindow = new Date(now);
  reminderWindow.setDate(reminderWindow.getDate() + settings.reminderDaysBeforeExpiry);

  const expiringQuotations = await prisma.quotation.findMany({
    where: { status: "SENT", validUntil: { gte: now, lte: reminderWindow } },
    include: { customer: { include: { contacts: true } } },
  });
  for (const q of expiringQuotations) {
    const primaryEmail = q.customer.contacts.find((c) => c.isPrimary)?.email || q.customer.contacts[0]?.email;
    if (primaryEmail) {
      await sendEmail({
        to: primaryEmail,
        subject: `Reminder: Quotation ${q.quotationNumber} expires soon`,
        html: emailShell(
          "Your quotation is expiring soon",
          `<p>Dear ${q.customer.companyName},</p><p>Quotation <strong>${q.quotationNumber}</strong> is valid until ${q.validUntil?.toLocaleDateString()}. Please let us know if you'd like to proceed.</p>`
        ),
      });
    }
    await prisma.automationLog.create({
      data: { entityType: "quotation", entityId: q.id, action: "expiry_reminder_sent", detail: `Reminder sent ahead of expiry on ${q.validUntil?.toLocaleDateString()}` },
    });
    await prisma.notification.create({
      data: { title: `Quotation ${q.quotationNumber} expires soon — follow up`, entityType: "quotation", entityId: q.id },
    });
    expiryReminders++;
  }

  // 3. Expire quotations whose validity date has fully passed
  const expiredQuotations = await prisma.quotation.updateMany({
    where: { status: "SENT", validUntil: { lt: now } },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    ok: true,
    overdueInvoicesMarked: overdueMarked,
    expiryRemindersSent: expiryReminders,
    quotationsExpired: expiredQuotations.count,
  });
}
