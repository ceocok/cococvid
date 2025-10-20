import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { resolveZoneByHostname } from "@/lib/cloudflare";

export async function POST(req: Request) {
  const ip = getClientIP(req.headers);
  const rl = rateLimit(`zones:resolve:${ip}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, message: `请求过于频繁，请稍后重试` }, { status: 429 });

  try {
    const { token, accountId, hostname } = await req.json();
    if (!token || !accountId || !hostname) return NextResponse.json({ ok: false, message: '参数不完整' }, { status: 400 });

    const zone = await resolveZoneByHostname(accountId, token, hostname);
    return NextResponse.json({ ok: true, zoneId: zone.id, zoneName: zone.name });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || '解析失败' }, { status: 500 });
  }
}
