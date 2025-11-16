"use client";

import { useEffect, useState } from "react";
import type { ExportRequest } from "@/lib/types";

export default function AdminPage() {
  const [requests, setRequests] = useState<ExportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/requests");
    const json = await res.json();
    setRequests(json.requests ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  async function handleApprove(approve: boolean) {
    if (!selected) return;
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      body: JSON.stringify({
        id: selected.id,
        approve,
        adminNotes
      }),
      headers: { "Content-Type": "application/json" }
    });
    const json = await res.json();
    if (!res.ok) {
      alert("처리 실패: " + json.error);
      return;
    }
    alert("처리 완료");
    setAdminNotes("");
    await load();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      <div style={{ background: "white", padding: 16, borderRadius: 8 }}>
        <h2>요청 목록</h2>
        {loading && <p>불러오는 중...</p>}
        {!loading && requests.length === 0 && <p>요청이 없습니다.</p>}
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
              onClick={() => setSelectedId(r.id)}
            >
              <div style={{ fontWeight: 600 }}>{r.companyName}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {r.productName} / {r.targetRegion} / {r.status}
              </div>
            </li>
          ))}
        </ul>
      </div>

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
              {selected.aiBuyerListDraft}
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
              {selected.aiMailDraft}
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
