import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Export Buyer Service",
  description: "AI 기반 수출 바이어 리스트 & 메일 템플릿 생성 서비스"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header
          style={{
            padding: "12px 24px",
            backgroundColor: "#0f172a",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 600 }}>ExportBuyer.AI</div>
          <nav style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
            <a href="/" style={{ color: "white", textDecoration: "none" }}>
              홈
            </a>
            <a
              href="/request"
              style={{ color: "white", textDecoration: "none" }}
            >
              수출 문의 등록
            </a>
            <a
              href="/admin"
              style={{ color: "white", textDecoration: "none" }}
            >
              운영자
            </a>
          </nav>
        </header>
        <main style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
