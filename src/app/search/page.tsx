import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();

  const [leads, customers, vendors, rfqs, quotations] = q
    ? await Promise.all([
        prisma.lead.findMany({
          where: { OR: [{ companyName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { leadNumber: { contains: q, mode: "insensitive" } }] },
          take: 10,
        }),
        prisma.customer.findMany({
          where: { OR: [{ companyName: { contains: q, mode: "insensitive" } }, { customerNumber: { contains: q, mode: "insensitive" } }] },
          take: 10,
        }),
        prisma.vendor.findMany({
          where: { OR: [{ companyName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
          take: 10,
        }),
        prisma.rfq.findMany({
          where: { OR: [{ rfqNumber: { contains: q, mode: "insensitive" } }, { aircraftModel: { contains: q, mode: "insensitive" } }] },
          include: { customer: true },
          take: 10,
        }),
        prisma.quotation.findMany({
          where: { quotationNumber: { contains: q, mode: "insensitive" } },
          include: { customer: true },
          take: 10,
        }),
      ])
    : [[], [], [], [], []];

  const totalResults = leads.length + customers.length + vendors.length + rfqs.length + quotations.length;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Search</h1>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>
        {q ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${q}"` : "Type something in the sidebar search box"}
      </p>

      {q && totalResults === 0 && <div className="card">No matches found across Leads, Customers, Vendors, RFQs, or Quotations.</div>}

      {leads.length > 0 && (
        <Section title="Leads">
          {leads.map((l) => (
            <Row key={l.id} href="/leads" label={`${l.leadNumber} — ${l.companyName}`} sub={l.email} />
          ))}
        </Section>
      )}
      {customers.length > 0 && (
        <Section title="Customers">
          {customers.map((c) => (
            <Row key={c.id} href={`/customers/${c.id}`} label={`${c.customerNumber} — ${c.companyName}`} sub={c.country} />
          ))}
        </Section>
      )}
      {vendors.length > 0 && (
        <Section title="Vendors">
          {vendors.map((v) => (
            <Row key={v.id} href="/vendors" label={v.companyName} sub={v.email} />
          ))}
        </Section>
      )}
      {rfqs.length > 0 && (
        <Section title="RFQs">
          {rfqs.map((r) => (
            <Row key={r.id} href={`/rfqs/${r.id}`} label={r.rfqNumber} sub={r.customer.companyName} />
          ))}
        </Section>
      )}
      {quotations.length > 0 && (
        <Section title="Quotations">
          {quotations.map((qt) => (
            <Row key={qt.id} href={`/quotations/${qt.id}`} label={qt.quotationNumber} sub={qt.customer.companyName} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>{title}</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>{children}</ul>
    </div>
  );
}

function Row({ href, label, sub }: { href: string; label: string; sub?: string | null }) {
  return (
    <li style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <Link href={href} style={{ color: "var(--accent)" }}>{label}</Link>
      {sub && <span style={{ color: "var(--text-muted)", fontSize: 13 }}> — {sub}</span>}
    </li>
  );
}
