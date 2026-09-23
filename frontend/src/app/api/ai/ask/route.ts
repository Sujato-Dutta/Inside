import { NextRequest } from "next/server";
import { AskPlan } from "@/lib/engine/ask-plan";
import { containsPotentialPupilData, containsPotentialSchoolFigures, groqCompletion, groqErrorResponse } from "@/lib/server/groq";

export const runtime = "nodejs";

const schema = {
  type: "object",
  properties: {
    analysis: { type: "string", enum: ["core_attainment", "phase_attainment", "send_progress", "send_subject", "send_attendance", "gender_gap", "attendance_attainment", "emirati_attainment", "borderline_math", "data_quality", "cohort_metric", "record_list", "advice", "unsupported"] },
    subject: { type: ["string", "null"], enum: ["English", "Mathematics", "Science", "All", null] },
    year: { type: ["integer", "null"], minimum: 0, maximum: 13 },
    stage: { type: ["string", "null"], enum: ["KS3", "KS4", null] },
    gender: { type: ["string", "null"], enum: ["Male", "Female", null] },
    send: { type: ["boolean", "null"] },
    emirati: { type: ["boolean", "null"] },
    metric: { type: ["string", "null"], enum: ["count", "mean_grade", "attainment_rate", null] },
    recordSort: { type: ["string", "null"], enum: ["core_grade", "subject_grade", "attendance", null] },
    recordOrder: { type: ["string", "null"], enum: ["lowest", "highest", "none", null] },
    recordLimit: { type: ["integer", "null"], minimum: 1, maximum: 50 },
    focus: { type: ["string", "null"], enum: ["attainment", "attendance", "progress", "general", null] },
    presentation: { type: "string" },
    reasoning: { type: "string" },
    advice: { type: "array", items: { type: "string" } },
    attendanceThreshold: { type: ["integer", "null"], minimum: 1, maximum: 100 },
    clarification: { type: ["string", "null"] },
  },
  required: ["analysis", "subject", "year", "stage", "gender", "send", "emirati", "metric", "recordSort", "recordOrder", "recordLimit", "focus", "presentation", "reasoning", "advice", "attendanceThreshold", "clarification"],
  additionalProperties: false,
};

const system = `You route a school leader's question to one verified local calculation. Return only the JSON schema.
You NEVER calculate, answer, invent data, or infer unseen records. No pupil data is provided to you.
Available analyses:
core_attainment: English, Mathematics, Science or all three, whole school only.
phase_attainment: all four school phases compared by current attainment, no forecast.
send_progress: observed Term 1 to Term 2 progress, SEND versus peers.
send_subject: subject attainment for SEND versus peers; requires one subject.
send_attendance: SEND pupils below 90% attendance versus all SEND.
gender_gap: one subject by boys/girls, optional Year or KS3/KS4.
attendance_attainment: at/above expected rates below versus above an attendance threshold; default 90.
emirati_attainment: Emirati versus other pupils.
borderline_math: current secondary Mathematics boundary window.
data_quality: committed row count, duplicate references, mapped source files.
cohort_metric: one filtered cohort, returning its pupil count, mean subject/core grade, or at/above-expected rate. May filter Year, KS3/KS4, one gender, SEND status, Emirati status, and attendance below a threshold. Use this for questions like "Year 9 girls Science attainment", "average Maths grade in Year 9", or "how many pupils are below 87% attendance". Use gender_gap only if BOTH genders are explicitly compared.
record_list: return actual matching pupil records locally. Use for "Which boys have the lowest marks?", "Show the ten girls with the highest Science grades", "Which Year 9 pupils have the lowest attendance?", or "List SEND pupils below an attendance threshold". Select cohort filters, recordSort (core_grade when no subject is named, subject_grade when a subject is named, attendance for attendance ranking), recordOrder (lowest/highest/none), and recordLimit when stated. Do not name or invent pupils; the browser will retrieve, sort, and show the real records. Never use cohort_metric for a request asking WHICH pupils or to LIST records.
advice: open-ended school improvement questions such as "What to do to increase boys marks?", "How can we improve SEND progress?", "Why are girls doing worse in Mathematics?", or "What should we investigate about persistent absence?". Select the relevant cohort filters and subject if stated. Set focus to attainment, attendance, or progress. Do not require a measurable metric. Return 2-3 practical action ideas in advice, each a short sentence. These are general suggestions based ONLY on the question, since no pupil data is visible to you. First verify any premise instead of assuming a gap or problem exists. Never attribute performance to gender traits, interests, or learning styles. Do not claim a problem, cause, size, statistic, or trend is present in the school. Never add numbers to advice. The browser will calculate the evidence and present it separately.
For EVERY analysis, presentation is one brief natural opening sentence framed as a question or plan, such as "Let's check the current evidence before choosing an intervention." reasoning is one brief plain-language methodology sentence explaining which comparison or measure would answer the question. Neither may claim any observed result, cause, trend, or school fact; you have no data. Never include numbers in presentation or reasoning. This is an answer outline, not hidden chain-of-thought. For non-advice analyses, advice must be an empty array. If the question asks for a different calculation, forecast, or an unclear follow-up, choose unsupported and give a short precise clarification. Do not silently switch to a different metric. Use previousQuestions only to resolve genuine follow-ups, inheriting the last relevant analysis, filters, subject, ranking and measure unless the user changes them. For example, after a lowest-marks list for boys, "What about girls?" requests the same ranking for girls, and "And Science?" keeps the cohort and ranks Science instead. Previous questions are safe query plans, not data or results. All numeric results are computed locally later.`;

