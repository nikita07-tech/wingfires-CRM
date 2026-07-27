"use client";

import { updateQuotationStatus } from "../actions";

const STATUSES = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"];

export default function StatusSelect({ quotationId, status }: { quotationId: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateQuotationStatus(quotationId, e.target.value)}
      style={{ padding: 8, borderRadius: 8, border: "1px solid #e5e9f0", fontSize: 13 }}
    >
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
