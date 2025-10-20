import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/utils";
import { verifyToken } from "@/lib/cloudflare";

export async function POST(req: Request) {
  const ip = getClientIP(req.headers);
  const rl = rateLimit(`verify:${ip}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, message: `请求过于频繁，请稍后重试` }, { status: 429 });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') return NextResponse.json({ ok: false, message: '缺少 token' }, { status: 400 });

    const ok = await verifyToken(token);
    if (!ok) return NextResponse.json({ ok: false, message: 'Token 无效或未激活' }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || '服务器错误' }, { status: 500 });
  }
}
