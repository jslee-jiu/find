export type Region = "MIDDLE_EAST" | "AMERICAS" | "EUROPE";

export interface ExportRequest {
  id: string;
  createdAt: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  productName: string;
  productCategory: string;
  productFeatures: string;
  targetRegion: Region;
  incoterms: string;
  moq: string;
  priceRange?: string | null;
  userNotes?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  aiBuyerListDraft?: string | null;
  aiMailDraft?: string | null;
  adminNotes?: string | null;
}
