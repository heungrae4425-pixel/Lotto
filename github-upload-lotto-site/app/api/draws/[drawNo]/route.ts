import { NextResponse } from "next/server";
import { getDrawByNo } from "@/lib/lotto";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ drawNo: string }> }) {
  const { drawNo } = await params;
  const draw = await getDrawByNo(Number(drawNo));

  if (!draw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(draw);
}
