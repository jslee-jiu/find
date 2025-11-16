import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Supabase 환경변수가 아직 없으면 -> 그냥 빈 리스트 반환 (빌드용 / 데모용)
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