const analyses = new Set(["core_attainment", "phase_attainment", "send_progress", "send_subject", "send_attendance", "gender_gap", "attendance_attainment", "emirati_attainment", "borderline_math", "data_quality", "cohort_metric", "record_list", "advice", "unsupported"]);
const subjects = new Set(["English", "Mathematics", "Science", "All", null]);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, 500) : "";
  const previousQuestions = Array.isArray(body?.previousQuestions)
    ? body.previousQuestions.filter((item: unknown): item is string => typeof item === "string").slice(-4).map((item: string) => item.trim().slice(0, 500))
    : typeof body?.previousQuestion === "string" ? [body.previousQuestion.trim().slice(0, 500)] : [];
  const previousQuestion = previousQuestions.at(-1) || "";
  if (!query) return Response.json({ error: "Enter a question." }, { status: 400 });
  // Individual identifiers must be resolved in browser memory, never passed to Groq.
  if (containsPotentialPupilData(query) || previousQuestions.some(containsPotentialPupilData)) {
    return Response.json({ error: "Individual pupil questions are handled locally. Use a pupil reference in Ask Inside." }, { status: 400 });
  }
  if (containsPotentialSchoolFigures(query) || previousQuestions.some(containsPotentialSchoolFigures)) {
    return Response.json({ error: "Please ask without pasting school figures or rows. Inside will calculate the answer from your active files locally." }, { status: 400 });
  }
  try {
    const raw = await groqCompletion([
      { role: "system", content: system },
      { role: "user", content: JSON.stringify({ question: query, previousQuestions }) },
    ], { jsonSchema: schema, maxTokens: 650 });
    const parsed = JSON.parse(raw) as AskPlan;
    if (!analyses.has(parsed.analysis) || !subjects.has(parsed.subject) || !["Male", "Female", null].includes(parsed.gender) || !["KS3", "KS4", null].includes(parsed.stage) || !["count", "mean_grade", "attainment_rate", null].includes(parsed.metric) || !["core_grade", "subject_grade", "attendance", null].includes(parsed.recordSort) || !["lowest", "highest", "none", null].includes(parsed.recordOrder) || !(parsed.recordLimit === null || Number.isInteger(parsed.recordLimit) && parsed.recordLimit >= 1 && parsed.recordLimit <= 50) || !["attainment", "attendance", "progress", "general", null].includes(parsed.focus) || !Array.isArray(parsed.advice) || typeof parsed.presentation !== "string" || typeof parsed.reasoning !== "string") throw new Error("Invalid analysis plan");
    const safeOutline = (value: string) => {
      const normalized = value.replace(/\bYear\s+\d{1,2}\b/gi, "the selected year").replace(/\bKS\s*\d\b/gi, "the selected key stage").replace(/\bTerm\s+1\b/gi, "the prior term").replace(/\bTerm\s+2\b/gi, "the current term");
      return normalized.length <= 220 && !/\d|\b(?:data|evidence|results?)\s+(?:shows?|proves?|indicates?|confirms?)\b/i.test(normalized) ? normalized : "";
    };
    parsed.presentation = safeOutline(parsed.presentation);
    parsed.reasoning = safeOutline(parsed.reasoning);
    parsed.advice = parsed.advice.filter((item): item is string => typeof item === "string" && item.length <= 240 && !/\d|learning styles|gender traits|boys'? interests|girls'? interests|male learners|female learners|resonate with|underperforming|falling behind/i.test(item)).slice(0, 3);
    if (/\b(?:which|who|list|show|identify)\b/i.test(query) && /\b(?:pupils?|students?|boys?|girls?|children|learners)\b/i.test(query) && /\b(?:lowest|bottom|weakest|highest|top|marks?|grades?|scores?|attendance|below|above)\b/i.test(query) && !/\b(?:versus|compare|comparison|gap)\b/i.test(query)) {
      parsed.analysis = "record_list";
    }
    if (/\b(?:what (?:should|can|to)|how (?:can|do|should|to)|why (?:are|is|do|does)|ways to|recommend|improve|increase|boost|raise|reduce|support|intervene|address|investigate)\b/i.test(query) && parsed.advice.length) parsed.analysis = "advice";
    if (parsed.analysis === "advice") {
      if (parsed.gender === null && /\bboys?\b/i.test(query)) parsed.gender = "Male";
      if (parsed.gender === null && /\bgirls?\b/i.test(query)) parsed.gender = "Female";
      if (parsed.subject === null || parsed.subject === "All") {
        if (/\bmath(?:ematics|s)?\b/i.test(query)) parsed.subject = "Mathematics";
        else if (/\bscience\b/i.test(query)) parsed.subject = "Science";
        else if (/\benglish\b/i.test(query)) parsed.subject = "English";
      }
      parsed.focus = /\b(?:attendance|absence|absent)\b/i.test(query) ? "attendance" : /\b(?:progress|improvement between terms)\b/i.test(query) ? "progress" : "attainment";
    }
    if (parsed.analysis === "record_list") {
      const priorList = /^(?:lowest|highest|none)\s+(?:core_grade|subject_grade|attendance)\s+records for\b/i.test(previousQuestion) ? previousQuestion : "";
      const requestedYear = query.match(/\b(?:year|y)\s*(\d{1,2})\b/i);
      if (requestedYear) parsed.year = Number(requestedYear[1]);
      else if (priorList) parsed.year = Number(priorList.match(/\bYear\s+(\d{1,2})\b/i)?.[1]) || null;
      if (/\bKS\s*3\b/i.test(query)) parsed.stage = "KS3";
      else if (/\bKS\s*4\b/i.test(query)) parsed.stage = "KS4";
      else if (priorList) parsed.stage = /\bKS3\b/i.test(priorList) ? "KS3" : /\bKS4\b/i.test(priorList) ? "KS4" : null;
      if (/\bboys?\b/i.test(query)) parsed.gender = "Male";
      else if (/\bgirls?\b/i.test(query)) parsed.gender = "Female";
      else if (priorList) parsed.gender = /\bFemale\b/i.test(priorList) ? "Female" : /\bMale\b/i.test(priorList) ? "Male" : null;
      if (/\bmath(?:ematics|s)?\b/i.test(query)) parsed.subject = "Mathematics";
      else if (/\bscience\b/i.test(query)) parsed.subject = "Science";
      else if (/\benglish\b/i.test(query)) parsed.subject = "English";
      else if (priorList) parsed.subject = /\bMathematics\b/i.test(priorList) ? "Mathematics" : /\bScience\b/i.test(priorList) ? "Science" : /\bEnglish\b/i.test(priorList) ? "English" : null;
      else parsed.subject = null;
      if (/\bSEND\b|students? of determination|inclusion/i.test(query)) parsed.send = true;
      else if (priorList) parsed.send = /\bnon-SEND\b/i.test(priorList) ? false : /\bSEND\b/i.test(priorList) ? true : null;
      if (/\bemirati\b|\bnational pupils?\b/i.test(query)) parsed.emirati = true;
      else if (priorList) parsed.emirati = /\bnon-Emirati\b/i.test(priorList) ? false : /\bEmirati\b/i.test(priorList) ? true : null;
      const attendanceBelow = query.match(/\b(?:attendance|absence)\s*(?:below|under)\s*(\d{1,3})\s*%|\b(?:below|under)\s*(\d{1,3})\s*%\s*(?:attendance|absence)/i);
      if (attendanceBelow) parsed.attendanceThreshold = Number(attendanceBelow[1] || attendanceBelow[2]);
      else if (priorList) parsed.attendanceThreshold = Number(priorList.match(/\battendance below (\d{1,3})%/i)?.[1]) || null;
      if (/\b(?:attendance|absence|absent)\b/i.test(query)) parsed.recordSort = "attendance";
      else if (/\b(?:math(?:ematics|s)?|science|english)\b/i.test(query)) parsed.recordSort = "subject_grade";
      else if (priorList) parsed.recordSort = priorList.match(/^(?:lowest|highest|none)\s+(core_grade|subject_grade|attendance)/i)?.[1] as AskPlan["recordSort"] || "core_grade";
      else parsed.recordSort = "core_grade";
      parsed.recordOrder = /\b(?:highest|top|best|strongest)\b/i.test(query) ? "highest" : /\b(?:lowest|bottom|weakest|poorest)\b/i.test(query) ? "lowest" : priorList ? priorList.match(/^(lowest|highest|none)/i)?.[1] as AskPlan["recordOrder"] || "none" : "none";
      const requestedLimit = query.match(/\b(?:bottom|top|lowest|highest|first|last)\s+(\d{1,2})\b/i);
      parsed.recordLimit = requestedLimit ? Math.min(50, Math.max(1, Number(requestedLimit[1]))) : priorList ? Number(priorList.match(/\bfirst\s+(\d{1,2})\b/i)?.[1]) || null : null;
      parsed.advice = [];
      parsed.clarification = null;
      if (!parsed.presentation || /clarify|specify|cannot|unclear/i.test(parsed.presentation)) parsed.presentation = "I'll check the current records and rank the matching pupils locally.";
    }
    if (/\b(forecast|predict|project(?:ed|ion)?)\b/i.test(query)) {
      parsed.analysis = "unsupported";
      parsed.clarification = "I can verify current and prior-cycle evidence, but cannot forecast future marks.";
    }
    const asksSingleGender = /\b(?:boys?|girls?|male|female)\b/i.test(query) && !/\b(?:both|versus|vs\.?|compare|comparison|gap|difference|between|by gender)\b/i.test(query);
    if (parsed.analysis === "gender_gap" && asksSingleGender) {
      parsed.analysis = "cohort_metric";
      parsed.gender = /\b(?:girls?|female)\b/i.test(query) ? "Female" : "Male";
      parsed.metric = /\b(?:average|mean)\b/i.test(query) ? "mean_grade" : "attainment_rate";
    }
    if (parsed.analysis === "core_attainment" && (parsed.year !== null || parsed.stage !== null || parsed.gender !== null || /\b(?:average|mean)\b/i.test(query))) {
      parsed.analysis = "cohort_metric";
      parsed.metric = /\b(?:average|mean)\b/i.test(query) ? "mean_grade" : "attainment_rate";
    }
    if (parsed.analysis === "attendance_attainment" && /\b(?:how many|count|number of)\b/i.test(query)) {
      parsed.analysis = "cohort_metric";
      parsed.metric = "count";
      parsed.attendanceThreshold ??= 90;
    }
    if (parsed.analysis === "send_attendance" && /\b(?:how many|count|number of)\b/i.test(query)) {
      parsed.analysis = "cohort_metric";
      parsed.metric = "count";
      parsed.send = true;
      parsed.attendanceThreshold = 90;
    }
    if (parsed.analysis === "cohort_metric" && /\b(?:versus|vs\.?|compare|comparison|gap|difference|between)\b/i.test(query)) {
      parsed.analysis = "unsupported";
      parsed.clarification = "I cannot verify that comparison as phrased. Please name the two groups and the measure to compare.";
    }
    if (parsed.analysis === "cohort_metric" && !parsed.metric) parsed.metric = /\b(?:how many|count|number of)\b/i.test(query) ? "count" : /\b(?:average|mean)\b/i.test(query) ? "mean_grade" : "attainment_rate";
    if (parsed.analysis === "send_subject" && (!parsed.subject || parsed.subject === "All")) {
      parsed.analysis = "unsupported";
      parsed.clarification = "Which subject should I compare for SEND pupils: English, Mathematics, or Science?";
    }
    if (parsed.analysis === "gender_gap" && (!parsed.subject || parsed.subject === "All")) {
      parsed.analysis = "unsupported";
      parsed.clarification = "Which subject should I compare by gender: English, Mathematics, or Science?";
    }
    return Response.json({ plan: parsed });
  } catch (error) {
    return groqErrorResponse(error);
  }
}
