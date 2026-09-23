import { NextRequest, NextResponse } from "next/server";

const answers = [
  { match: /privacy|data|store|retention/, reply: "Inside keeps school rows in volatile browser memory only. Raw pupil data is never sent to an LLM, cloud database, or remote report renderer." },
  { match: /upload|excel|csv|xlsx|mis/, reply: "Open Data Hub and select all related CSV, TSV, or Excel files together. Inside validates, joins, and repairs them locally by pupil reference before commit." },
  { match: /inspection|khda|dsib|adek/, reply: "The Inspections workspace applies deterministic six-tier UAE rubric calculations and exposes the exact numerator, denominator, threshold, and evidence range." },
  { match: /report|pdf|governor/, reply: "Reports produces a six-page evidence dossier with redaction controls, a SHA-256 calculation checksum, governance signatures, CSV export, and browser-native PDF printing." },
  { match: /price|pricing|cost/, reply: "Annual campus licensing is AED 28,000, AED 38,000, or AED 48,000 based only on executive seat capacity. Every tier includes the complete platform." },
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const question = String(messages.at(-1)?.content || "").slice(0, 500);
  const reply = answers.find((item) => item.match.test(question.toLowerCase()))?.reply ||
    "I can explain Inside's five workspaces, privacy architecture, UAE inspection calculations, campus licensing, or how to load school files.";
  return NextResponse.json({ reply, localOnly: true });
}
