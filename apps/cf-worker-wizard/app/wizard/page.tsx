import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";

const steps: Step[] = [
  { id: "credentials", label: "凭证" },
  { id: "domain", label: "域名" },
  { id: "deploy", label: "部署 Worker" },
  { id: "route", label: "路由" },
  { id: "dns", label: "DNS" },
  { id: "summary", label: "总结" },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <Stepper steps={steps} active={"credentials"} />

      <Card>
        <CardHeader>
          <CardTitle>向导入口</CardTitle>
          <CardDescription>这是预留的多步骤页面集合。点击开始进入第 1 步。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/wizard/credentials">开始</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
