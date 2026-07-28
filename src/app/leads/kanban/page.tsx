import { prisma } from "@/lib/prisma";
import KanbanBoard from "./kanban-board";
import Link from "next/link";

const COLUMNS = ["NEW", "CONTACTED", "QUALIFIED", "RFQ_RECEIVED", "QUOTE_SENT", "WON", "LOST"];

export default async function LeadsKanbanPage() {
  const leads = await prisma.lead.findMany({ orderBy: { updatedAt: "desc" } });

  const columns = COLUMNS.map((status) => ({
    status,
    leads: leads.filter((l) => l.status === status),
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginTop: 0 }}>Pipeline</h1>
        <Link href="/leads" style={{ color: "var(--accent)", fontSize: 13 }}>Table view →</Link>
      </div>
      <KanbanBoard columns={columns} />
    </div>
  );
}
