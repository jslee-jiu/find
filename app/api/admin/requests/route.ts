// app/api/admin/requests/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Supabase env 없으면 빌드 통과용 — 빈 리스트 반환
  if (!supabase) {
    return NextResponse.json({ requests: [] });
  }

  const { data, error } = await supabase
    .from("export_requests")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "요청 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ requests: data ?? [] });
}
