"use server";

import { getSourceClient } from "@/lib/supabaseSource";
import { revalidatePath } from "next/cache";

export async function updateHomeHero(formData: FormData) {
  const supabase = getSourceClient();
  const { error } = await supabase.from("content_blocks").upsert(
    {
      page_slug: "home",
      section_key: "hero",
      title: String(formData.get("title") || ""),
      subtitle: String(formData.get("subtitle") || "") || null,
      body: String(formData.get("body") || "") || null,
      button_label: String(formData.get("buttonLabel") || "") || null,
      button_url: String(formData.get("buttonUrl") || "") || null,
      extra: {
        secondary_button_label: String(formData.get("secondaryButtonLabel") || "") || null,
        secondary_button_url: String(formData.get("secondaryButtonUrl") || "") || null,
      },
      is_visible: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_slug,section_key" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/website");
}

export async function updateHomeStats(formData: FormData) {
  const supabase = getSourceClient();
  const labels = formData.getAll("statLabel") as string[];
  const values = formData.getAll("statValue") as string[];
  const stats = labels
    .map((label, i) => ({ label: label.trim(), value: (values[i] || "").trim() }))
    .filter((s) => s.label && s.value);

  const { error } = await supabase.from("content_blocks").upsert(
    {
      page_slug: "home",
      section_key: "stats",
      extra: { stats },
      is_visible: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_slug,section_key" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/website");
}

export async function createProduct(formData: FormData) {
  const supabase = getSourceClient();
  const { error } = await supabase.from("products").insert({
    part_number: String(formData.get("partNumber") || ""),
    name: String(formData.get("name") || ""),
    oem: String(formData.get("oem") || "") || null,
    category: String(formData.get("category") || "") || null,
    condition: String(formData.get("condition") || "Serviceable"),
    stock_status: String(formData.get("stockStatus") || "in_stock"),
    short_description: String(formData.get("shortDescription") || "") || null,
    description: String(formData.get("description") || "") || null,
    aircraft_compatibility: String(formData.get("aircraftCompatibility") || "") || null,
    certifications: String(formData.get("certifications") || "")
      .split(",").map((s) => s.trim()).filter(Boolean),
    images: String(formData.get("imageUrl") || "") ? [String(formData.get("imageUrl"))] : [],
    featured: formData.get("featured") === "on",
    seo_title: String(formData.get("seoTitle") || "") || null,
    seo_description: String(formData.get("seoDescription") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/website/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = getSourceClient();
  const { error } = await supabase.from("products").update({
    part_number: String(formData.get("partNumber") || ""),
    name: String(formData.get("name") || ""),
    oem: String(formData.get("oem") || "") || null,
    category: String(formData.get("category") || "") || null,
    condition: String(formData.get("condition") || "Serviceable"),
    stock_status: String(formData.get("stockStatus") || "in_stock"),
    short_description: String(formData.get("shortDescription") || "") || null,
    description: String(formData.get("description") || "") || null,
    aircraft_compatibility: String(formData.get("aircraftCompatibility") || "") || null,
    certifications: String(formData.get("certifications") || "")
      .split(",").map((s) => s.trim()).filter(Boolean),
    images: String(formData.get("imageUrl") || "") ? [String(formData.get("imageUrl"))] : [],
    featured: formData.get("featured") === "on",
    seo_title: String(formData.get("seoTitle") || "") || null,
    seo_description: String(formData.get("seoDescription") || "") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/website/products");
  revalidatePath(`/website/products/${productId}`);
}

export async function toggleProductArchived(productId: string, isArchived: boolean) {
  const supabase = getSourceClient();
  const { error } = await supabase.from("products").update({ is_archived: isArchived }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/website/products");
}
