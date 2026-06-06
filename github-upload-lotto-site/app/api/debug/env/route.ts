import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function describe(value: string | undefined) {
  return {
    exists: Boolean(value),
    length: value?.length || 0,
    startsWithEyJ: value?.startsWith("eyJ") || false,
    prefix: value ? value.slice(0, 6) : ""
  };
}

export async function GET() {
  return NextResponse.json({
    supabaseUrl: describe(process.env.SUPABASE_URL),
    supabaseAnonKey: describe(process.env.SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: describe(process.env.SUPABASE_SERVICE_ROLE_KEY),
    cronSecret: {
      exists: Boolean(process.env.CRON_SECRET),
      length: process.env.CRON_SECRET?.length || 0
    }
  });
}
