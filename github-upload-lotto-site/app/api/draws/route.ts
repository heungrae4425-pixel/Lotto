import { NextResponse } from "next/server";
import { getDraws } from "@/lib/lotto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30)));
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const q = searchParams.get("q") || undefined;
  const result = await getDraws(limit, (page - 1) * limit, q);

  return NextResponse.json({ page, limit, ...result });
}
