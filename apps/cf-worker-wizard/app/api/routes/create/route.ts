import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { createOrUpdateRoute } from "@/lib/cloudflare";

export async function POST(req: Request) {
  const ip = getClientIP(req.headers);
  const rl = rateLimit(`routes:create:${ip}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, message: `请求过于频繁，请稍后重试` }, { status: 429 });

  try {
    const { token, zoneId, scriptName, pattern } = await req.json();
    if (!token || !zoneId || !scriptName || !pattern) return NextResponse.json({ ok: false, message: '参数不完整' }, { status: 400 });

    const r = await createOrUpdateRoute(zoneId, token, pattern, scriptName);
    return NextResponse.json({ ok: true, routeId: r.id, pattern: r.pattern });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || '路由失败' }, { status: 500 });
  }
}
