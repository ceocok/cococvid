import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflare Worker 向导",
  description: "一键部署 Worker、绑定路由并配置 CNAME",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <div className="container py-10">
          <h1 className="text-2xl font-bold mb-6">Cloudflare Worker 部署向导</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
