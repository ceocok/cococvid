import Link from "next/link";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps: Step[] = [
  { id: "credentials", label: "凭证" },
  { id: "domain", label: "域名" },
  { id: "deploy", label: "部署 Worker" },
  { id: "route", label: "路由" },
  { id: "dns", label: "DNS" },
  { id: "summary", label: "总结" },
];

export default function CredentialsPage() {
  return (
    <div className="space-y-6">
      <Stepper steps={steps} active={"credentials"} />
      <Card>
        <CardHeader>
          <CardTitle>第 1 步：凭证</CardTitle>
          <CardDescription>在此处收集 Cloudflare API Token 与 Account ID（占位）。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link href="/wizard">返回</Link>
            </Button>
            <Button asChild>
              <Link href="/wizard/domain">下一步</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
