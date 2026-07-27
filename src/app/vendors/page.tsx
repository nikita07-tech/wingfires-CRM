import { prisma } from "@/lib/prisma";
import { createVendor } from "./actions";
import PreferredToggle from "./preferred-toggle";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Vendors</h1>

      <form action={createVendor} style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input name="companyName" placeholder="Company name *" required style={inputStyle} />
        <input name="contactName" placeholder="Contact name" style={inputStyle} />
        <input name="email" placeholder="Email" style={inputStyle} />
        <input name="phone" placeholder="Phone" style={inputStyle} />
        <input name="country" placeholder="Country" style={inputStyle} />
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13 }}>
          <label><input type="checkbox" name="faaCertified" /> FAA</label>
          <label><input type="checkbox" name="easaCertified" /> EASA</label>
          <label><input type="checkbox" name="asaCertified" /> ASA</label>
        </div>
        <textarea name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 2" }} rows={2} />
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="isPreferred" /> Preferred vendor
        </label>
        <button type="submit" style={{ gridColumn: "span 3", padding: 12, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
          Add vendor
        </button>
      </form>

      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <table>
          <thead>
            <tr>
              <th>Company</th><th>Contact</th><th>Country</th><th>Certifications</th><th>Preferred</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#6b7686" }}>No vendors yet — add one above</td></tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.id}>
                  <td>{v.companyName}</td>
                  <td>{v.contactName}<div style={{ color: "#6b7686", fontSize: 12 }}>{v.email}</div></td>
                  <td>{v.country}</td>
                  <td style={{ fontSize: 12 }}>
                    {[v.faaCertified && "FAA", v.easaCertified && "EASA", v.asaCertified && "ASA"].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td><PreferredToggle vendorId={v.id} isPreferred={v.isPreferred} /></td>
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
