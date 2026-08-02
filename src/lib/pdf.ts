import PDFDocument from "pdfkit";

type InvoiceForPdf = {
  invoiceNumber: string;
  currency: string;
  subtotal: number;
  tax: number;
  freight: number;
  amountPaid: number;
  dueDate: Date | null;
  paymentTerms: string | null;
  status: string;
  createdAt: Date;
  customer: { companyName: string; billingAddress: string | null; country: string | null };
  items: { description: string; quantity: number; unitPrice: number }[];
};

type CompanyInfo = { bankDetails: string | null; contactInfo: string | null };

export function generateInvoicePdf(invoice: InvoiceForPdf, company: CompanyInfo): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const total = invoice.subtotal + invoice.tax + invoice.freight;
    const balance = total - invoice.amountPaid;

    // Header
    doc.rect(0, 0, doc.page.width, 90).fill("#0a1628");
    doc.fillColor("white").fontSize(20).text("✈  Wing Fires", 50, 30);
    doc.fontSize(10).fillColor("#cfe0ff").text("Certified Aircraft Parts Marketplace", 50, 56);

    doc.fillColor("#14213d").fontSize(16).text("INVOICE", 400, 30, { align: "right" });
    doc.fontSize(10).fillColor("#333").text(invoice.invoiceNumber, 400, 52, { align: "right" });

    doc.moveDown(4);
    let y = 120;

    doc.fontSize(10).fillColor("#6b7686").text("Bill to", 50, y);
    doc.fontSize(12).fillColor("#14213d").text(invoice.customer.companyName, 50, y + 14);
    if (invoice.customer.billingAddress) doc.fontSize(10).fillColor("#334155").text(invoice.customer.billingAddress, 50, y + 32, { width: 220 });
    if (invoice.customer.country) doc.text(invoice.customer.country, 50, y + 46);

    doc.fontSize(10).fillColor("#6b7686").text("Invoice date", 350, y);
    doc.fontSize(11).fillColor("#14213d").text(invoice.createdAt.toLocaleDateString(), 350, y + 14);
    doc.fontSize(10).fillColor("#6b7686").text("Due date", 350, y + 34);
    doc.fontSize(11).fillColor("#14213d").text(invoice.dueDate ? invoice.dueDate.toLocaleDateString() : "On receipt", 350, y + 48);
    doc.fontSize(10).fillColor("#6b7686").text("Payment terms", 350, y + 68);
    doc.fontSize(11).fillColor("#14213d").text(invoice.paymentTerms || "—", 350, y + 82);

    y += 130;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e9f0").stroke();
    y += 14;

    // Table header
    doc.fontSize(9).fillColor("#6b7686");
    doc.text("DESCRIPTION", 50, y);
    doc.text("QTY", 320, y);
    doc.text("UNIT PRICE", 380, y);
    doc.text("LINE TOTAL", 470, y, { align: "right", width: 75 });
    y += 16;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e9f0").stroke();
    y += 8;

    doc.fontSize(10).fillColor("#14213d");
    for (const item of invoice.items) {
      const lineTotal = item.quantity * item.unitPrice;
      doc.text(item.description, 50, y, { width: 250 });
      doc.text(String(item.quantity), 320, y);
      doc.text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, 380, y);
      doc.text(`${invoice.currency} ${lineTotal.toFixed(2)}`, 470, y, { align: "right", width: 75 });
      y += 22;
    }

    y += 10;
    doc.moveTo(320, y).lineTo(545, y).strokeColor("#e5e9f0").stroke();
    y += 10;

    const totalsRow = (label: string, value: number, bold = false) => {
      doc.fontSize(bold ? 12 : 10).fillColor(bold ? "#14213d" : "#6b7686");
      doc.text(label, 320, y);
      doc.text(`${invoice.currency} ${value.toFixed(2)}`, 470, y, { align: "right", width: 75 });
      y += bold ? 20 : 16;
    };
    totalsRow("Subtotal", invoice.subtotal);
    totalsRow("Tax", invoice.tax);
    totalsRow("Freight", invoice.freight);
    totalsRow("Total", total, true);
    totalsRow("Paid", invoice.amountPaid);
    totalsRow("Balance due", balance, true);

    y += 20;
    if (company.bankDetails) {
      doc.fontSize(9).fillColor("#6b7686").text("Bank details", 50, y);
      doc.fontSize(10).fillColor("#334155").text(company.bankDetails, 50, y + 12, { width: 495 });
      y += 50;
    }
    if (company.contactInfo) {
      doc.fontSize(9).fillColor("#6b7686").text(company.contactInfo, 50, y, { width: 495 });
    }

    doc.fontSize(8).fillColor("#9ca3af").text(
      "Wing Fires — Certified Aircraft Parts Marketplace",
      50, doc.page.height - 60, { align: "center", width: 495 }
    );

    doc.end();
  });
}
