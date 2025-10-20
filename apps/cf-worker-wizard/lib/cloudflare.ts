export type CFResult<T> = { success: boolean; errors: any[]; messages: any[]; result: T }

export async function cfFetch<T>(url: string, token: string, init?: RequestInit): Promise<CFResult<T>> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data = await res.json();
  return data;
}

export async function verifyToken(token: string) {
  const data = await cfFetch<{ id: string; status: string }>("https://api.cloudflare.com/client/v4/user/tokens/verify", token, { method: "GET" });
  return data.success && data.result?.status === "active";
}

export async function listZones(accountId: string, token: string) {
  const search = new URLSearchParams({ "account.id": accountId, per_page: "50" });
  const url = `https://api.cloudflare.com/client/v4/zones?${search.toString()}`;
  const data = await cfFetch<Array<{ id: string; name: string }>>(url, token, { method: "GET" });
  if (!data.success) throw new Error(formatCFError(data));
  return data.result;
}

export async function resolveZoneByHostname(accountId: string, token: string, hostname: string) {
  const zones = await listZones(accountId, token);
  const h = hostname.toLowerCase().replace(/^\*\./, "");
  // 找到最长匹配后缀
  const match = zones
    .filter(z => h === z.name || h.endsWith(`.${z.name}`))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (!match) throw new Error("找不到与该域名匹配的 Zone。请确认域名已托管在该账户下。");
  return match;
}

export async function deployWorker(accountId: string, token: string, scriptName: string, code: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${encodeURIComponent(scriptName)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/javascript",
    },
    body: code,
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.success) throw new Error(formatCFError(data));
  return data.result;
}

export async function listRoutes(zoneId: string, token: string) {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`;
  const data = await cfFetch<Array<{ id: string; pattern: string; script: string | null }>>(url, token, { method: "GET" });
  if (!data.success) throw new Error(formatCFError(data));
  return data.result;
}

export async function createOrUpdateRoute(zoneId: string, token: string, pattern: string, scriptName: string) {
  const routes = await listRoutes(zoneId, token);
  const existing = routes.find(r => r.pattern === pattern);
  if (existing) {
    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes/${existing.id}`;
    const data = await cfFetch(url, token, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ pattern, script: scriptName }) });
    if (!data.success) throw new Error(formatCFError(data));
    return { id: (data as any).result.id as string, pattern };
  }
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`;
  const data = await cfFetch(url, token, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pattern, script: scriptName }) });
  if (!(data as any).success) throw new Error(formatCFError(data));
  return { id: (data as any).result.id as string, pattern };
}

export async function upsertCNAME(zoneId: string, token: string, name: string, content: string, proxied = true) {
  // 先查找是否存在对应记录
  const search = new URLSearchParams({ type: "CNAME", name });
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?${search.toString()}`;
  const list = await cfFetch<Array<{ id: string; name: string; content: string }>>(listUrl, token, { method: "GET" });
  if (!list.success) throw new Error(formatCFError(list));
  const existing = list.result.find(r => r.name.toLowerCase() === name.toLowerCase());

  const payload = { type: "CNAME", name, content, proxied };

  if (existing) {
    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`;
    const data = await cfFetch(url, token, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!(data as any).success) throw new Error(formatCFError(data));
    return (data as any).result;
  }
  const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  const data = await cfFetch(createUrl, token, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  if (!(data as any).success) throw new Error(formatCFError(data));
  return (data as any).result;
}

export function formatCFError(data: any) {
  if (!data) return "请求失败";
  if (data.errors && data.errors.length) return data.errors.map((e: any) => e.message || e.code).join("; ");
  return data.message || "未知错误";
}
