import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflare Worker 向导 | 分步流程",
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
