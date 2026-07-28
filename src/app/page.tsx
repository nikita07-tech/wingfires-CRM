import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RfqPipelineChart, MonthlyTrendChart, QuotationValueChart } from "./dashboard-charts";

export default async function DashboardPage() {
  const [totalLeads, newLeads, wonLeads, totalCustomers, totalVendors, rfqsByStatus, quotationsByStatus, recentActivity, openRfqs, aogCount] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count({ where: { status: "WON" } }),
      prisma.customer.count(),
      prisma.vendor.count(),
      prisma.rfq.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.quotation.groupBy({ by: ["status"], _sum: { subtotal: true, tax: true, freight: true } }),
      prisma.leadActivity.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { lead: true } }),
      prisma.rfq.count({ where: { status: { notIn: ["WON", "LOST", "CANCELLED"] } } }),
      prisma.rfq.count({ where: { isAog: true, status: { notIn: ["WON", "LOST", "CANCELLED"] } } }),
    ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const recentRfqs = await prisma.rfq.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } });
  const monthBuckets: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthBuckets[d.toLocaleString("en", { month: "short" })] = 0;
  }
  recentRfqs.forEach((r) => {
    const key = r.createdAt.toLocaleString("en", { month: "short" });
    if (key in monthBuckets) monthBuckets[key]++;
  });
  const trendData = Object.entries(monthBuckets).map(([month, count]) => ({ month, count }));

  const pipelineData = rfqsByStatus.map((r) => ({ status: r.status.replace(/_/g, " ").toLowerCase(), count: r._count._all }));
  const quoteValueData = quotationsByStatus.map((q) => ({
    status: q.status.toLowerCase(),
    value: (q._sum.subtotal || 0) + (q._sum.tax || 0) + (q._sum.freight || 0),
  }));

  const kpis = [
    { label: "Total leads", value: totalLeads, href: "/leads" },
    { label: "New leads", value: newLeads, href: "/leads" },
    { label: "Won leads", value: wonLeads, href: "/leads" },
    { label: "Customers", value: totalCustomers, href: "/customers" },
    { label: "Vendors", value: totalVendors, href: "/vendors" },
    { label: "Open RFQs", value: openRfqs, href: "/rfqs" },
    { label: "AOG (urgent)", value: aogCount, href: "/rfqs", danger: aogCount > 0 },
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="card" style={{ minWidth: 140, textDecoration: "none", color: "inherit", borderColor: k.danger ? "var(--danger)" : undefined }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.danger ? "var(--danger)" : "var(--text)" }}>{k.value}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>RFQ pipeline by stage</h2>
          {pipelineData.length > 0 ? <RfqPipelineChart data={pipelineData} /> : <Empty text="No RFQs yet" />}
        </div>
        <div className="card">
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>RFQ volume, last 6 months</h2>
          <MonthlyTrendChart data={trendData} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16 }}>
        <div className="card">
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Quotation value by status</h2>
          <QuotationValueChart data={quoteValueData} />
        </div>
        <div className="card">
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Recent activity</h2>
          {recentActivity.length === 0 ? (
            <Empty text="No activity yet" />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentActivity.map((a) => (
                <li key={a.id} style={{ fontSize: 13, borderLeft: "2px solid var(--border)", paddingLeft: 10, marginBottom: 10 }}>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{a.createdAt.toLocaleString()}</div>
                  <Link href="/leads" style={{ color: "var(--accent)" }}>{a.lead.companyName}</Link>: {a.detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ color: "var(--text-muted)", fontSize: 13, padding: 40, textAlign: "center" }}>{text}</div>;
}
