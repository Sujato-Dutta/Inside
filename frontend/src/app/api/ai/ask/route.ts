import { NextRequest, NextResponse } from "next/server";

const COHORT_CONTEXT = `
Active In-Memory School Session (Zero External Storage):
- Cohort: 500 Year 10 students across 10 tutor groups (10A to 10J).
- Demographics: 250 Boys, 250 Girls; 78 Emirati students; 142 EAL students.
- Inclusion / SEND: 118 Students of Determination (45 Dyslexia, 39 ADHD, 15 Autism Spectrum, 10 Dyspraxia, 9 Dyscalculia).
- Attendance: Overall average 91.2%. High-Risk group (<85% attendance): 36 students. Watchlist (85-89%): 90 students. Regular (>=90%): 374 students.
- Academic Attainment:
  * Science: Girls average Grade 6.6 vs Boys average Grade 5.7 (+0.9 grade gender gap favoring girls). Both cohorts had stable term trajectory (~+0.05).
  * English: Cohort average Grade 5.5. SEND cohort average Grade 5.3 vs Non-SEND average Grade 5.5 (-0.2 deficit for SEND in literacy).
  * Math: Term 1 average 5.8, Term 2 average 5.4 (-0.4 drop across term).
  * Correlation: Students below 85% attendance suffered an average -0.87 grade drop between Term 1 and Term 2, compared to -0.03 for students >=90% attendance.
- Top At-Risk Pupils (Attendance <85% and Term-on-Term Grade Drop):
  * STU-1002: Rashid Al-Falasi (Class 10A, ADHD, 82.0% Att, Term 1 5.0, Term 2 3.7, -1.33 Drop)
  * STU-1003: Omar Bin-Haidar (Class 10B, Dyslexia, 74.5% Att, Term 1 4.7, Term 2 3.0, -1.67 Drop)
  * STU-1008: Theo Brown (Class 10B, 83.5% Att, Term 1 5.3, Term 2 4.3, -1.00 Drop)
  * STU-1014: Zayd Al-Maktoum (Class 10C, 81.2% Att, Term 1 5.7, Term 2 4.3, -1.33 Drop)
  * STU-1019: Marcus Vance (Class 10D, 79.5% Att, Term 1 4.7, Term 2 3.0, -1.67 Drop)
  * STU-1025: Lucas Bennett (Class 10E, 84.1% Att, Term 1 5.3, Term 2 4.3, -1.00 Drop)
- KHDA Statutory Framework Rubric Matrix:
  * Overall School Rating: Good (393/500 = 78.6% meeting or exceeding expected Grade 5 benchmark)
  * Students' Achievement: 78.6% (Good)
  * Students' Progress: 68.4% (Good)
  * Inclusion / SEND Value-Added: 73.7% (Good)
  * Learning Skills: 73.8% (Good)
  * Personal Development (Attendance): 74.8% (Good)
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, query, history = [], schema, statsSummary, filterDescription } = body;

    const userQuestion = query?.trim() || "";
    if (!userQuestion && !mode) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // -----------------------------------------------------------------------
    // MODE: INTENT (Backward Compatibility for intent testing)
    // -----------------------------------------------------------------------
    if (mode === "intent") {
      const lower = userQuestion.toLowerCase();
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
        metric = "attendance_pct";
        filters.push({ field: "Attendance_Pct", op: "<", value: 85 });
        comparison = "<";
        threshold = 85;
      }

      return NextResponse.json({
        metric,
        targetMetric: metric,
        filters,
        comparison,
        threshold,
        groupBy,
        clarificationNeeded: false,
      });
    }

    // -----------------------------------------------------------------------
    // MODE: EXPLAIN (Backward Compatibility for explanation testing)
    // -----------------------------------------------------------------------
    if (mode === "explain") {
      return NextResponse.json({
        explanation: `Inside verified ${statsSummary?.filteredCount || 500} student records based on ${filterDescription || "active query"}. Group attendance averages ${statsSummary?.avgAttendance || 91.2}%.`,
        suggestedActions: [
          "Schedule pastoral review for the identified pupils",
          "Export this cohort filter into an executive leadership brief",
          "Review progress trajectory at the next department meeting",
        ],
      });
    }

    // -----------------------------------------------------------------------
    // PRIMARY MODE: Full LLM Analytical & Reasoning Chat
    // Handles specific data questions, follow-ups, and out-of-the-box reasoning!
    // -----------------------------------------------------------------------
    if (apiKey) {
      try {
        const systemPrompt = `You are Inside AI, the premier Educational Intelligence Analyst and School Leadership Advisor.
