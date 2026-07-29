import PDFDocument from "pdfkit";
import type { Response } from "express";

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dt(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR");
}

export type BannerExtractRow = {
  id: number;
  created_at: string | Date;
  customer_name: string | null;
  cost_cents: number;
};

export type BannerExtractMeta = {
  bannerId: number;
  title: string;
  description: string | null;
  customerName: string | null;
  customerDocument: string | null;
  costPerImpressionCents: number;
  impressionCount: number;
  totalCents: number;
  validFrom: string | Date;
  validUntil: string | Date | null;
};

/** Gera PDF do extrato de aparições de um banner e envia na response. */
export function sendBannerExtractPdf(
  res: Response,
  meta: BannerExtractMeta,
  rows: BannerExtractRow[],
) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const filename = `extrato-banner-${meta.bannerId}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(16).fillColor("#1e3a6e").text("GB Dental — Extrato de aparições", { align: "left" });
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#555").text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
  doc.moveDown(0.8);

  doc.fontSize(12).fillColor("#1e3a6e").text(meta.title);
  if (meta.description) {
    doc.fontSize(10).fillColor("#444").text(meta.description);
  }
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#222");
  doc.text(`Banner #${meta.bannerId}`);
  doc.text(`Cliente pagante: ${meta.customerName || "— (próprio)"}${meta.customerDocument ? ` · ${meta.customerDocument}` : ""}`);
  doc.text(
    `Vigência: ${String(meta.validFrom).slice(0, 10)}${
      meta.validUntil ? ` → ${String(meta.validUntil).slice(0, 10)}` : " → sem data final"
    }`,
  );
  doc.text(`Custo por aparição: ${brl(meta.costPerImpressionCents)}`);
  doc.text(`Aparições (contador): ${meta.impressionCount}`);
  doc.text(`Total: ${brl(meta.totalCents)}`);
  doc.moveDown(0.8);

  const colQuando = 48;
  const colCliente = 200;
  const colCusto = 420;
  const startY = doc.y;

  doc.fontSize(10).fillColor("#1e3a6e");
  doc.text("Quando", colQuando, startY, { width: 140, continued: false });
  doc.text("Cliente", colCliente, startY, { width: 200 });
  doc.text("Custo", colCusto, startY, { width: 100, align: "right" });
  doc
    .moveTo(48, startY + 14)
    .lineTo(547, startY + 14)
    .strokeColor("#c5d4e8")
    .stroke();

  let y = startY + 22;
  doc.fillColor("#222");
  if (rows.length === 0) {
    doc.text("Nenhuma aparição registrada.", colQuando, y);
  } else {
    for (const row of rows) {
      if (y > 760) {
        doc.addPage();
        y = 48;
      }
      doc.fontSize(9).text(dt(row.created_at), colQuando, y, { width: 140 });
      doc.text(row.customer_name || "—", colCliente, y, { width: 200 });
      doc.text(brl(row.cost_cents), colCusto, y, { width: 100, align: "right" });
      y += 16;
    }
  }

  const sum = rows.reduce((s, r) => s + Number(r.cost_cents || 0), 0);
  y += 10;
  if (y > 760) {
    doc.addPage();
    y = 48;
  }
  doc
    .moveTo(48, y)
    .lineTo(547, y)
    .strokeColor("#c5d4e8")
    .stroke();
  y += 10;
  doc.fontSize(11).fillColor("#1e3a6e");
  doc.text(`Linhas neste extrato: ${rows.length}`, colQuando, y);
  doc.text(`Soma do extrato: ${brl(sum)}`, colCusto - 40, y, { width: 140, align: "right" });

  doc.end();
}
