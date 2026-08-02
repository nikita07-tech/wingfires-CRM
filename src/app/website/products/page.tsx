import { getSourceClient } from "@/lib/supabaseSource";
import { createProduct, toggleProductArchived } from "../actions";
import Link from "next/link";
import ArchiveToggle from "./archive-toggle";

export default async function WebsiteProductsPage() {
  const supabase = getSourceClient();
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginTop: 0 }}>Website — Products</h1>
        <Link href="/website" style={{ color: "var(--accent)", fontSize: 13 }}>← Homepage content</Link>
      </div>
      <p style={{ color: "var(--text-muted)", marginTop: -8 }}>
        Products you add here appear on the wingfires.com /parts catalog immediately.
      </p>

      <form action={createProduct} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <input className="input" name="partNumber" placeholder="Part number *" required />
        <input className="input" name="name" placeholder="Product name *" required />
        <input className="input" name="oem" placeholder="OEM / manufacturer" />
        <input className="input" name="category" placeholder="Category" />
        <select className="input" name="condition" defaultValue="Serviceable">
          <option value="New">New</option>
          <option value="Overhauled">Overhauled</option>
          <option value="Serviceable">Serviceable</option>
        </select>
        <select className="input" name="stockStatus" defaultValue="in_stock">
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="on_request">On request</option>
        </select>
        <input className="input" name="aircraftCompatibility" placeholder="Aircraft compatibility" style={{ gridColumn: "span 3" }} />
        <textarea className="input" name="shortDescription" placeholder="Short description (shown in catalog card)" rows={2} style={{ gridColumn: "span 3" }} />
        <textarea className="input" name="description" placeholder="Full description" rows={3} style={{ gridColumn: "span 3" }} />
        <input className="input" name="certifications" placeholder="Certifications, comma separated (FAA, EASA, ASA)" style={{ gridColumn: "span 3" }} />
        <input className="input" name="imageUrl" placeholder="Image URL" style={{ gridColumn: "span 2" }} />
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="featured" /> Featured
        </label>
        <input className="input" name="seoTitle" placeholder="SEO title (optional)" style={{ gridColumn: "span 2" }} />
        <input className="input" name="seoDescription" placeholder="SEO description (optional)" style={{ gridColumn: "span 1" }} />
        <button type="submit" className="btn-primary" style={{ gridColumn: "span 3", justifySelf: "start" }}>Add product</button>
      </form>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead><tr><th>Part #</th><th>Name</th><th>Category</th><th>Condition</th><th>Stock</th><th>Featured</th><th>Archived</th></tr></thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>No products yet — add one above</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                    <Link href={`/website/products/${p.id}`} style={{ color: "var(--accent)" }}>{p.part_number}</Link>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.condition}</td>
                  <td>{p.stock_status?.replace(/_/g, " ")}</td>
                  <td>{p.featured ? "★" : ""}</td>
                  <td><ArchiveToggle productId={p.id} isArchived={p.is_archived} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
