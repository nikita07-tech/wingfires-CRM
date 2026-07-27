import { createQuotationFromRfq } from "../../quotations/actions";

export default function CreateQuotationForm({
  rfqId, customerId, vendorQuoteId, defaultPrice, items,
}: {
  rfqId: string; customerId: string; vendorQuoteId: string; defaultPrice: number;
  items: { quantity: number }[];
}) {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0) || 1;
  const suggestedSubtotal = (defaultPrice * totalQty).toFixed(2);

  return (
    <form action={createQuotationFromRfq} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      <input type="hidden" name="rfqId" value={rfqId} />
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="vendorQuoteId" value={vendorQuoteId} />
      <input name="subtotal" type="number" step="0.01" defaultValue={suggestedSubtotal} placeholder="Subtotal *" required style={inputStyle} />
      <input name="tax" type="number" step="0.01" placeholder="Tax" style={inputStyle} defaultValue="0" />
      <input name="freight" type="number" step="0.01" placeholder="Freight" style={inputStyle} defaultValue="0" />
      <input name="paymentTerms" placeholder="Payment terms (e.g. Net 30)" style={inputStyle} />
      <input name="validUntil" type="date" style={inputStyle} />
      <textarea name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 3" }} rows={2} />
      <button type="submit" style={{ gridColumn: "span 3", padding: 10, borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
        Generate customer quotation
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 10, borderRadius: 8, border: "1px solid #e5e9f0", fontSize: 14,
};
