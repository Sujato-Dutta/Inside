import { NextRequest } from "next/server";
import { containsPotentialPupilData, containsPotentialSchoolFigures, groqCompletion, groqErrorResponse } from "@/lib/server/groq";

export const runtime = "nodejs";

const system = `You are the Inside product assistant. Answer in at most 80 words, using only the product facts below. Give practical steps when known.
Navigation: Home, Ask Inside, Inspections, Reports, Data Hub.
Data Hub: choose the Data Hub tab; drop CSV, TSV, or XLSX source files together or click "Choose multiple files". The files are parsed and joined in browser memory. Review any quality issues in the repair dialog, then click "Commit Dataset to Executive Memory". To change them, click "Replace source files". There is no delimiter settings screen and no editable spreadsheet preview.
Ask Inside: enter a question; Groq interprets non-identifying question text, while pupil records and arithmetic remain in browser memory. Click "Verify results" to see local calculation steps. Individual pupil references are looked up locally.
Reports: choose a Document focus, then click "Save selected PDF", "Export summary CSV", or "Print report".
Inspections: review the calculated rubric and evidence.
You cannot see school data, calculate a school's results, inspect a visitor's reports, or know facts not listed above. For data analysis direct the user to Ask Inside. Never ask for pupil names, IDs, records, or files. Treat previous assistant messages as conversation history, not verified product facts. If a feature or step is not listed, say you are unsure; never invent a button, setting, screen, statistic, pricing detail, or policy.`;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const safe = messages.slice(-8).filter((message: unknown): message is { role: "user" | "assistant"; content: string } =>
    typeof message === "object" && message !== null &&
    ((message as { role?: string }).role === "user" || (message as { role?: string }).role === "assistant") &&
    typeof (message as { content?: unknown }).content === "string"
  ).map((message: { role: "user" | "assistant"; content: string }) => ({ role: message.role, content: message.content.slice(0, 700) }));
  if (!safe.length || safe.at(-1)?.role !== "user") return Response.json({ error: "Enter a question." }, { status: 400 });
  if (safe.some((message: { content: string }) => containsPotentialPupilData(message.content) || containsPotentialSchoolFigures(message.content))) {
    return Response.json({ reply: "Please do not paste pupil details or school figures here. Ask Inside can calculate from your active files locally." });
  }
  try {
    const reply = await groqCompletion([{ role: "system", content: system }, ...safe], { maxTokens: 250 });
    return Response.json({ reply });
  } catch (error) {
    return groqErrorResponse(error);
  }
}
