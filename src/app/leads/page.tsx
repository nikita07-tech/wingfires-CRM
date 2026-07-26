import { prisma } from "@/lib/prisma";
import { createLead } from "./actions";
import StatusSelect from "./status-select";
import SyncButton from "./sync-button";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Leads</h1>
      <SyncButton />

      <form action={createLead} style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input name="companyName" placeholder="Company name *" required style={inputStyle} />
        <input name="contactName" placeholder="Contact name" style={inputStyle} />
        <input name="email" placeholder="Email" type="email" style={inputStyle} />
        <input name="phone" placeholder="Phone" style={inputStyle} />
        <input name="country" placeholder="Country" style={inputStyle} />
        <input name="aircraftTypes" placeholder="Aircraft types" style={inputStyle} />
        <input name="interestedParts" placeholder="Interested parts" style={inputStyle} />
        <input name="source" placeholder="Source (e.g. website, referral)" style={inputStyle} />
        <select name="priority" style={inputStyle} defaultValue="medium">
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
          <option value="urgent">Urgent</option>
        </select>
        <textarea name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 3" }} rows={2} />
        <button type="submit" style={{ gridColumn: "span 3", padding: 12, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
          Add lead
        </button>
      </form>

      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <table>
          <thead>
            <tr>
              <th>Lead #</th><th>Company</th><th>Contact</th><th>Priority</th><th>Status</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#6b7686" }}>No leads yet — add your first one above</td></tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{l.leadNumber}</td>
                  <td>{l.companyName}</td>
                  <td>{l.contactName}<div style={{ color: "#6b7686", fontSize: 12 }}>{l.email}</div></td>
                  <td style={{ textTransform: "capitalize" }}>{l.priority}</td>
                  <td><StatusSelect leadId={l.id} status={l.status} /></td>
                  <td style={{ color: "#6b7686" }}>{l.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 10, borderRadius: 8, border: "1px solid #e5e9f0", fontSize: 14,
};