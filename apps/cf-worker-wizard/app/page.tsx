"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { workerTemplate } from "@/lib/worker-template";

interface VerifyResp { ok: boolean; message?: string }
interface ResolveResp { ok: boolean; zoneId?: string; zoneName?: string; message?: string }
interface DeployResp { ok: boolean; scriptName?: string; message?: string }
interface RouteResp { ok: boolean; routeId?: string; pattern?: string; message?: string }
interface DnsResp { ok: boolean; recordId?: string; name?: string; content?: string; proxied?: boolean; message?: string }

export default function Page() {
  const [step, setStep] = useState(1);

  // 全局数据
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState("");

  const [accessDomain, setAccessDomain] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [fallbackDomain, setFallbackDomain] = useState("");
  const [preferredDomain, setPreferredDomain] = useState("");

  const [zoneId, setZoneId] = useState<string | undefined>();
  const [zoneName, setZoneName] = useState<string | undefined>();

  const [scriptName, setScriptName] = useState<string>("proxy-" + Math.random().toString(36).slice(2, 8));
  const [routePattern, setRoutePattern] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const code = useMemo(() => {
    return workerTemplate({ accessDomain, targetDomain, fallbackDomain: fallbackDomain || undefined });
  }, [accessDomain, targetDomain, fallbackDomain]);

  const handleVerify = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
      const data: VerifyResp = await res.json();
      if (!data.ok) throw new Error(data.message || "验证失败");
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveZone = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/zones/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, accountId, hostname: accessDomain }) });
      const data: ResolveResp = await res.json();
      if (!data.ok || !data.zoneId) throw new Error(data.message || "找不到对应的区域");
      setZoneId(data.zoneId);
      setZoneName(data.zoneName);
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployWorker = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/worker/deploy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, accountId, scriptName, code }) });
      const data: DeployResp = await res.json();
      if (!data.ok) throw new Error(data.message || "部署失败");
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const pattern = `*${accessDomain}/*`;
      setRoutePattern(pattern);
      const res = await fetch("/api/routes/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, zoneId, scriptName, pattern }) });
      const data: RouteResp = await res.json();
      if (!data.ok) throw new Error(data.message || "创建路由失败");
      setStep(5);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpsertDNS = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const content = preferredDomain.trim() || "cdns.doon.eu.org";
      const res = await fetch("/api/dns/cname-upsert", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, zoneId, name: accessDomain, content, proxied: true }) });
      const data: DnsResp = await res.json();
      if (!data.ok) throw new Error(data.message || "DNS 配置失败");
      setStep(6);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Steps step={step} />

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>凭证</CardTitle>
            <CardDescription>输入 Cloudflare API Token 与 Account ID。不会被保存。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">API Token</Label>
              <Input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="形如 CF-..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input id="accountId" value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="从 Cloudflare 仪表盘查看" />
            </div>
            <div>
              <Button onClick={handleVerify} disabled={loading || !token || !accountId}>验证并继续</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>域名</CardTitle>
            <CardDescription>填入访问域名、目标域名，必要时设置备用域名（可选）。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="access">访问域名</Label>
              <Input id="access" value={accessDomain} onChange={(e) => setAccessDomain(e.target.value.trim())} placeholder="例如: mv.cococ.co" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">目标域名</Label>
              <Input id="target" value={targetDomain} onChange={(e) => setTargetDomain(e.target.value.trim())} placeholder="例如: 目标站点域名" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fallback">备用域名（可选）</Label>
              <Input id="fallback" value={fallbackDomain} onChange={(e) => setFallbackDomain(e.target.value.trim())} placeholder="无可留空" />
            </div>
            <div>
              <Button onClick={handleResolveZone} disabled={loading || !accessDomain || !targetDomain}>解析所属 Zone</Button>
            </div>
            {zoneName && (
              <p className="text-sm text-muted-foreground">所属区域：{zoneName}（ID: {zoneId}）</p>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>部署 Worker</CardTitle>
            <CardDescription>将按模板生成并部署到你的账户。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="script">脚本名</Label>
              <Input id="script" value={scriptName} onChange={(e) => setScriptName(e.target.value.trim())} placeholder="例如: proxy-mv" />
              <p className="text-xs text-muted-foreground">若同名已存在会覆盖更新。</p>
            </div>
            <div className="grid gap-2">
              <Label>将要部署的代码预览</Label>
              <pre className="p-3 rounded border text-xs max-h-64 overflow-auto whitespace-pre-wrap">{code}</pre>
            </div>
            <div>
              <Button onClick={handleDeployWorker} disabled={loading || !scriptName}>部署</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>绑定路由</CardTitle>
            <CardDescription>将在 {zoneName} 区域创建/更新路由。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>路由模式</Label>
              <Input readOnly value={`*${accessDomain}/*`} />
              <p className="text-xs text-muted-foreground">会将该路由绑定到脚本 {scriptName}</p>
            </div>
            <div>
              <Button onClick={handleCreateRoute} disabled={loading || !zoneId}>创建/更新</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>DNS 配置</CardTitle>
            <CardDescription>为 {accessDomain} 创建/更新 CNAME 记录。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>指向（默认 cdns.doon.eu.org）</Label>
              <Input value={preferredDomain} onChange={(e) => setPreferredDomain(e.target.value.trim())} placeholder="自定义可填此处" />
            </div>
            <div>
              <Button onClick={handleUpsertDNS} disabled={loading || !zoneId}>创建/更新</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>完成</CardTitle>
            <CardDescription>所有步骤均已完成。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>脚本名：<b>{scriptName}</b></p>
            <p>路由：<b>{routePattern || `*${accessDomain}/*`}</b></p>
            <p>DNS：<b>{accessDomain}</b> CNAME 指向 <b>{preferredDomain || "cdns.doon.eu.org"}</b>（已代理）</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const steps = [
    { id: 1, label: "凭证" },
    { id: 2, label: "域名" },
    { id: 3, label: "部署 Worker" },
    { id: 4, label: "路由" },
    { id: 5, label: "DNS" },
    { id: 6, label: "总结" },
  ];
  return (
    <ol className="flex items-center gap-2 text-sm">
      {steps.map((s) => (
        <li key={s.id} className={cn("flex items-center gap-2", step === s.id ? "font-semibold" : step > s.id ? "text-green-600" : "text-muted-foreground") }>
          <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full border", step > s.id ? "bg-green-600 text-white border-green-600" : step === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/60")}>{s.id}</span>
          <span>{s.label}</span>
          {s.id !== steps.length && <span className="mx-2 text-muted-foreground">/</span>}
        </li>
      ))}
    </ol>
  );
}
