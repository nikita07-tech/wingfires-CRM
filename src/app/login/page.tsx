"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) return setError("Invalid email or password");
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0a1628" }}>
      <form onSubmit={onSubmit} style={{ width: 340, background: "#111f38", padding: 32, borderRadius: 16 }}>
        <h1 style={{ color: "white", fontSize: 20, marginBottom: 20 }}>Wing Fires CRM</h1>
        {error && <div style={{ background: "#3a1c1c", color: "#ffb4b4", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
        <label style={{ display: "block", color: "#9fb0c9", fontSize: 12, marginBottom: 4 }}>Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 14, borderRadius: 8, border: "1px solid #2a3f5f", background: "#0c1a30", color: "white" }}
        />
        <label style={{ display: "block", color: "#9fb0c9", fontSize: 12, marginBottom: 4 }}>Password</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 20, borderRadius: 8, border: "1px solid #2a3f5f", background: "#0c1a30", color: "white" }}
        />
        <button
          type="submit" disabled={busy}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600 }}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
