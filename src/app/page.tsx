import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [total, newCount, wonCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "WON" } }),
  ]);

  const cards = [
    { label: "Total leads", value: total },
    { label: "New leads", value: newCount },
    { label: "Won", value: wonCount },
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "white", borderRadius: 12, padding: 20, minWidth: 160, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, color: "#6b7686", textTransform: "uppercase" }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>
      <Link href="/leads" style={{ color: "#2563eb" }}>Go to Leads →</Link>
      <p style={{ color: "#6b7686", fontSize: 13, marginTop: 24 }}>
        More dashboard widgets (RFQ pipeline, revenue, conversion rates) get added
        once those modules exist — see the README for the build roadmap.
      </p>
    </div>
  );
}