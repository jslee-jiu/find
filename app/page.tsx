export default function HomePage() {
  return (
    <div style={{ background: "white", padding: 24, borderRadius: 8 }}>
      <h1>중소 제조업체 수출 바이어 리포트 서비스</h1>
      <p style={{ marginTop: 8 }}>
        간단한 정보만 입력하면, AI와 운영자가 함께{" "}
        <strong>바이어 리스트 PDF</strong>와{" "}
        <strong>수출 제안 메일 템플릿</strong>을 만들어드립니다.
      </p>

      <ul style={{ marginTop: 16 }}>
        <li>중동 / 미주 / 유럽 지역 바이어 후보 검색</li>
        <li>운영자 검수 후 PDF 리포트 생성</li>
        <li>바이어에게 보낼 영문 메일 템플릿 제공</li>
      </ul>

      <a
        href="/request"
        style={{
          marginTop: 24,
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: 6,
          textDecoration: "none"
        }}
      >
        수출 문의 등록하러 가기
      </a>
    </div>
  );
}
