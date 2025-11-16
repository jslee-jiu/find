// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// any로 타입을 느슨하게 해서, env 없을 때 더미 클라이언트 써도 타입에 안 걸리게 함
let supabase: any;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 더미 Supabase 클라이언트를 사용합니다."
  );

  // 👉 여기서는 "진짜 DB 호출" 대신, 안전하게 실패하는 더미 객체를 리턴
  supabase = {
    from() {
      // 체이닝 때문에 eq().order().select() 형태를 맞춰줘야 해서 this를 계속 반환
      return {
        eq() {
          return this;
        },
        order() {
          return this;
        },
        // select: 리스트 조회용
        async select() {
          // 에러 없이 "데이터 없음"으로 응답
          return { data: [], error: null };
        },
        // insert: 삽입 시도
        async insert() {
          return {
            data: null,
            error: new Error("Supabase가 구성되지 않아 DB에 저장되지 않았습니다.")
          };
        },
        // update: 수정 시도
        async update() {
          return {
            data: null,
            error: new Error("Supabase가 구성되지 않아 DB 업데이트가 되지 않았습니다.")
          };
        },
        // single: 단일 레코드 조회
        async single() {
          return {
            data: null,
            error: new Error("Supabase가 구성되지 않아 데이터를 찾을 수 없습니다.")
          };
        }
      };
    }
  };
} else {
  // ✅ env가 제대로 설정된 경우에만 실제 Supabase 클라이언트 생성
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
