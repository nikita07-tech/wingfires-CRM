import { prisma } from "@/lib/prisma";
import { updateAutomationSettings, updateNumberingSequence } from "./actions";

export default async function AutomationSettingsPage() {
  const [settings, sequences] = await Promise.all([
    prisma.automationSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } }),
    prisma.numberingSequence.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Automation Settings</h1>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>
        Change how the CRM automates numbering, invoicing, and reminders — no code changes needed.
      </p>

      <form action={updateAutomationSettings} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <h2 style={{ gridColumn: "span 2", fontSize: 13, color: "var(--text-muted)", margin: 0, textTransform: "uppercase" }}>Business rules</h2>

        <Field label="Default tax rate (%)">
          <input className="input" name="defaultTaxRate" type="number" step="0.01" defaultValue={settings.defaultTaxRate} />
        </Field>
        <Field label="Default payment terms">
          <input className="input" name="defaultPaymentTerms" defaultValue={settings.defaultPaymentTerms} />
        </Field>
        <Field label="Quotation validity (days)">
          <input className="input" name="quotationValidityDays" type="number" defaultValue={settings.quotationValidityDays} />
        </Field>
        <Field label="Invoice due (days after generation)">
          <input className="input" name="invoiceDueDays" type="number" defaultValue={settings.invoiceDueDays} />
        </Field>
        <Field label="Send expiry reminder (days before)">
          <input className="input" name="reminderDaysBeforeExpiry" type="number" defaultValue={settings.reminderDaysBeforeExpiry} />
        </Field>

        <h2 style={{ gridColumn: "span 2", fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0 0", textTransform: "uppercase" }}>Invoice branding</h2>
        <Field label="Bank details (shown on invoice PDF)" full>
          <textarea className="input" name="companyBankDetails" rows={2} defaultValue={settings.companyBankDetails || ""} />
        </Field>
        <Field label="Company contact info (shown on invoice PDF)" full>
          <textarea className="input" name="companyContactInfo" rows={2} defaultValue={settings.companyContactInfo || ""} />
        </Field>

        <button type="submit" className="btn-primary" style={{ gridColumn: "span 2", justifySelf: "start" }}>Save settings</button>
      </form>

      <div className="card">
        <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, textTransform: "uppercase" }}>Numbering sequences</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: -8 }}>
          Controls the prefix and next number for auto-generated IDs (e.g. RFQ-00007).
        </p>
        <table>
          <thead><tr><th>Type</th><th>Prefix</th><th>Next number</th><th>Digits</th><th></th></tr></thead>
          <tbody>
            {sequences.map((s) => (
              <tr key={s.key}>
                <td style={{ textTransform: "capitalize" }}>{s.key.replace(/_/g, " ")}</td>
                <td colSpan={4}>
                  <form action={updateNumberingSequence} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="hidden" name="key" value={s.key} />
                    <input className="input" name="prefix" defaultValue={s.prefix} style={{ width: 70 }} />
                    <input className="input" name="nextValue" type="number" defaultValue={s.nextValue} style={{ width: 90 }} />
                    <input className="input" name="padding" type="number" defaultValue={s.padding} style={{ width: 70 }} />
                    <button type="submit" className="btn-outline" style={{ padding: "6px 12px" }}>Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
