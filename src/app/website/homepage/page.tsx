import { getHomeContentBlocks, updateHeroContent, updateStatsContent } from "./actions";

export default async function HomepageEditorPage() {
  const blocks = await getHomeContentBlocks();
  const hero = blocks.find((b: any) => b.section_key === "hero");
  const stats = blocks.find((b: any) => b.section_key === "stats");
  const statsList = (stats?.extra?.stats as { label: string; value: string }[]) || [];
  const heroExtra = (hero?.extra as Record<string, unknown>) || {};

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Website — Homepage</h1>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>
        Editing wingfires.com directly. Changes appear on the live site immediately after saving.
      </p>

      <form action={updateHeroContent} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <h2 style={{ gridColumn: "span 2", fontSize: 13, color: "var(--text-muted)", margin: 0, textTransform: "uppercase" }}>Hero section</h2>
        <Field label="Badge / eyebrow text" full>
          <input className="input" name="subtitle" defaultValue={hero?.subtitle || ""} />
        </Field>
        <Field label="Headline" full>
          <input className="input" name="title" defaultValue={hero?.title || ""} />
        </Field>
        <Field label="Body paragraph" full>
          <textarea className="input" name="body" rows={3} defaultValue={hero?.body || ""} />
        </Field>
        <Field label="Primary button label">
          <input className="input" name="buttonLabel" defaultValue={hero?.button_label || ""} />
        </Field>
        <Field label="Primary button link">
          <input className="input" name="buttonUrl" defaultValue={hero?.button_url || ""} />
        </Field>
        <Field label="Secondary button label">
          <input className="input" name="secondaryButtonLabel" defaultValue={String(heroExtra.secondary_button_label || "")} />
        </Field>
        <Field label="Secondary button link">
          <input className="input" name="secondaryButtonUrl" defaultValue={String(heroExtra.secondary_button_url || "")} />
        </Field>
        <button type="submit" className="btn-primary" style={{ gridColumn: "span 2", justifySelf: "start" }}>Save hero section</button>
      </form>

      <form action={updateStatsContent} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
        <h2 style={{ gridColumn: "span 4", fontSize: 13, color: "var(--text-muted)", margin: 0, textTransform: "uppercase" }}>Stats row (4 tiles)</h2>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Stat {i + 1}</span>
            <input className="input" name={`stat${i + 1}Value`} placeholder="Value (e.g. 12,000+)" defaultValue={statsList[i]?.value || ""} />
            <input className="input" name={`stat${i + 1}Label`} placeholder="Label (e.g. Aircraft Parts)" defaultValue={statsList[i]?.label || ""} />
          </div>
        ))}
        <button type="submit" className="btn-primary" style={{ gridColumn: "span 4", justifySelf: "start" }}>Save stats</button>
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
