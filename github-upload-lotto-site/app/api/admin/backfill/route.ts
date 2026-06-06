import { NextResponse } from "next/server";
import { authorizeCron, backfillDrawsFromResultPage } from "@/lib/lotto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "CRON_SECRET is not configured.",
        message: "Create .env.local in the project root and set CRON_SECRET, then restart the dev server."
      },
      { status: 500 }
    );
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase environment variables are not configured.",
        message: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart the dev server."
      },
      { status: 500 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("eyJ")) {
    return NextResponse.json(
      {
        ok: false,
        error: "SUPABASE_SERVICE_ROLE_KEY is not a real key.",
        message: "Replace the placeholder text in .env.local with the real Supabase service_role key from Project Settings > API."
      },
      { status: 500 }
    );
  }

  if (!authorizeCron(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
        message: "The secret query value does not match CRON_SECRET in .env.local."
      },
      { status: 401 }
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const start = Number(searchParams.get("start") || 1);
  const max = Number(searchParams.get("max") || 100);
  const safeStart = Number.isInteger(start) && start > 0 ? start : 1;
  const safeMax = Number.isInteger(max) && max > 0 ? Math.min(max, 300) : 100;

  try {
    const result = await backfillDrawsFromResultPage(safeStart, 180, safeMax);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Lotto data collection or Supabase save failed."
      },
      { status: 500 }
    );
  }
}
