"use server";

import { getSourceClient } from "@/lib/supabaseSource";
import { revalidatePath } from "next/cache";

export async function updateHeroContent(formData: FormData) {
  const supabase = getSourceClient();
  const { error } = await supabase.from("content_blocks").upsert(
    {
      page_slug: "home",
      section_key: "hero",
      title: String(formData.get("title") || ""),
      subtitle: String(formData.get("subtitle") || ""),
      body: String(formData.get("body") || ""),
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
  revalidatePath("/website/homepage");
}

export async function updateStatsContent(formData: FormData) {
  const supabase = getSourceClient();
  const stats = [1, 2, 3, 4]
    .map((i) => ({
      label: String(formData.get(`stat${i}Label`) || ""),
      value: String(formData.get(`stat${i}Value`) || ""),
    }))
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
  revalidatePath("/website/homepage");
}

export async function getHomeContentBlocks() {
  const supabase = getSourceClient();
  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("page_slug", "home")
    .in("section_key", ["hero", "stats"]);
  if (error) throw new Error(error.message);
  return data ?? [];
}
