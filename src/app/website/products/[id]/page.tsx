import { getSourceClient } from "@/lib/supabaseSource";
import { updateProduct } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = getSourceClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).maybeSingle();
  if (!product) return notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div>
      <Link href="/website/products" style={{ color: "var(--accent)", fontSize: 13 }}>&larr; Back to products</Link>
      <h1 style={{ marginTop: 8 }}>{product.name}</h1>

      <form action={boundUpdate} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input className="input" name="partNumber" placeholder="Part number *" defaultValue={product.part_number} required />
        <input className="input" name="name" placeholder="Product name *" defaultValue={product.name} required />
        <input className="input" name="oem" placeholder="OEM / manufacturer" defaultValue={product.oem || ""} />
        <input className="input" name="category" placeholder="Category" defaultValue={product.category || ""} />
        <select className="input" name="condition" defaultValue={product.condition || "Serviceable"}>
          <option value="New">New</option>
          <option value="Overhauled">Overhauled</option>
          <option value="Serviceable">Serviceable</option>
        </select>
        <select className="input" name="stockStatus" defaultValue={product.stock_status || "in_stock"}>
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="on_request">On request</option>
        </select>
        <input className="input" name="aircraftCompatibility" placeholder="Aircraft compatibility" defaultValue={product.aircraft_compatibility || ""} style={{ gridColumn: "span 3" }} />
        <textarea className="input" name="shortDescription" placeholder="Short description" defaultValue={product.short_description || ""} rows={2} style={{ gridColumn: "span 3" }} />
        <textarea className="input" name="description" placeholder="Full description" defaultValue={product.description || ""} rows={3} style={{ gridColumn: "span 3" }} />
        <input className="input" name="certifications" placeholder="Certifications, comma separated" defaultValue={(product.certifications || []).join(", ")} style={{ gridColumn: "span 3" }} />
        <input className="input" name="imageUrl" placeholder="Image URL" defaultValue={Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : ""} style={{ gridColumn: "span 2" }} />
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured
        </label>
        <input className="input" name="seoTitle" placeholder="SEO title" defaultValue={product.seo_title || ""} style={{ gridColumn: "span 2" }} />
        <input className="input" name="seoDescription" placeholder="SEO description" defaultValue={product.seo_description || ""} style={{ gridColumn: "span 1" }} />
        <button type="submit" className="btn-primary" style={{ gridColumn: "span 3", justifySelf: "start" }}>Save changes</button>
      </form>
    </div>
  );
}
