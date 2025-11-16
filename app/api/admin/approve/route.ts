// app/api/admin/approve/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateBuyerPdfUrl } from "@/lib/pdf";
import { sendMail } from "@/lib/mail";
import type { ExportRequest } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, approve, adminNotes } = body as {
      id: string;
      approve: boolean;
      adminNotes?: string;
    };

    // Supabase env 없으면 빌드 통과용 — 안전하게 에러 반환
    if (!supabase) {
      console.error("Supabase가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 DB가 아직 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 요청 존재 확인
    const { data: existing, error: fetchError } = await supabase!
      .from("export_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "요청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!approve) {
      // 반려 처리
      await supabase!
        .from("export_requests")
        .update({
          status: "rejected",
          adminNotes: adminNotes ?? "",
        })
        .eq("id", id);

      return NextResponse.json({ success: true });
    }

    // 승인 처리
    const { data: updated, error: updateError } = await supabase!
      .from("export_requests")
      .update({
        status: "approved",
        adminNotes: adminNotes ?? "",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "승인 처리 중 오류 발생." },
        { status: 500 }
      );
    }

    // PDF URL 생성
    const pdfUrl = generateBuyerPdfUrl(id);

    // 메일 발송 (Resend 없으면 내부에서 콘솔 로그로 대체)
    await sendMail({
      to: updated.email,
      subject: "바이어 리스트 및 안내서",
      text: `승인이 완료되었습니다. PDF 링크: ${pdfUrl}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "서버 오류 발생" },
      { status: 500 }
    );
  }
}
