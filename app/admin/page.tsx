"use client";

import { useEffect, useState } from "react";

type ExportRequestItem = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  productName: string;
  targetRegion: string;
  status: string;
  aiBuyerListDraft?: string | null;
  aiMailDraft?: string | null;
  adminNotes?: string | null;
};

export default function AdminPage() {
  const [requests, setRequests] = useState<ExportRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch("/api/admin/requests");
        const json = await res.json();

        // 우리가 확인한 JSON 구조: { requests: [...] }
        setRequests(json.requests ?? []);
      } catch (err) {
        console.error(err);
        setErrorMsg("요청 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  async function handleApprove(approve: boolean) {
    if (!selected) return;

    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          approve,
          adminNotes
        })
      });

      const json = await res.json();
      if (!res.ok) {
        alert("처리 실패: " + (json.error ?? "알 수 없는 오류"));
        return;
      }

      alert(approve ? "승인 완료" : "반려 완료");

      // 상태 갱신을 위해 목록 다시 불러오기
      const listRes = await fetch("/api/admin/requests");
      const listJson = await listRes.json();
      setRequests(listJson.requests ?? []);
      setSelectedId(null);
      setAdminNotes("");
    } catch (err) {
      console.error(err);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      {/* 왼쪽: 요청 리스트 */}
      <div style={{ background: "white", padding: 16, borderRadius: 8 }}>
        <h2>요청 목록</h2>
        {loading && <p>불러오는 중...</p>}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {!loading && !errorMsg && requests.length === 0 && (
          <p>요청이 없습니다.</p>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {requests.map((r) => (
            <li
              key={r.id}
              style={{
                padding: 8,
                borderRadius: 6,
                marginBottom: 8,
                border:
                  selectedId === r.id
                    ? "2px solid #2563eb"
                    : "1px solid #e5e7eb",
                cursor: "pointer",
                backgroundColor: "#fff"
              }}
              onClick={() => {
                setSelectedId(r.id);
                setAdminNotes(r.adminNotes ?? "");
              }}
            >
              <div style={{ fontWeight: 600 }}>{r.companyName}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {r.productName} / {r.targetRegion} / {r.status}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>
                담당자: {r.contactName} ({r.contactEmail})
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 오른쪽: 상세 & 검수 */}
      <div style={{ background: "white", padding: 16, borderRadius: 8 }}>
        <h2>요청 상세 & 검수</h2>
        {!selected && <p>왼쪽에서 요청을 선택하세요.</p>}
        {selected && (
          <>
            <h3>
              {selected.companyName} — {selected.productName}
            </h3>
            <p style={{ fontSize: 13 }}>
              담당자: {selected.contactName} ({selected.contactEmail})
            </p>
            <p style={{ fontSize: 12, color: "#555" }}>
              상태: <strong>{selected.status}</strong>
            </p>

            <h4>AI 바이어 리스트 초안</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 12,
                background: "#f3f4f6",
                padding: 8,
                borderRadius: 4
              }}
            >
              {selected.aiBuyerListDraft || "(내용 없음)"}
            </pre>

            <h4>AI 메일 초안</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 12,
                background: "#f3f4f6",
                padding: 8,
                borderRadius: 4
              }}
            >
              {selected.aiMailDraft || "(내용 없음)"}
            </pre>

            <h4>운영자 메모</h4>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              style={{
                width: "100%",
                minHeight: 80,
                fontSize: 13,
                borderRadius: 4,
                border: "1px solid #d1d5db",
                padding: 8
              }}
            />

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                onClick={() => handleApprove(true)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                승인 & PDF/메일 발송
              </button>
              <button
                onClick={() => handleApprove(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ef4444",
                  backgroundColor: "white",
                  color: "#ef4444",
                  cursor: "pointer"
                }}
              >
                반려
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
