import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { deployWorker } from "@/lib/cloudflare";

export async function POST(req: Request) {
  const ip = getClientIP(req.headers);
  const rl = rateLimit(`worker:deploy:${ip}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, message: `请求过于频繁，请稍后重试` }, { status: 429 });

  try {
    const { token, accountId, scriptName, code } = await req.json();
    if (!token || !accountId || !scriptName || !code) return NextResponse.json({ ok: false, message: '参数不完整' }, { status: 400 });

    await deployWorker(accountId, token, scriptName, code);
    return NextResponse.json({ ok: true, scriptName });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message || '部署失败' }, { status: 500 });
  }
}
