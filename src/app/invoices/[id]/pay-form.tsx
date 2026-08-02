"use client";

import { useState, useTransition } from "react";
import { markInvoicePaid } from "../actions";

export default function PayForm({ invoiceId, maxAmount }: { invoiceId: string; maxAmount: number }) {
  const [amount, setAmount] = useState(maxAmount.toFixed(2));
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => markInvoicePaid(invoiceId, parseFloat(amount)));
      }}
      style={{ display: "flex", gap: 10 }}
    >
      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" style={{ width: 160 }} />
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Recording…" : "Record payment"}</button>
    </form>
  );
}
