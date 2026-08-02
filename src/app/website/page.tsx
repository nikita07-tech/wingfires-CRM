import { getSourceClient } from "@/lib/supabaseSource";
import { updateHomeHero, updateHomeStats } from "./actions";
import Link from "next/link";

export default async function WebsiteHomePage() {
  const supabase = getSourceClient();
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("page_slug", "home")
    .in("section_key", ["hero", "stats"]);

  const hero = blocks?.find((b) => b.section_key === "hero");
  const stats = (blocks?.find((b) => b.section_key === "stats")?.extra?.stats as { label: string; value: string }[]) || [];
  const heroExtra = (hero?.extra as Record<string, unknown>) || {};

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginTop: 0 }}>Website — Homepage Content</h1>
        <Link href="/website/products" style={{ color: "var(--accent)", fontSize: 13 }}>Manage Products →</Link>
      </div>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>
        Edits here go live on wingfires.com immediately — no code changes or redeploy needed.
      </p>

      <form action={updateHomeHero} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <h2 style={{ gridColumn: "span 2", fontSize: 13, color: "var(--text-muted)", margin: 0, textTransform: "uppercase" }}>Hero section</h2>
        <Field label="Headline" full>
          <textarea className="input" name="title" rows={2} defaultValue={hero?.title || ""} />
        </Field>
        <Field label="Eyebrow / subtitle" full>
          <input className="input" name="subtitle" defaultValue={hero?.subtitle || ""} />
        </Field>
        <Field label="Body paragraph" full>
          <textarea className="input" name="body" rows={2} defaultValue={hero?.body || ""} />
        </Field>
        <Field label="Primary button label">
          <input className="input" name="buttonLabel" defaultValue={hero?.button_label || ""} />
        </Field>
        <Field label="Primary button link">
          <input className="input" name="buttonUrl" defaultValue={hero?.button_url || ""} />
        </Field>
        <Field label="Secondary button label">
          <input className="input" name="secondaryButtonLabel" defaultValue={(heroExtra.secondary_button_label as string) || ""} />
        </Field>
        <Field label="Secondary button link">
          <input className="input" name="secondaryButtonUrl" defaultValue={(heroExtra.secondary_button_url as string) || ""} />
        </Field>
        <button type="submit" className="btn-primary" style={{ gridColumn: "span 2", justifySelf: "start" }}>Publish hero section</button>
      </form>

      <form action={updateHomeStats} className="card">
        <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Stats row</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {(stats.length > 0 ? stats : [{ label: "", value: "" }, { label: "", value: "" }, { label: "", value: "" }, { label: "", value: "" }]).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input className="input" name="statValue" placeholder="Value (e.g. 12,000+)" defaultValue={s.value} style={{ width: "45%" }} />
              <input className="input" name="statLabel" placeholder="Label (e.g. Aircraft Parts)" defaultValue={s.label} style={{ flex: 1 }} />
            </div>
          ))}
        </div>
        <button type="submit" className="btn-primary">Publish stats</button>
      </form>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label style={{ display: "block", gridColumn: full ? "span 2" : undefined }}>
      <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}
