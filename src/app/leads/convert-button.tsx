"use client";

import { useTransition } from "react";
import { convertLeadToCustomer } from "../customers/actions";

export default function ConvertButton({ leadId, status, alreadyConverted }: { leadId: string; status: string; alreadyConverted: boolean }) {
  const [pending, startTransition] = useTransition();

  if (alreadyConverted) {
    return <span style={{ fontSize: 12, color: "#16a34a" }}>✓ Converted</span>;
  }
  if (status !== "WON") {
    return <span style={{ fontSize: 12, color: "#b0b8c4" }}>—</span>;
  }

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => convertLeadToCustomer(leadId))}
      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "white", color: "#2563eb", fontSize: 12, cursor: "pointer" }}
    >
      {pending ? "Converting…" : "Convert to Customer"}
    </button>
  );
}
