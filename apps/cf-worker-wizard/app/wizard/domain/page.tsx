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

export default function DomainPage() {
  return (
    <div className="space-y-6">
      <Stepper steps={steps} active={"domain"} />
      <Card>
        <CardHeader>
          <CardTitle>第 2 步：域名</CardTitle>
          <CardDescription>收集访问域名、目标域名与备用域名（占位）。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link href="/wizard/credentials">上一步</Link>
            </Button>
            <Button asChild>
              <Link href="/wizard/deploy">下一步</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
