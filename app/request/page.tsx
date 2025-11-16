"use client";

import { FormEvent, useState } from "react";

export default function RequestPage() {
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch("/api/request", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setResultMessage(`요청 실패: ${json.error ?? "알 수 없는 오류"}`);
      return;
    }

    setResultMessage(
      "요청이 접수되었습니다. 운영자 검수 후 이메일로 결과를 보내드립니다."
    );
    e.currentTarget.reset();
  }

  return (
    <div style={{ background: "white", padding: 24, borderRadius: 8 }}>
      <h2>수출 바이어 리포트 요청</h2>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        아래 정보를 입력해주시면, AI와 운영자가 함께 바이어 리스트 PDF와
        영문 메일 초안을 생성합니다.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          회사명
          <input name="companyName" required className="input" />
        </label>
        <label>
          담당자 이름
          <input name="contactName" required className="input" />
        </label>
        <label>
          담당자 이메일
          <input
            name="contactEmail"
            type="email"
            required
            className="input"
          />
        </label>
        <label>
          제품명
          <input name="productName" required className="input" />
        </label>
        <label>
          제품 카테고리
          <input name="productCategory" required className="input" />
        </label>
        <label>
          제품 주요 특징 (간단히)
          <textarea name="productFeatures" required className="textarea" />
        </label>
        <label>
          목표 지역
          <select name="targetRegion" required className="input">
            <option value="MIDDLE_EAST">중동</option>
            <option value="AMERICAS">미주</option>
            <option value="EUROPE">유럽</option>
          </select>
        </label>
        <label>
          인코텀즈
          <input name="incoterms" defaultValue="FOB Busan" className="input" />
        </label>
        <label>
          MOQ (최소 주문 수량)
          <input name="moq" required className="input" />
        </label>
        <label>
          희망 가격 범위 (선택)
          <input name="priceRange" className="input" />
        </label>
        <label>
          추가 메모 (선택)
          <textarea name="userNotes" className="textarea" />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "요청 중..." : "요청 제출"}
        </button>
      </form>

      {resultMessage && (
        <p style={{ marginTop: 16, fontSize: 14 }}>{resultMessage}</p>
      )}

      <style jsx>{`
        .input {
          display: block;
          width: 100%;
          margin-top: 4px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }
        .textarea {
          display: block;
          width: 100%;
          min-height: 80px;
          margin-top: 4px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }
        label {
          font-size: 14px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
