import { NextResponse } from "next/server";
import { authorizeCron, updateLatestDraw } from "@/lib/lotto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await updateLatestDraw();
  return NextResponse.json({ ok: true, ...result });
}
