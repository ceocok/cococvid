import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { upsertCNAME } from "@/lib/cloudflare";

export async function POST(req: Request) {
  const ip = getClientIP(req.headers);
  const rl = rateLimit(`dns:cname:${ip}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, message: `请求过于频繁，请稍后重试` }, { status: 429 });

  try {
    const { token, zoneId, name, content, proxied } = await req.json();
    if (!token || !zoneId || !name) return NextResponse.json({ ok: false, message: '参数不完整' }, { status: 400 });
    const target = (content && typeof content === 'string' && content.trim()) || 'cdns.doon.eu.org';
    const rec = await upsertCNAME(zoneId, token, name, target, proxied !== false);
    return NextResponse.json({ ok: true, recordId: rec.id, name: rec.name, content: rec.content, proxied: rec.proxied });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || 'DNS 操作失败' }, { status: 500 });
  }
}
