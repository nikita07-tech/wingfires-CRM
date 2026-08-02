"use server";

import { getSourceClient } from "@/lib/supabaseSource";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseLines(raw: string): string[] {
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
}

export async function createProduct(formData: FormData) {
  const supabase = getSourceClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      part_number: String(formData.get("partNumber") || ""),
      name: String(formData.get("name") || ""),
      oem: String(formData.get("oem") || "") || null,
      category: String(formData.get("category") || "") || null,
      condition: String(formData.get("condition") || "Serviceable"),
      stock_status: String(formData.get("stockStatus") || "in_stock"),
      short_description: String(formData.get("shortDescription") || "") || null,
      description: String(formData.get("description") || "") || null,
      aircraft_compatibility: String(formData.get("aircraftCompatibility") || "") || null,
      certifications: parseLines(String(formData.get("certifications") || "")),
      tags: parseLines(String(formData.get("tags") || "")),
      images: parseLines(String(formData.get("images") || "")),
      featured: formData.get("featured") === "on",
      seo_title: String(formData.get("seoTitle") || "") || null,
      seo_description: String(formData.get("seoDescription") || "") || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/website/products");
  redirect(`/website/products/${data.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = getSourceClient();
  const { error } = await supabase
    .from("products")
    .update({
      part_number: String(formData.get("partNumber") || ""),
      name: String(formData.get("name") || ""),
      oem: String(formData.get("oem") || "") || null,
      category: String(formData.get("category") || "") || null,
      condition: String(formData.get("condition") || "Serviceable"),
      stock_status: String(formData.get("stockStatus") || "in_stock"),
      short_description: String(formData.get("shortDescription") || "") || null,
      description: String(formData.get("description") || "") || null,
      aircraft_compatibility: String(formData.get("aircraftCompatibility") || "") || null,
      certifications: parseLines(String(formData.get("certifications") || "")),
      tags: parseLines(String(formData.get("tags") || "")),
      images: parseLines(String(formData.get("images") || "")),
      featured: formData.get("featured") === "on",
      seo_title: String(formData.get("seoTitle") || "") || null,
      seo_description: String(formData.get("seoDescription") || "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/website/products");
  revalidatePath(`/website/products/${productId}`);
}

export async function toggleArchived(productId: string, archived: boolean) {
  const supabase = getSourceClient();
  const { error } = await supabase.from("products").update({ is_archived: archived }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/website/products");
}

export async function listWebsiteProducts() {
  const supabase = getSourceClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getWebsiteProduct(productId: string) {
  const supabase = getSourceClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
