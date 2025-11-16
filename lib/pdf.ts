import type { ExportRequest } from "./types";

export async function generateBuyerPdfUrl(
  req: ExportRequest
): Promise<{ pdfUrl: string }> {
  const base =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000";
  return {
    pdfUrl: `${base}/api/reports/${req.id}`
  };
}
