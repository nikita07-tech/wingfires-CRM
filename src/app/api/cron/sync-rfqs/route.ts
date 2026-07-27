import { NextRequest, NextResponse } from "next/server";
import { syncRfqsFromWebsite } from "@/lib/sync";

export async function GET(req: NextRequest) {
  // Vercel Cron sends this automatically when CRON_SECRET is set as an env
  // var; this just checks the request really came from your scheduled job
  // and not some random visitor hitting the URL.
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncRfqsFromWebsite();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
