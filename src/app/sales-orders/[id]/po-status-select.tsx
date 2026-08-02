"use client";

import { updatePurchaseOrderStatus } from "../actions";

export default function PoStatusSelect({ poId, status, statuses }: { poId: string; status: string; statuses: string[] }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updatePurchaseOrderStatus(poId, e.target.value)}
      style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, textTransform: "capitalize" }}
    >
      {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
    </select>
  );
}
