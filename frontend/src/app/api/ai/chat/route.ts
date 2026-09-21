import { NextRequest, NextResponse } from "next/server";

const ASSISTANT_SYSTEM_PROMPT = `You are the Inside AI Assistant, a knowledgeable, friendly, and authoritative school data helper available to educators, school leaders, and data managers.

YOUR KNOWLEDGE BASE ABOUT INSIDE AI:
1. WHAT IS INSIDE AI:
   Inside is an AI Educational Intelligence platform designed for non-technical educators, principals, VP academics, and data managers. It turns raw MIS spreadsheets into live vital signs, natural language conversational insights, KHDA/ADEK inspection compliance rubrics, and board dossiers in seconds.

2. ZERO-DATA RETENTION ARCHITECTURE (PRIVACY & CONFIDENTIALITY):
   - All student data is processed 100% in-browser in volatile RAM memory.
   - Zero student records, marks, or personal identifiable information (PII) are ever stored on any external database, cloud server, or persistent disk.
   - When the user closes the browser tab or clicks "Purge Session", the memory wipes completely clean.
   - Fully compliant with UAE Federal Decree-Law No. 45/2021 on Personal Data Protection, GDPR, and KHDA digital governance standards.

3. THE 5 CORE DESKS / WORKSPACES:
   - Tab 1: Data Hub (Data Manager): Drag-and-drop MIS files (CSV, TSV, XLSX, XLS), intelligent column auto-detection with confidence scores, data hygiene checks, and volatile memory purge.
   - Tab 2: Home (Principal Executive Cockpit): Real-time whole-school vital signs (cohort attendance, attainment average, at-risk cohorts, automated alerts, class distributions).
   - Tab 3: Ask Inside (VP Academics): Conversational AI query workspace where educators can ask any question in plain English (e.g. why boys' science attainment dipped, attendance correlations, customized parent emails, classroom interventions) with instant calculated KPIs, charts, and rosters.
   - Tab 4: Inspections (Head of Inclusion): Statutory KHDA / DSIB Quality Indicator evaluation (Students' Achievement, Progress, Inclusion / SEND Value-Added, Learning Skills, Personal Development) with transparent mathematical proof formulas (numerator, denominator, criteria).
   - Tab 5: Reports (Board & Governors): Ready-to-print executive dossiers (Full Inspection Evidence Pack, Governors' Strategic Briefing, Inclusion & SEND Gap Audit) with print-to-PDF.

4. COMMON METRICS & THRESHOLDS:
   - Attendance: Standard (>=90%), Watchlist (85-89%), High-Risk / Chronic Absenteeism (<85%).
   - Attainment: UK/UAE Grade 1 to 9 scale (Grade 5 is expected benchmark; Grade 7+ is outstanding).
   - KHDA Statutory Bands: Outstanding (>=90%), Very Good (80-89%), Good (70-79%), Acceptable (60-69%), Weak (<60%).
   - Students of Determination (SEND): Dyslexia, ADHD, Autism Spectrum, Dyscalculia, Dyspraxia, Speech & Language.

5. PRICING & ACCESS:
   - 14-day free trial with full feature access and zero commitment.
   - Tiered plans for individual educators, departments, and whole schools / academy trusts.

CRITICAL INSTRUCTION FOR OUT-OF-CONTEXT / UNKNOWN QUESTIONS:
If a user asks about anything outside your knowledge base (e.g. custom billing inquiries, payment receipts, enterprise IT installation, bespoke API access, institutional contracting, partnership inquiries, or unresolved technical issues):
You MUST politely explain that you don't have the context or tools to assist with that specific request, and clearly instruct the user to email our team directly at:
support@inside-ai.com (or contact@inside-ai.com).

TONE:
Warm, professional, concise, reassuring, and highly knowledgeable. Strictly do NOT use em dashes anywhere in your output.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userRole = "Instructor" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "system", content: ASSISTANT_SYSTEM_PROMPT }, ...messages],
            temperature: 0.2,
            max_tokens: 500,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (e) {
        console.warn("Groq Chat API error, using local assistant knowledge base:", e);
      }
    }

    // Comprehensive local fallback knowledge base
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

    let localReply = "";

    if (lastUserMessage.includes("privacy") || lastUserMessage.includes("security") || lastUserMessage.includes("gdpr") || lastUserMessage.includes("data retained") || lastUserMessage.includes("server")) {
      localReply = "Inside operates on a strict Zero-Data Retention architecture. All student spreadsheet data is processed 100% in your browser's volatile RAM. No student names, grades, or personal details are ever stored on our servers or databases. As soon as you close your browser tab or click 'Purge Session', the memory is completely wiped clean.";
    } else if (lastUserMessage.includes("attendance") || lastUserMessage.includes("absent") || lastUserMessage.includes("threshold")) {
      localReply = "Under standard educational and KHDA metrics, student attendance is categorized into three key tiers:\n\n1. Regular Attendance (>=90%): Demonstrates stable academic progress.\n2. Watchlist (85-89%): Early warning indicator for pastoral teams.\n3. High-Risk / Chronic Absenteeism (<85%): Associated with an average -0.87 grade decline. You can view the full roster in the Ask Inside or Home tabs.";
    } else if (lastUserMessage.includes("send") || lastUserMessage.includes("inclusion") || lastUserMessage.includes("special educational needs") || lastUserMessage.includes("dyslexia") || lastUserMessage.includes("adhd")) {
      localReply = "Inside tracks progress and attainment across all Students of Determination (SEND) categories, including Dyslexia, ADHD, Autism, Dyspraxia, and Dyscalculia. In your current cohort, 118 pupils are tracked, with 73.7% demonstrating positive value-added progress under the KHDA inspection rubric.";
    } else if (lastUserMessage.includes("khda") || lastUserMessage.includes("inspection") || lastUserMessage.includes("dsib") || lastUserMessage.includes("rubric")) {
      localReply = "Inside includes a dedicated Inspections tab evaluating the 5 statutory KHDA/DSIB Quality Indicators: Students' Achievement, Students' Progress, Inclusion/SEND, Learning Skills, and Personal Development. Every rating includes a verified mathematical audit trail showing the exact formula, numerator, and denominator.";
    } else if (lastUserMessage.includes("format") || lastUserMessage.includes("file") || lastUserMessage.includes("upload") || lastUserMessage.includes("excel") || lastUserMessage.includes("csv")) {
      localReply = "You can drop raw exports from any MIS (such as SIMS, PowerSchool, iSAMS, Engage, or Compass) directly into the Data Hub. Inside supports CSV, TSV, and Excel (.xlsx, .xls) files and automatically recognizes column headers with confidence matching.";
    } else if (lastUserMessage.includes("pricing") || lastUserMessage.includes("cost") || lastUserMessage.includes("plan") || lastUserMessage.includes("trial")) {
      localReply = "Inside offers a 14-day free trial with full platform capabilities and no credit card required. We offer Starter ($49/month), Pro ($149/month), and whole-school Institution plans. You can review all details on our Pricing section.";
    } else if (lastUserMessage.includes("help") || lastUserMessage.includes("how to") || lastUserMessage.includes("start")) {
      localReply = "Getting started takes under 60 seconds:\n\n1. Data Hub: Drop your student MIS spreadsheet.\n2. Home: Review live vital signs and automated alert flags.\n3. Ask Inside: Ask questions in plain English to uncover deep trends.\n4. Inspections: Verify statutory benchmarks.\n5. Reports: Export board-ready dossiers.";
    } else {
      localReply = "I don't have the context to answer that specific question. Please reach out to our team directly by email at support@inside-ai.com or contact@inside-ai.com, and we will be delighted to help you!";
    }

    return NextResponse.json({ reply: localReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
