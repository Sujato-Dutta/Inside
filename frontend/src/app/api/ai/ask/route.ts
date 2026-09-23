import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const query = String(body.query || "").slice(0, 500);
  const lower = query.toLowerCase();
  const filters: Record<string, string | number | boolean> = {};
  if (/send|determination|inclusion/.test(lower)) filters.send = true;
  if (/boy|male/.test(lower)) filters.gender = "Male";
  if (/girl|female/.test(lower)) filters.gender = "Female";
  if (/science/.test(lower)) filters.subject = "Science";
  if (/math/.test(lower)) filters.subject = "Mathematics";
  if (/english/.test(lower)) filters.subject = "English";
  const attendance = lower.match(/attendance\s*(?:below|under|<)\s*(\d{2,3})/);
  if (attendance) filters.attendance_lt = Number(attendance[1]);
  return NextResponse.json({
    intent: /duplicate|mapping|data quality/.test(lower) ? "data_quality" : /progress/.test(lower) ? "progress" : "attainment",
    filters,
    localExecutionRequired: true,
    piiAccepted: false,
  });
}
