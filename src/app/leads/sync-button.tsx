"use client";

import { useState, useTransition } from "react";
import { syncNow } from "./actions";

export default function SyncButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onClick() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await syncNow();
        setMessage(`Imported ${result.imported} new quote${result.imported === 1 ? "" : "s"} (${result.skipped} already had a lead).`);
      } catch (e: any) {
        setMessage(`Sync failed: ${e.message}`);
      }
    });
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={onClick}
        disabled={pending}
        style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #2563eb", background: "white", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
      >
        {pending ? "Syncing…" : "Sync quotes from website now"}
      </button>
      {message && <div style={{ marginTop: 8, fontSize: 13, color: "#425466" }}>{message}</div>}
    </div>
  );
}
