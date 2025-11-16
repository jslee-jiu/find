import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
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
