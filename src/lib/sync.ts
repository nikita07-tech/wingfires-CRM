import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { getSourceClient } from "@/lib/supabaseSource";

export async function syncRfqsFromWebsite() {
  const supabase = getSourceClient();

  const { data: rfqs, error } = await supabase
    .from("rfqs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`Could not read from website database: ${error.message}`);

  let imported = 0;
  let skipped = 0;

  for (const rfq of rfqs ?? []) {
    const sourceRfqId = String(rfq.id ?? rfq.lead_id);
    const existing = await prisma.lead.findUnique({ where: { sourceRfqId } });
    if (existing) {
      skipped++;
      continue;
    }

    const leadNumber = await nextNumber("lead");
    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        sourceRfqId,
        companyName: rfq.buyer_company || rfq.buyer_name || `Website RFQ ${rfq.lead_id ?? ""}`,
        contactName: rfq.buyer_name || null,
        email: rfq.buyer_email || null,
        aircraftTypes: rfq.aircraft || null,
        interestedParts: [rfq.part_number, rfq.part_name].filter(Boolean).join(" — ") || null,
        source: "website_rfq",
        notes: [
          rfq.quantity ? `Qty: ${rfq.quantity}` : null,
          rfq.condition ? `Condition: ${rfq.condition}` : null,
          rfq.manufacturer ? `Manufacturer: ${rfq.manufacturer}` : null,
          rfq.notes || null,
        ].filter(Boolean).join(" · ") || null,
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        action: "imported",
        detail: `Auto-imported from website RFQ ${rfq.lead_id ?? rfq.id}`,
      },
    });
    imported++;
  }

  return { imported, skipped, checked: rfqs?.length ?? 0 };
}