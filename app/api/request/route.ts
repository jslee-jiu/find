import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ExportRequest } from "@/lib/types";
import { generateBuyerListAndMailDraft } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const base: Omit<ExportRequest, "id" | "createdAt" | "status"> = {
      companyName: body.companyName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      productName: body.productName,
      productCategory: body.productCategory,
      productFeatures: body.productFeatures,
      targetRegion: body.targetRegion,
      incoterms: body.incoterms,
      moq: body.moq,
      priceRange: body.priceRange || null,
      userNotes: body.userNotes || null,
      aiBuyerListDraft: "",
      aiMailDraft: "",
      adminNotes: ""
    };

    const { buyerListDraft, mailDraft } =
      await generateBuyerListAndMailDraft(base);

    const insertData = {
      companyName: base.companyName,
      contactName: base.contactName,
      contactEmail: base.contactEmail,
      productName: base.productName,
      productCategory: base.productCategory,
      productFeatures: base.productFeatures,
      targetRegion: base.targetRegion,
      incoterms: base.incoterms,
      moq: base.moq,
      priceRange: base.priceRange,
      userNotes: base.userNotes,
      status: "PENDING",
      aiBuyerListDraft: buyerListDraft,
      aiMailDraft: mailDraft,
      adminNotes: base.adminNotes
    };

    const { data, error } = await supabase
      .from("export_requests")
      .insert([insertData])
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json(
        { error: "DB 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
