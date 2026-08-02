"use client";

import { useState, useTransition } from "react";
import { resendInvoiceEmail } from "../actions";

export default function ResendButton({ invoiceId }: { invoiceId: string }) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <button
      className="btn-primary"
      disabled={pending}
      onClick={() => startTransition(async () => { await resendInvoiceEmail(invoiceId); setSent(true); })}
    >
      {pending ? "Sending…" : sent ? "Sent ✓" : "Email to customer"}
    </button>
  );
}
