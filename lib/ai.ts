import OpenAI from "openai";
import type { ExportRequest } from "./types";

const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey
  ? new OpenAI({ apiKey })
  : null;

export async function generateBuyerListAndMailDraft(
  req: Omit<ExportRequest, "id" | "createdAt" | "status">
): Promise<{ buyerListDraft: string; mailDraft: string }> {
  if (!client) {
    const regionLabel =
      req.targetRegion === "MIDDLE_EAST"
        ? "Middle East"
        : req.targetRegion === "AMERICAS"
        ? "Americas"
        : "Europe";

    const buyerListDraft = `
[DEMO] Primary Buyer Candidates for ${req.productName} in ${regionLabel}:

1) Example Auto Parts LLC (UAE) - info@example-auto-uae.com
2) Sample Gulf Spare Parts Co. (Saudi Arabia) - sales@sample-gulf.com
3) Demo Qatar Auto Supply (Qatar) - contact@demo-qatar-auto.qa
`;

    const mailDraft = `
[DEMO] Subject: Inquiry for ${req.productName} supply to your company

Dear Sir/Madam,

We are ${req.companyName}, a manufacturer of ${req.productCategory} based in South Korea.
We specialize in ${req.productFeatures}.

We are currently looking for reliable partners in the ${regionLabel} region and would like to inquire
if you are interested in importing our ${req.productName} under the following conditions:

- Incoterms: ${req.incoterms}
- MOQ: ${req.moq}
${req.priceRange ? `- Target Price Range: ${req.priceRange}\n` : ""}

If you are interested, we would be pleased to provide detailed specifications,
samples, and pricing information.

Best regards,
${req.contactName}
${req.companyName}
${req.contactEmail}
`;

    return { buyerListDraft, mailDraft };
  }

  const regionLabel =
    req.targetRegion === "MIDDLE_EAST"
      ? "Middle East"
      : req.targetRegion === "AMERICAS"
      ? "Americas"
      : "Europe";

  const systemPrompt = `
You are a professional B2B export consultant specializing in international trade.
Generate:
1) A short "buyer list summary text" describing 3-5 potential buyer candidates (only as formatted text, not JSON).
2) A professional first-contact export inquiry email in English.

The client is a Korean SME manufacturer wanting to export to ${regionLabel}.
`.trim();

  const userPrompt = `
Client / Company:
- Company Name: ${req.companyName}
- Contact Name: ${req.contactName}
- Contact Email: ${req.contactEmail}

Product:
- Name: ${req.productName}
- Category: ${req.productCategory}
- Features: ${req.productFeatures}

Export Conditions:
- Incoterms: ${req.incoterms}
- MOQ: ${req.moq}
${req.priceRange ? `- Target Price Range: ${req.priceRange}` : ""}
${req.userNotes ? `Additional Notes from client: ${req.userNotes}` : ""}

Return JSON with keys "buyer_list" and "mail" only.
`.trim();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content ?? "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { buyer_list: content, mail: "Failed to parse mail content." };
  }

  return {
    buyerListDraft: String(parsed.buyer_list ?? ""),
    mailDraft: String(parsed.mail ?? "")
  };
}
