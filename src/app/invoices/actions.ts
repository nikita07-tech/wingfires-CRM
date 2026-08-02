"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail, emailShell } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function markInvoicePaid(invoiceId: string, amount: number) {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  const total = invoice.subtotal + invoice.tax + invoice.freight;
  const newAmountPaid = invoice.amountPaid + amount;
  const status = newAmountPaid >= total ? "PAID" : "PARTIALLY_PAID";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { amountPaid: newAmountPaid, status, paidAt: status === "PAID" ? new Date() : null },
  });

  await prisma.automationLog.create({
    data: { entityType: "invoice", entityId: invoiceId, action: "payment_recorded", detail: `Recorded payment of ${amount}, status now ${status}`, systemGenerated: false },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function resendInvoiceEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { customer: { include: { contacts: true } } },
  });
  const total = invoice.subtotal + invoice.tax + invoice.freight;
  const primaryEmail = invoice.customer.contacts.find((c) => c.isPrimary)?.email || invoice.customer.contacts[0]?.email;

  if (primaryEmail) {
    await sendEmail({
      to: primaryEmail,
      subject: `Invoice ${invoice.invoiceNumber} from Wing Fires`,
      html: emailShell(
        `Invoice ${invoice.invoiceNumber}`,
        `<p>Dear ${invoice.customer.companyName},</p><p>Total due: <strong>${invoice.currency} ${total.toFixed(2)}</strong>, due ${invoice.dueDate?.toLocaleDateString() ?? "on receipt"}.</p>`
      ),
    });
  }

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: invoice.status === "DRAFT" ? "SENT" : invoice.status, sentAt: new Date() } });
  await prisma.automationLog.create({
    data: { entityType: "invoice", entityId: invoiceId, action: "email_sent", detail: `Invoice emailed to ${primaryEmail ?? "no contact on file"}` },
  });

  revalidatePath(`/invoices/${invoiceId}`);
}
