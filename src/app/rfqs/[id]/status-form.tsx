"use client";

import { updateRfqStatus } from "../actions";

export default function StatusForm({ rfqId, status, statuses }: { rfqId: string; status: string; statuses: string[] }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateRfqStatus(rfqId, e.target.value)}
      style={{ padding: 8, borderRadius: 8, border: "1px solid #e5e9f0", fontSize: 13, textTransform: "capitalize" }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
      ))}
    </select>
  );
}
