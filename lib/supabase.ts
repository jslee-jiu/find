// lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. DB 연동이 동작하지 않을 수 있습니다."
  );

  // 빌드는 통과시키되, 런타임에 사용하려고 하면 에러 던지기
  supabase = {
    from() {
      throw new Error(
        "Supabase 환경변수가 설정되지 않았습니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 먼저 설정해주세요."
      );
    }
    // 필요한 경우 여기다 다른 메서드도 흉내낼 수 있지만,
    // 지금은 from()만 있어도 우리 코드가 돌아감.
  } as unknown as SupabaseClient;
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
