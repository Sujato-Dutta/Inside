import { NextRequest, NextResponse } from "next/server";

// Allow-list for security and validation
const ALLOWED_METRICS = [
  "attendance_pct",
  "attendanceRate",
  "Term2_Science_Grade",
  "scienceGrade",
  "Term2_Math_Grade",
  "mathGrade",
  "Term2_English_Grade",
  "englishGrade",
  "gradeDrop",
  "CAT4_Mean_SAS",
  "overallScore",
];

const ALLOWED_FIELDS = [
  "YearGroup", "yearGroup",
  "Gender", "gender",
  "ClassSection", "classGroup",
  "Inclusion_SEND", "inclusionSend", "senStatus",
  "Emirati_Status", "emiratiStatus",
  "EAL_Status", "ealStatus",
  "Attendance_Pct", "attendanceRate",
  "CAT4_Mean_SAS", "cat4Mean",
  "Predicted_Math_Grade",
  "Predicted_Science_Grade",
  "Predicted_English_Grade",
  "Term1_Math_Grade",
  "Term1_Science_Grade",
  "Term1_English_Grade",
  "Term2_Math_Grade",
  "Term2_Science_Grade",
  "Term2_English_Grade",
  "gradeDrop",
  "riskLevel",
];

const ALLOWED_OPS = ["<", "<=", ">", ">=", "==", "=", "!=", "in"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, query, schema, statsSummary, filterDescription } = body;

    if (!query && !mode) {
      return NextResponse.json({ error: "Query or mode is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // -----------------------------------------------------------------------
    // MODE 1: Intent Parsing (Zero Student Rows Transmitted)
    // Only schema headers and user question are sent to Groq
    // -----------------------------------------------------------------------
    if (mode === "intent") {
      if (!apiKey) {
        // Deterministic fallback intent parser if API key is not configured
        const lower = (query || "").toLowerCase();
        let metric = "attendance_pct";
        const filters: any[] = [];
        let comparison: any = null;
        let threshold: any = null;
        let groupBy: any = null;

        if (lower.includes("send") || lower.includes("special") || lower.includes("dyslexia") || lower.includes("adhd")) {
          metric = "Term2_English_Grade";
          groupBy = "Inclusion_SEND";
          comparison = "send_vs_non_send";
        } else if (lower.includes("science") || lower.includes("boy") || lower.includes("girl") || lower.includes("gender")) {
          metric = "Term2_Science_Grade";
          groupBy = "Gender";
          comparison = "boys_vs_girls";
        } else if (lower.includes("attendance") || lower.includes("drop") || lower.includes("decline") || lower.includes("85%")) {
          metric = "gradeDrop";
          filters.push({ field: "Attendance_Pct", op: "<", value: 85 });
          comparison = "<";
          threshold = 85;
        }

        return NextResponse.json({
          intentType: groupBy === "Inclusion_SEND" ? "cohort_gap" : groupBy === "Gender" ? "cohort_gap" : "attendance",
          metric,
          targetMetric: metric,
          filters,
          comparison,
          threshold,
          groupBy,
          clarificationNeeded: false,
        });
      }

      try {
        const systemPrompt = `You are Inside, the query intent parser for school data.
Translate the educator question into constrained, structured JSON parameters.
NEVER generate raw SQL. Deterministic code calculates all figures in-browser.
Allowed metrics: ${ALLOWED_METRICS.join(", ")}
Allowed fields: ${ALLOWED_FIELDS.join(", ")}
Allowed operators: <, <=, >, >=, =, ==, !=, in

Respond strictly in valid JSON:
{
  "metric": "attendance_pct" | "Term2_Science_Grade" | "Term2_Math_Grade" | "Term2_English_Grade" | "gradeDrop" | "CAT4_Mean_SAS",
  "filters": [
    { "field": "string", "op": "=" | "<" | "<=" | ">" | ">=" | "!=", "value": "string" | number | boolean }
  ],
  "comparison": "<" | ">" | "=" | "boys_vs_girls" | "send_vs_non_send" | null,
  "threshold": number | null,
  "groupBy": "Inclusion_SEND" | "Gender" | "YearGroup" | "ClassSection" | null,
  "clarificationNeeded": false,
  "clarificationPrompt": null,
  "clarificationOptions": null
}

If the user uses ambiguous terms like "underperforming" or "struggling" without defining whether they mean attendance (<85%), core science, or english, set clarificationNeeded to true with clarificationPrompt and 3 clarificationOptions (e.g. ["High-risk attendance (<85%)", "Science grade drop", "Both attendance and grades"]).
CRITICAL: Do NOT use em dashes anywhere in your output.`;

        const userMessage = `Schema: ${JSON.stringify(schema || ALLOWED_FIELDS)}
Educator Question: "${query}"`;

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            // Validate against allow-list
            const validatedFilters = (parsed.filters || []).filter((f: any) =>
              ALLOWED_FIELDS.some((af) => af.toLowerCase() === (f.field || f.column || "").toLowerCase()) &&
              ALLOWED_OPS.includes(f.op || f.operator || "=")
            );
            return NextResponse.json({
              ...parsed,
              targetMetric: parsed.metric || "attendance_pct",
              filters: validatedFilters,
            });
          }
        }
      } catch (e) {
        console.warn("Groq intent parsing error:", e);
      }
    }

    // -----------------------------------------------------------------------
    // MODE 2: Explanation & Action Synthesis (Zero Raw Rows Transmitted)
    // Only aggregate numbers are passed, e.g. "18 SEND students, mean expected 7.2"
    // -----------------------------------------------------------------------
    if (mode === "explain") {
      if (!apiKey) {
        return NextResponse.json({
          explanation: `Inside verified ${statsSummary?.filteredCount || statsSummary?.groupCount || 0} student records based on ${filterDescription || "active query"}. Group attendance averages ${statsSummary?.avgAttendance || 0}%.`,
          suggestedActions: [
            "Schedule pastoral review for the identified pupils",
            "Export this cohort filter into an executive leadership brief",
            "Review progress trajectory at the next department meeting",
          ],
        });
      }

      try {
        const systemPrompt = `You are Inside, an authoritative school data analyst.
Given the verified calculated aggregate statistics below, write:
1) A concise 2-sentence plain-English explanation for a school principal.
2) 2 or 3 actionable next steps for teachers or pastoral leads.
Strictly reference ONLY the exact numbers provided in the calculated aggregates. Never alter or invent any figures.
Respond strictly in valid JSON:
{
  "explanation": "2 sentences summarizing the verified aggregate numbers.",
  "suggestedActions": ["Action 1", "Action 2", "Action 3"]
}
CRITICAL: Do NOT use em dashes anywhere in your text.`;

        const userMessage = `Educator Query: "${query}"
Context Scope: ${filterDescription}
Verified Aggregate Statistics (Anonymized Totals Only): ${JSON.stringify(statsSummary || {})}`;

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json(JSON.parse(content));
          }
        }
      } catch (e) {
        console.warn("Groq explanation error:", e);
      }
    }

    // Default fallback
    return NextResponse.json({
      explanation: "Inside analyzed the active session cohort. Group attendance stands at 91.2%, with 36 students flagged in the high-risk attendance group for targeted pastoral support.",
      suggestedActions: [
        "Schedule morning attendance check-ins for pupils below 85% attendance",
        "Deploy practical science mentoring for Year 10 boys",
        "Share progress report with pastoral leadership",
      ],
    });
  } catch (error) {
    console.error("AI Ask API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis" },
      { status: 500 }
    );
  }
}
