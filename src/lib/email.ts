// Sends branded emails via Resend (resend.com). If RESEND_API_KEY isn't set,
// this logs to the console instead of failing — so the rest of the app
// (invoices, quotations, statuses) keeps working even before email is wired up.

type SendEmailInput = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Wing Fires <no-reply@wingfires.com>";

  if (!apiKey) {
    console.log(`[email not configured] Would send to ${to}: ${subject}`);
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Email send failed:", text);
    return { sent: false, reason: text };
  }
  return { sent: true };
}

export function emailShell(title: string, bodyHtml: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
    <div style="background: #0a1628; padding: 20px; border-radius: 12px 12px 0 0;">
      <span style="color: white; font-weight: 700; font-size: 16px;">✈️ Wing Fires</span>
    </div>
    <div style="border: 1px solid #e5e9f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
      <h2 style="margin-top: 0; color: #14213d;">${title}</h2>
      <div style="color: #334155; font-size: 14px; line-height: 1.6;">${bodyHtml}</div>
    </div>
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">Wing Fires — Certified Aircraft Parts Marketplace</p>
  </div>`;
}
