"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { getRecentNotifications, markNotificationRead, markAllNotificationsRead } from "./notifications-actions";

type Notification = { id: string; title: string; body: string | null; entityType: string | null; entityId: string | null; readAt: Date | null; createdAt: Date };

const ENTITY_LINK: Record<string, (id: string) => string> = {
  invoice: (id) => `/invoices/${id}`,
  quotation: (id) => `/quotations/${id}`,
  sales_order: (id) => `/sales-orders/${id}`,
  purchase_order: () => `/purchase-orders`,
};

export default function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggleOpen() {
    if (!open) {
      const data = await getRecentNotifications();
      setItems(data);
    }
    setOpen(!open);
  }

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 16 }}>
      <button
        onClick={toggleOpen}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "1px solid #223049", color: "white", padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
      >
        <span>🔔 Notifications</span>
        {unreadCount > 0 && (
          <span style={{ background: "var(--danger)", color: "white", borderRadius: 999, fontSize: 11, padding: "1px 7px" }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="fade-in" style={{ position: "absolute", bottom: "110%", left: 0, width: 300, maxHeight: 360, overflowY: "auto", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)", zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 13 }}>Notifications</strong>
            <button
              onClick={() => startTransition(async () => { await markAllNotificationsRead(); setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date() }))); })}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}
            >
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No notifications yet</div>
          ) : (
            items.map((n) => {
              const href = n.entityType && n.entityId ? ENTITY_LINK[n.entityType]?.(n.entityId) : undefined;
              const content = (
                <div
                  onClick={() => !n.readAt && startTransition(async () => { await markNotificationRead(n.id); setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date() } : x))); })}
                  style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: n.readAt ? "transparent" : "var(--bg)", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 13, fontWeight: n.readAt ? 400 : 600 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.createdAt.toLocaleString()}</div>
                </div>
              );
              return href ? <Link key={n.id} href={href} style={{ color: "inherit", textDecoration: "none" }}>{content}</Link> : <div key={n.id}>{content}</div>;
            })
          )}
        </div>
      )}
    </div>
  );
}
