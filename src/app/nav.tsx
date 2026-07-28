"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/customers", label: "Customers" },
  { href: "/vendors", label: "Vendors" },
  { href: "/rfqs", label: "RFQs" },
  { href: "/quotations", label: "Quotations" },
];

export default function Nav({ userEmail }: { userEmail: string }) {
  return (
    <aside style={{ width: 220, background: "#0a1628", color: "white", padding: 20, display: "flex", flexDirection: "column" }}>
      <div style={{ fontWeight: 700, marginBottom: 24 }}>Wing Fires CRM</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} style={{ color: "#cfe0ff", fontSize: 14, padding: "6px 0" }}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div style={{ fontSize: 12, color: "#9fb0c9", marginBottom: 8 }}>{userEmail}</div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{ background: "transparent", border: "1px solid #2a3f5f", color: "white", padding: "8px 0", borderRadius: 8, cursor: "pointer" }}
      >
        Sign out
      </button>
    </aside>
  );
}