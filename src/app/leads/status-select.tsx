"use client";

import { updateLeadStatus } from "./actions";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "RFQ_RECEIVED", "QUOTE_SENT", "WON", "LOST", "INACTIVE"];

export default function StatusSelect({ leadId, status }: { leadId: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateLeadStatus(leadId, e.target.value)}
      style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e9f0", fontSize: 13 }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace("_", " ")}</option>
      ))}
    </select>
  );
}
