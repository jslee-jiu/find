import PDFDocument from "pdfkit";
import { supabase } from "@/lib/supabase";
import type { ExportRequest } from "@/lib/types";

function createPdfBuffer(req: ExportRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    doc.fontSize(20).text("Export Buyer List & Contact Report", {
      align: "center"
    });
    doc.moveDown();

    doc.fontSize(12).text(`Company: ${req.companyName}`);
    doc.text(`Contact: ${req.contactName} <${req.contactEmail}>`);
    doc.text(`Product: ${req.productName}`);
    doc.text(`Category: ${req.productCategory}`);
    doc.text(`Target Region: ${req.targetRegion}`);
    doc.text(`Incoterms: ${req.incoterms}`);
    doc.text(`MOQ: ${req.moq}`);
    if (req.priceRange) {
      doc.text(`Price Range: ${req.priceRange}`);
    }
    doc.moveDown();

    if (req.userNotes) {
      doc.fontSize(12).text("Client Notes:", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(req.userNotes);
      doc.moveDown();
    }

    if (req.aiBuyerListDraft) {
      doc.fontSize(12).text("Primary Buyer List (Summary):", {
        underline: true
      });
      doc.moveDown(0.5);
      doc.fontSize(11).text(req.aiBuyerListDraft);
      doc.moveDown();
    }

    doc.addPage();
    doc.fontSize(12).text("Next Steps for Client:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).list([
      "Use the suggested buyer list as a starting point.",
      "Customize and send the English inquiry email template.",
      "Negotiate MOQ, price, and conditions with interested buyers.",
      "Request additional reports for other regions if needed."
    ]);
    doc.moveDown();

    doc.fontSize(10).fillColor("gray").text(
      "Disclaimer: This report is based on AI-generated suggestions and public information. Accuracy and " +
        "timeliness are not guaranteed. All final business decisions and contracts are the sole responsibility of the client.",
      { align: "left" }
    );

    doc.end();
  });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { data, error } = await supabase
    .from("export_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: "해당 리포트를 찾을 수 없습니다." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const reqData = data as ExportRequest;
  const buffer = await createPdfBuffer(reqData);

  // Buffer -> Uint8Array로 변환 (Response가 이해할 수 있는 타입)
  const uint8 = new Uint8Array(buffer as ArrayBufferLike);
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="report-${id}.pdf"`
    }
  });
}
