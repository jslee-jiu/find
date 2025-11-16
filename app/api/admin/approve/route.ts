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

    const { data: existing, error: fetchError } = await supabase
      .from("export_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "해당 요청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const current = existing as ExportRequest;

    if (!approve) {
      const { error: updateError } = await supabase
        .from("export_requests")
        .update({
          status: "REJECTED",
          adminNotes: adminNotes ?? current.adminNotes
        })
        .eq("id", id);

      if (updateError) {
        console.error(updateError);
        return NextResponse.json(
          { error: "반려 처리 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, status: "REJECTED" });
    }

    const { error: updateError, data: updated } = await supabase
      .from("export_requests")
      .update({
        status: "APPROVED",
        adminNotes: adminNotes ?? current.adminNotes
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error(updateError);
      return NextResponse.json(
        { error: "승인 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const updatedReq = updated as ExportRequest;
    const { pdfUrl } = await generateBuyerPdfUrl(updatedReq);

    await sendMail({
      to: updatedReq.contactEmail,
      subject: "[ExportBuyer.AI] 수출 바이어 리포트 및 메일 템플릿",
      html: `
        <p>${updatedReq.contactName}님,</p>
        <p>수출 바이어 리스트 리포트와 영문 메일 초안을 준비했습니다.</p>
        <p><a href="${pdfUrl}">바이어 리스트 PDF 다운로드</a></p>
        <p><strong>영문 메일 초안:</strong></p>
        <pre>${updatedReq.aiMailDraft}</pre>
        <p>감사합니다.<br/>ExportBuyer.AI</p>
      `
    });

    return NextResponse.json({ ok: true, status: "APPROVED", pdfUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
