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

export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <Stepper steps={steps} active={"summary"} />
      <Card>
        <CardHeader>
          <CardTitle>总结</CardTitle>
          <CardDescription>流程占位页。后续将展示最终信息与下一步操作。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link href="/wizard/dns">上一步</Link>
            </Button>
            <Button asChild>
              <Link href="/">回到首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
