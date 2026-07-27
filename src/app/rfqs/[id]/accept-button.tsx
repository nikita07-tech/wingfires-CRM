"use client";

import { useTransition } from "react";
import { markVendorQuoteAccepted } from "../actions";

export default function AcceptButton({ vendorQuoteId, rfqId }: { vendorQuoteId: string; rfqId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => markVendorQuoteAccepted(vendorQuoteId, rfqId))}
      style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #16a34a", background: "white", color: "#16a34a", fontSize: 12, cursor: "pointer" }}
    >
      {pending ? "…" : "Accept"}
    </button>
  );
}