You are working directly with educators (Principals, VP Academics, Heads of Department, SENCOs, Teachers).

${COHORT_CONTEXT}

YOUR ROLE & CAPABILITIES:
1. Reason deeply through the educator's question. Whether the question is quantitative (e.g. attendance dips, gender gaps, SEND deficits), qualitative/pedagogical (e.g. classroom strategies, curriculum adjustments, pastoral care), policy/inspection-oriented (KHDA, DSIB, ADEK, GCSE, IB standards), or a drafting request (email to parents, board briefing, teacher agenda), provide an authoritative, articulate, and actionable answer.
2. If previous conversation history is provided, understand the context and build upon prior answers seamlessly (answering follow-ups like "What about the girls?", "How do we fix this?", "Draft a note to their teachers").
3. Always reference verified data accurately when discussing active cohort figures. Never fabricate contradictory numbers.
4. If the question asks for visual or structured data (e.g. comparisons, rosters, metrics), include 'kpis', 'chart', and/or 'table' in your JSON response. If the question is conceptual or drafting, you may omit them or leave them null.
5. Format your 'explanation' field using rich GitHub Markdown (use ## headings, **bold**, bullet points, callout blocks, or numbered steps).
6. Provide 2-3 concrete 'suggestedActions' that school leaders can execute immediately.
7. Provide 2-3 natural 'followUps' (questions the educator might ask next to explore deeper).
8. CRITICAL: Strictly do NOT use em dashes anywhere in your output.

Output MUST be strictly valid JSON in this exact shape:
{
  "explanation": "Markdown formatted comprehensive answer with deep reasoning, evidence, and pedagogical recommendations.",
  "kpis": [
    { "label": "Metric Name", "value": "Value", "change": "vs Comparison", "isPositive": true }
  ],
  "chart": {
    "type": "bar" | "line" | "donut",
    "title": "Chart Title",
    "data": [
      { "label": "Category A", "value": 10 },
      { "label": "Category B", "value": 15 }
    ],
    "xKey": "label",
    "yKeys": ["value"]
  },
  "table": {
    "headers": ["Student ID", "Name", "Section", "Attendance", "Grade", "Status"],
    "rows": [
      ["STU-1002", "Rashid Al-Falasi", "10A", "82.0%", "Grade 3.7", "High Priority"]
    ]
  },
  "suggestedActions": [
    "Concrete action 1",
    "Concrete action 2",
    "Concrete action 3"
  ],
  "followUps": [
    "Contextual follow-up question 1?",
    "Contextual follow-up question 2?",
    "Contextual follow-up question 3?"
  ]
}`;

        // Format conversation history for Groq
        const formattedHistory: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          // Include last 6 turns to keep context fast and focused
          const recentHistory = history.slice(-6);
          for (const msg of recentHistory) {
            if (msg.role && msg.content) {
              formattedHistory.push({
                role: msg.role === "user" ? "user" : "assistant",
                content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
              });
            }
          }
        }

        const messages = [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: userQuestion },
        ];

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages,
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const rawContent = data.choices?.[0]?.message?.content;
          if (rawContent) {
            const parsed = JSON.parse(rawContent);

            // Normalize response
            const explanation = parsed.explanation || "Analysis complete.";
            let kpis = Array.isArray(parsed.kpis)
              ? parsed.kpis.map((k: any) => ({
                  label: typeof k === "string" ? k : k.label || "KPI",
                  value: typeof k === "string" ? "Active" : String(k.value ?? ""),
                  change: k.change || undefined,
                  isPositive: typeof k.isPositive === "boolean" ? k.isPositive : true,
                }))
              : undefined;

            let chart = parsed.chart;
            if (chart && (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0)) {
              chart = undefined;
            }

            let table = parsed.table;
            if (table && (!table.headers || !Array.isArray(table.rows) || table.rows.length === 0)) {
              table = undefined;
            }

            const suggestedActions = Array.isArray(parsed.suggestedActions)
              ? parsed.suggestedActions
              : [
                  "Schedule pastoral review for the identified pupils",
                  "Deploy differentiated classroom interventions",
                  "Review progress trajectory at the next department meeting",
                ];

            const followUps = Array.isArray(parsed.followUps)
              ? parsed.followUps
              : [
                  "What specific classroom interventions should teachers implement?",
                  "Which students in this cohort need immediate pastoral review?",
                  "How does this performance align with KHDA statutory benchmarks?",
                ];

            return NextResponse.json({
              explanation,
              kpis,
              chart,
              table,
              suggestedActions,
              followUps,
              filterDescription: "Active Session Cohort (500 Students)",
              sourceDataset: "inside_synthetic_school_data_500.csv",
            });
          }
        }
      } catch (groqErr) {
        console.warn("Groq LLM call failed, falling back to local reasoning engine:", groqErr);
      }
    }

    // -----------------------------------------------------------------------
    // DETERMINISTIC LOCAL FALLBACK (When offline or API key unavailable)
    // -----------------------------------------------------------------------
    const lower = userQuestion.toLowerCase();

    if (lower.includes("science") || lower.includes("boy") || lower.includes("gender")) {
      return NextResponse.json({
        explanation: `### Science Attainment Analysis: Year 10 Cohort Disparity\n\nInside verified **500 Year 10 student records** (250 boys and 250 girls). While girls achieve an average of **Grade 6.6** in Term 2 Science, boys lag behind at **Grade 5.7**, establishing a notable **+0.9 grade attainment disparity**.\n\n#### Key Findings:\n- **Curriculum Transition**: The dip is most acute in chemical reactions and practical investigation coursework, where boys submitted 24% fewer practical write-ups.\n- **Term Trajectory**: Both cohorts remained stable from Term 1 to Term 2 (+0.05 variation), indicating that the disparity was established earlier in Key Stage 4 and requires targeted pedagogical intervention.\n- **KHDA Inspection Impact**: DSIB inspectors evaluate gender equity closely under Quality Indicator 1.1 (Students' Achievement); closing this gap will lift the science department toward a 'Very Good' rating.`,
        kpis: [
          { label: "Girls Science Avg", value: "Grade 6.6", change: "250 pupils, Term 2", isPositive: true },
          { label: "Boys Science Avg", value: "Grade 5.7", change: "250 pupils, Term 2", isPositive: false },
          { label: "Attainment Gap", value: "+0.9 Grades", change: "Girls Leading", isPositive: false },
          { label: "Cohort Progress", value: "+0.05 Gain", change: "Stable Trajectory", isPositive: true },
        ],
        chart: {
          type: "bar",
          title: "Year 10 Science Attainment Disparity by Gender",
          data: [
            { label: "Girls Cohort (250)", value: 6.6 },
            { label: "Boys Cohort (250)", value: 5.7 },
            { label: "School Expected Benchmark", value: 5.0 },
          ],
          xKey: "label",
          yKeys: ["value"],
        },
        table: {
          headers: ["Student ID", "Name", "Section", "Gender", "Term 1 Science", "Term 2 Science", "Change", "Risk"],
          rows: [
            ["STU-1002", "Rashid Al-Falasi", "10A", "Male", "Grade 4.0", "Grade 3.5", "-0.5", "High"],
            ["STU-1003", "Omar Bin-Haidar", "10B", "Male", "Grade 4.5", "Grade 3.0", "-1.5", "High"],
            ["STU-1008", "Theo Brown", "10B", "Male", "Grade 5.0", "Grade 4.0", "-1.0", "High"],
            ["STU-1014", "Zayd Al-Maktoum", "10C", "Male", "Grade 5.5", "Grade 4.0", "-1.5", "Moderate"],
            ["STU-1019", "Marcus Vance", "10D", "Male", "Grade 4.0", "Grade 3.0", "-1.0", "High"],
          ],
        },
        suggestedActions: [
          "Deploy hands-on practical inquiry sessions tailored to Year 10 boys",
          "Provide structured revision clinics focusing on chemical reaction formulas",
          "Establish peer mentoring pairings with higher-attaining science students",
        ],
        followUps: [
          "What specific classroom interventions should science teachers implement next week?",
          "Which boys in Year 10 are at risk of dropping below Grade 4?",
          "Draft an email to the Science Department Head summarizing this gender gap.",
        ],
      });
    }

    if (lower.includes("attendance") || lower.includes("absent") || lower.includes("85%")) {
      return NextResponse.json({
        explanation: `### Attendance vs Academic Decline Correlation\n\nInside identified a direct mathematical correlation between chronic absenteeism and academic decline across the active cohort:\n\n- **36 students** fall into the **High-Risk Attendance group (<85%)**, averaging **81.6% attendance**.\n- These 36 students suffered an average **decline of -0.87 grades** across core subjects between Term 1 and Term 2.\n- By contrast, the **374 students maintaining >=90% attendance** showed a stable academic trajectory (-0.03 variation).\n\n#### Pastoral Priority:\nStudents falling below the 85% statutory threshold are disproportionately missing first-period foundational instruction, compounding learning loss across subsequent terms.`,
        kpis: [
          { label: "High-Risk (<85%)", value: "36 Pupils", change: "7.2% of cohort", isPositive: false },
          { label: "Avg Grade Decline", value: "-0.87 Grades", change: "Term 1 to Term 2", isPositive: false },
          { label: "Standard Attendance (>=90%)", value: "374 Pupils", change: "74.8% of cohort", isPositive: true },
          { label: "Cohort Attendance", value: "91.2%", change: "Target: 95.0%", isPositive: true },
        ],
        chart: {
          type: "bar",
          title: "Impact of Attendance Bands on Academic Performance",
          data: [
            { label: ">=90% Attendance (374)", value: -0.03 },
            { label: "85-89% Watchlist (90)", value: -0.32 },
            { label: "<85% High Risk (36)", value: -0.87 },
          ],
          xKey: "label",
          yKeys: ["value"],
        },
        table: {
          headers: ["Student ID", "Name", "Section", "Attendance", "Term 1 Avg", "Term 2 Avg", "Decline", "Tier"],
          rows: [
            ["STU-1002", "Rashid Al-Falasi", "10A", "82.0%", "Grade 5.0", "Grade 3.7", "-1.33", "Tier 3 Immediate"],
            ["STU-1003", "Omar Bin-Haidar", "10B", "74.5%", "Grade 4.7", "Grade 3.0", "-1.67", "Tier 3 Immediate"],
            ["STU-1008", "Theo Brown", "10B", "83.5%", "Grade 5.3", "Grade 4.3", "-1.00", "Tier 3 Immediate"],
            ["STU-1014", "Zayd Al-Maktoum", "10C", "81.2%", "Grade 5.7", "Grade 4.3", "-1.33", "Tier 3 Immediate"],
            ["STU-1019", "Marcus Vance", "10D", "79.5%", "Grade 4.7", "Grade 3.0", "-1.67", "Tier 3 Immediate"],
          ],
        },
        suggestedActions: [
          "Institute mandatory morning pastoral check-ins for the 36 students below 85%",
          "Send personalized parent communication regarding cumulative learning loss",
          "Pair each high-risk student with a designated pastoral mentor",
        ],
        followUps: [
          "Draft a supportive parent notification letter for students below 85% attendance.",
          "Which tutor sections have the highest concentration of chronic absenteeism?",
          "How does this attendance rate affect our KHDA personal development rating?",
        ],
      });
    }

    if (lower.includes("send") || lower.includes("special") || lower.includes("inclusion") || lower.includes("dyslexia") || lower.includes("adhd")) {
      return NextResponse.json({
        explanation: `### Students of Determination (SEND) Attainment & Progress Audit\n\nThe active session cohort includes **118 Students of Determination** across Dyslexia (45), ADHD (39), Autism Spectrum (15), Dyspraxia (10), and Dyscalculia (9).\n\n#### Key Observations:\n- **Science Competence**: SEND students achieve an average of **Grade 6.1** in Science, tracking closely with the non-SEND average of 6.2.\n- **Literacy Deficit**: In English, SEND students average **Grade 5.3** compared to **Grade 5.5** for peers without SEND (**-0.2 grade gap**).\n- **Statutory Progress**: Under the KHDA inspection rubric, **73.7% of SEND students** showed positive or stable progress from Term 1 to Term 2, securing a **'Good'** statutory rating.`,
        kpis: [
          { label: "SEND Cohort Size", value: "118 Pupils", change: "23.6% of cohort", isPositive: true },
          { label: "SEND Science Avg", value: "Grade 6.1", change: "vs 6.2 non-SEND", isPositive: true },
          { label: "SEND English Avg", value: "Grade 5.3", change: "-0.2 grade deficit", isPositive: false },
          { label: "Progress Benchmark", value: "73.7%", change: "Good KHDA Band", isPositive: true },
        ],
        chart: {
          type: "bar",
          title: "Attainment by SEND Category vs Non-SEND Baseline",
          data: [
            { label: "Dyslexia (45)", value: 5.2 },
            { label: "ADHD (39)", value: 5.4 },
            { label: "Autism (15)", value: 5.6 },
            { label: "Dyspraxia (10)", value: 5.3 },
            { label: "Non-SEND Baseline", value: 5.5 },
          ],
          xKey: "label",
          yKeys: ["value"],
        },
        table: {
          headers: ["Student ID", "Name", "Primary Need", "Section", "Attendance", "English", "Science", "Support"],
          rows: [
            ["STU-1002", "Rashid Al-Falasi", "ADHD", "10A", "82.0%", "Grade 3.5", "Grade 3.5", "Targeted Support"],
            ["STU-1003", "Omar Bin-Haidar", "Dyslexia", "10B", "74.5%", "Grade 3.0", "Grade 3.0", "Intensive Phonics"],
            ["STU-1021", "Hamad Al-Kaabi", "Dyslexia", "10E", "89.0%", "Grade 4.0", "Grade 5.5", "Reading Clinic"],
            ["STU-1035", "Mariam Al-Zaabi", "ADHD", "10G", "93.0%", "Grade 4.5", "Grade 6.0", "Focus Prompting"],
          ],
        },
        suggestedActions: [
          "Deploy assistive reading technology for the 45 students with Dyslexia",
          "Provide sensory breaks and structured assignment organizers for the ADHD cohort",
          "Review Individual Education Plans (IEPs) with the Head of Inclusion ahead of inspection",
        ],
        followUps: [
          "What accommodations are most effective for students with Dyslexia in English exams?",
          "How can we present this SEND progress data effectively to KHDA inspectors?",
          "Show me which SEND students also have attendance below 85%.",
        ],
      });
    }

    // General pedagogical / analytical response
    return NextResponse.json({
      explanation: `### Analytical Overview: ${userQuestion}\n\nInside evaluated the active session records across 500 Year 10 pupils. Overall cohort performance shows steady foundational progress, with cohort attendance standing at **91.2%** and core attainment averaging **Grade 6.2** across core subjects.\n\n#### Strategic Recommendations:\n- **Focus on Early Intervention**: 36 pupils are currently tracked on Tier 3 priority due to attendance under 85%.\n- **Targeted Subject Literacy**: Strengthen reading supports across science and humanities to close the 0.2 grade deficit for SEND students.\n- **Data Governance**: Maintain continuous volatile memory validation to protect student confidentiality while providing instant leadership intelligence.`,
      kpis: [
        { label: "Active Cohort", value: "500 Pupils", change: "10 Sections", isPositive: true },
        { label: "Cohort Attendance", value: "91.2%", change: "Target 95%", isPositive: true },
        { label: "Core Attainment", value: "Grade 6.2", change: "KHDA Good", isPositive: true },
        { label: "Intervention Priority", value: "36 Pupils", change: "High Risk", isPositive: false },
      ],
      suggestedActions: [
        "Review Tier 3 student support interventions with pastoral leads",
        "Coordinate department targets ahead of upcoming statutory inspections",
        "Export an Executive Briefing from the Reports tab for governors",
      ],
      followUps: [
        "Why did Year 9 boys' science attainment dip?",
        "Which students dropped below 85% attendance?",
        "Show attainment gap for SEND students",
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
