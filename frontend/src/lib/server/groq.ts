const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "openai/gpt-oss-120b";

export function containsPotentialPupilData(text: string) {
  return /\b(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|STU-[a-z0-9-]+|(?:roll|student|pupil)\s*(?:number|no\.?|id|ref(?:erence)?)\s*[:#-]?\s*[a-z0-9-]{3,}|StudentID|Pupil_Ref_ID)\b/i.test(text)
    || /\b(?:marks?|grades?|scores?|results?)\s+(?:for|of|did)\s+(?!year\b|ks\d\b|the\b|our\b)[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/.test(text)
    || /\b(?:student|pupil|child|learner)\s+named\s+[A-Z][a-z]+/i.test(text);
}

export function containsPotentialSchoolFigures(text: string) {
  // A question can contain filters and public benchmarks, but never relay
  // user-supplied marks, counts or rates to the model as conversation text.
  const withoutSafeFilters = text
    .replace(/\b(?:year|y)\s*\d{1,2}\b/gi, "")
    .replace(/\bKS\s*[1-4]\b/gi, "")
    .replace(/\bterm\s*[12]\b/gi, "")
    .replace(/\b(?:bottom|top|lowest|highest|first|last)\s+\d{1,2}\b(?!\s*%)/gi, "")
    .replace(/\b(?:below|under|above|over|at least|less than|more than)\s*\d{1,3}\s*%/gi, "")
    .replace(/\b75\s*%\s*(?:DSIB|benchmark|reference)\b/gi, "")
    .replace(/\b(?:grade|level)\s*5\b/gi, "");
  return /\d/.test(withoutSafeFilters) || /[\r\n\t]/.test(text) || /(?:,|\|)[^,|]{1,40}(?:,|\|)[^,|]{1,40}(?:,|\|)/.test(text);
}

export class GroqServiceError extends Error {
  constructor(public readonly code: "missing_key" | "invalid_key" | "unavailable") {
    super(code === "missing_key" ? "Groq is not configured. Set GROQ_API_KEY in Vercel Environment Variables and redeploy."
      : code === "invalid_key" ? "Groq rejected the API key. Replace GROQ_API_KEY and redeploy."
      : "Groq is temporarily unavailable. Please try again shortly.");
  }
}

export async function groqCompletion(messages: { role: "system" | "user" | "assistant"; content: string }[], options?: { jsonSchema?: Record<string, unknown>; maxTokens?: number }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new GroqServiceError("missing_key");
  let response: Response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0,
        max_completion_tokens: options?.maxTokens ?? 450,
        reasoning_effort: "low",
        include_reasoning: false,
        ...(options?.jsonSchema ? { response_format: { type: "json_schema", json_schema: { name: "inside_ask_plan", strict: true, schema: options.jsonSchema } } } : {}),
      }),
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
  } catch {
    throw new GroqServiceError("unavailable");
  }
  if (response.status === 401 || response.status === 403) throw new GroqServiceError("invalid_key");
  if (!response.ok) throw new GroqServiceError("unavailable");
  const payload = await response.json().catch(() => null);
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new GroqServiceError("unavailable");
  return content.trim();
}

export function groqErrorResponse(error: unknown) {
  const failure = error instanceof GroqServiceError ? error : new GroqServiceError("unavailable");
  return Response.json({ error: failure.message, code: failure.code }, { status: failure.code === "missing_key" ? 503 : 502 });
}
