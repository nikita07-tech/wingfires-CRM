"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "../actions";

type Lead = { id: string; leadNumber: string; companyName: string; priority: string; status: string };
type Column = { status: string; leads: Lead[] };

export default function KanbanBoard({ columns: initial }: { columns: Column[] }) {
  const [columns, setColumns] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onDrop(targetStatus: string) {
    if (!dragging) return;
    const leadId = dragging;
    setDragging(null);

    setColumns((cols) => {
      let moved: Lead | undefined;
      const withoutLead = cols.map((c) => {
        const found = c.leads.find((l) => l.id === leadId);
        if (found) moved = found;
        return { ...c, leads: c.leads.filter((l) => l.id !== leadId) };
      });
      if (!moved) return cols;
      return withoutLead.map((c) => (c.status === targetStatus ? { ...c, leads: [{ ...moved!, status: targetStatus }, ...c.leads] } : c));
    });

    startTransition(() => updateLeadStatus(leadId, targetStatus));
  }

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
      {columns.map((col) => (
        <div
          key={col.status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(col.status)}
          style={{ minWidth: 220, flex: "0 0 220px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 10 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>{col.status.replace(/_/g, " ")}</span>
            <span>{col.leads.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
            {col.leads.map((l) => (
              <div
                key={l.id}
                draggable
                onDragStart={() => setDragging(l.id)}
                style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, cursor: "grab", fontSize: 13 }}
              >
                <div style={{ fontWeight: 600 }}>{l.companyName}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, display: "flex", justifyContent: "space-between" }}>
                  <span>{l.leadNumber}</span>
                  <span style={{ textTransform: "capitalize" }}>{l.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
