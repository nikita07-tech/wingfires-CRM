"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./theme-toggle";
import NotificationBell from "./notification-bell";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/leads", label: "Leads", icon: "🧲" },
  { href: "/leads/kanban", label: "Pipeline", icon: "🗂️" },
  { href: "/customers", label: "Customers", icon: "🏢" },
  { href: "/vendors", label: "Vendors", icon: "🔧" },
  { href: "/rfqs", label: "RFQs", icon: "📋" },
  { href: "/quotations", label: "Quotations", icon: "🧾" },
  { href: "/sales-orders", label: "Sales Orders", icon: "📦" },
  { href: "/purchase-orders", label: "Purchase Orders", icon: "🚚" },
  { href: "/invoices", label: "Invoices", icon: "💳" },
  { href: "/website", label: "Website", icon: "🌐" },
  { href: "/settings/automation", label: "Automation", icon: "⚙️" },
];

export default function Nav({ userEmail, unreadCount }: { userEmail: string; unreadCount: number }) {
  const router = useRouter();
  const pathname = usePathname();

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string) || "";
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <aside style={{ width: 240, background: "var(--sidebar-bg)", color: "white", padding: 20, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>✈️ Wing Fires CRM</div>

      <form onSubmit={onSearch} style={{ marginBottom: 20 }}>
        <input
          name="q"
          placeholder="Search everything…"
          className="nav-search"
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #223049", background: "#0c1a30", color: "white", fontSize: 13 }}
        />
      </form>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              style={{
                color: active ? "white" : "var(--sidebar-text)",
                fontSize: 14,
                padding: "8px 10px",
                borderRadius: 8,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: active ? "rgba(59,130,246,0.25)" : "transparent",
              }}
            >
              <span>{l.icon}</span> {l.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 16 }}>
        <NotificationBell unreadCount={unreadCount} />
        <ThemeToggle />
        <div style={{ fontSize: 12, color: "#9fb0c9", marginBottom: 8 }}>{userEmail}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ background: "transparent", border: "1px solid #2a3f5f", color: "white", padding: "8px 0", borderRadius: 8, cursor: "pointer", width: "100%" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
