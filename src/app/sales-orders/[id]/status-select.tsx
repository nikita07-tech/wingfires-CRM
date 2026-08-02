"use client";

import { updateSalesOrderStatus } from "../actions";

export default function StatusSelect({ orderId, status, statuses }: { orderId: string; status: string; statuses: string[] }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateSalesOrderStatus(orderId, e.target.value)}
      className="input"
      style={{ textTransform: "capitalize" }}
    >
      {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
    </select>
  );
}
