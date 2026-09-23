import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Report data is never processed server-side.",
      action: "Use the client-side Reports workspace to calculate and export the dossier.",
    },
    { status: 410 }
  );
}
