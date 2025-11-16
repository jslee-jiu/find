import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ requests: [] });
  }

  const { data, error } = await supabase!
    .from("export_requests")
    .select("*"); // ← order 날리고 그냥 전체 가져오기

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "요청 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ requests: data ?? [] });
}
