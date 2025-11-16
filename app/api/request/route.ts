// app/api/request/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ExportRequest } from "@/lib/types";
import { generateBuyerListAndMailDraft } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Supabase 설정 안 되어 있으면 바로 에러 응답
    if (!supabase) {
      console.error("Supabase가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 DB가 아직 설정되지 않았습니다." },
        { status: 500 }
      );
    }

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

    // ✅ OpenAI로 바이어 리스트 + 메일 초안 생성 (키 없으면 더미 동작)
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

    const { data, error } = await supabase!
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
