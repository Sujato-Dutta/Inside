import { StudentRecord, UploadedFileMeta } from "@/types/student-data";
import { DeterministicResult } from "./types";

const avg = (v: number[]) => v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
const pct = (a: number, b: number) => b ? Math.round((a / b) * 1000) / 10 : 0;
const round = (v: number) => Math.round(v * 10) / 10;
const subjectScore = (s: StudentRecord, subject: "math" | "science" | "english") =>
  subject === "math" ? s.term2MathGrade ?? s.mathGrade :
  subject === "science" ? s.term2ScienceGrade ?? s.scienceGrade :
  s.term2EnglishGrade ?? s.englishGrade;
const termOne = (s: StudentRecord) => avg([s.term1MathGrade ?? s.mathGrade, s.term1ScienceGrade ?? s.scienceGrade, s.term1EnglishGrade ?? s.englishGrade]);
const termTwo = (s: StudentRecord) => avg([s.term2MathGrade ?? s.mathGrade, s.term2ScienceGrade ?? s.scienceGrade, s.term2EnglishGrade ?? s.englishGrade]);
const table = (rows: StudentRecord[], limit = 15) => ({
  headers: ["Anonymous Ref", "Year", "Section", "Attendance", "Math", "Science", "English", "SEND"],
  rows: rows.slice(0, limit).map((s) => [s.id, `Y${s.yearGroup}`, s.classGroup, `${s.attendanceRate}%`, round(subjectScore(s, "math")), round(subjectScore(s, "science")), round(subjectScore(s, "english")), s.inclusionSend || (s.senStatus ? "SEND" : "None")]),
});

type Step = NonNullable<DeterministicResult["verification"]>["steps"][number];
const share = (label: string, count: number, total: number): Step => ({ label, formula: "matching records ÷ cohort records × 100", inputs: `${count} ÷ ${total}`, result: total ? `${pct(count, total)}%` : "No records" });
const mean = (label: string, values: number[]): Step => ({ label, formula: "sum of observed grades ÷ pupil count", inputs: `${round(values.reduce((sum, value) => sum + value, 0))} ÷ ${values.length}`, result: values.length ? String(round(avg(values))) : "No records" });
const numberStep = (label: string, count: number, rule: string): Step => ({ label, formula: rule, inputs: `${count} matching records`, result: String(count) });

function makeResult(students: StudentRecord[], dataset: string, title: string, data: Record<string, string | number>[], findings: string[], subset: StudentRecord[], interpretation: string, cohortRule: string, steps: Step[], xKey = "label", yKeys = ["Attainment"]): DeterministicResult {
  const attained = subset.filter((s) => termTwo(s) >= 5).length;
  const proofSteps = [share("Selected cohort at or above expected", attained, subset.length), ...steps];
  return {
    intent: { intentType: "attainment", filters: [], targetMetric: "statutory_attainment" },
    kpis: [
      { label: "Verified records", value: String(subset.length), change: "Local RAM only", isPositive: true },
      { label: "At / above expected", value: `${pct(attained, subset.length)}%`, change: "Grade 5+ equivalent", isPositive: pct(attained, subset.length) >= 75 },
      { label: "DSIB reference", value: "75%", change: "Good benchmark", isPositive: true },
    ],
    table: table(subset),
    chart: data.length ? { type: "bar", title, xKey, yKeys, data } : null,
    highlightedStudents: [],
    filterDescription: `${subset.length} matching anonymized records from active memory`,
    sourceDataset: dataset,
    explanation: findings.join("\n"),
    suggestedActions: findings.slice(0, 3),
    verification: { interpretation, cohortRule, totalRecords: students.length, matchedRecords: subset.length, steps: proofSteps, evidence: table(subset, Number.POSITIVE_INFINITY) },
  };
}

export function analyzeStatutoryQuery(students: StudentRecord[], query: string, files: UploadedFileMeta[] = [], readiness = 100): DeterministicResult {
  const lower = query.toLowerCase();
  const dataset = files.map((f) => f.name).join(" + ") || "Active volatile cohort";
  const lookupRequested = /\b(?:roll(?: number| no)?|student id|pupil id|reference|ref)\b|\bstu-[a-z0-9]+\b/i.test(query);
  const containsReference = (reference: string) => {
    const escaped = reference.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i").test(query);
  };
  const lookup = lookupRequested ? students.find((s) => (s.sourceRef && containsReference(s.sourceRef)) || containsReference(s.id)) : undefined;
  if (lookup) {
    return makeResult(students, dataset, "Verified attainment for requested pupil reference",
      ["Math", "Science", "English"].map((label) => ({ label, Attainment: round(subjectScore(lookup, label.toLowerCase() as "math" | "science" | "english")) })),
      [`Reference ${lookup.id} was matched locally across joined source files.`, `Attendance is ${lookup.attendanceRate}% and the current core average is Grade ${round(termTwo(lookup))}.`, "The source roll number remains in volatile memory and is not shown or transmitted."], [lookup],
      "A pupil reference in the question matched one joined record in local memory.", "Exact source or anonymous pupil reference match",
      [mean("Current core grade average", [subjectScore(lookup, "math"), subjectScore(lookup, "science"), subjectScore(lookup, "english")]), ...(["math", "science", "english"] as const).map((subject) => ({ label: `${subject} current grade`, formula: "Current term grade, otherwise normalized subject grade", inputs: lookup.id, result: String(round(subjectScore(lookup, subject))) }))]);
  }
  if (/duplicate|grading scale|unmapped|map correctly|data quality/.test(lower)) {
    const duplicates = students.length - new Set(students.map((s) => s.sourceRef || s.id)).size;
    return makeResult(students, dataset, "Ingestion mapping verification", files.map((f) => ({ label: f.name, Records: f.rowCount })),
      [`${students.length} committed records are available with a ${readiness}% readiness score.`, `${duplicates} duplicate pupil references remain after the quality gateway.`, `${files.length} source files were joined in memory with no server upload.`], students,
      "The question requests an ingestion and mapping check.", "All committed records in the active local dataset",
      [numberStep("Committed records", students.length, "count committed pupil records"), numberStep("Duplicate references", duplicates, "record count minus unique pupil reference count"), ...files.map((file) => numberStep(`${file.name} source rows`, file.rowCount, "source file row count")), { label: "Data readiness", formula: "score established by the Data Hub quality gateway", inputs: `${files.length} active source files`, result: `${readiness}%` }], "label", ["Records"]);
  }
  if (/phase|eyfs|primary|secondary|post-16|\bks[1-4]\b|key.stage/.test(lower) && !/borderline|gender|boys|girls/.test(lower)) {
    const phases = [
      ["FS / EYFS", (s: StudentRecord) => s.yearGroup <= 0],
      ["Primary", (s: StudentRecord) => s.yearGroup >= 1 && s.yearGroup <= 6],
      ["Secondary", (s: StudentRecord) => s.yearGroup >= 7 && s.yearGroup <= 11],
      ["Post-16", (s: StudentRecord) => s.yearGroup >= 12],
    ] as const;
    const data = phases.map(([label, test]) => {
      const group = students.filter(test);
      return { label, Attainment: pct(group.filter((s) => termTwo(s) >= 5).length, group.length), "Below Expected": pct(group.filter((s) => termTwo(s) < 5).length, group.length) };
    });
    const strongest = [...data].sort((a, b) => Number(b.Attainment) - Number(a.Attainment))[0];
    const populated = data.filter((item) => phases.some(([label, test]) => label === item.label && students.some(test)));
    return makeResult(students, dataset, "Phase attainment against DSIB benchmark", data,
      [populated.length ? `${strongest.label} is the strongest evidenced phase at ${strongest.Attainment}% at/above expected.` : "No phase has evidence in this session.", "These are current-cycle distributions; they do not predict future marks.", "A phase with no records has no evidenced rating."], students,
      "The question requests current attainment grouped by school phase.", "All records grouped into FS / EYFS, Primary, Secondary, and Post-16",
      phases.flatMap(([label, test]) => { const group = students.filter(test); const attained = group.filter((s) => termTwo(s) >= 5).length; return [share(`${label} at or above expected`, attained, group.length), share(`${label} below expected`, group.length - attained, group.length)]; }), "label", ["Attainment", "Below Expected"]);
  }
  if (/send|determination|inclusion|wave 2|wave 3/.test(lower)) {
    const send = students.filter((s) => s.senStatus || (s.inclusionSend && s.inclusionSend !== "None"));
    const nonSend = students.filter((s) => !send.includes(s));
    if (/english|literacy/.test(lower)) {
      const sendMean = round(avg(send.map((s) => subjectScore(s, "english"))));
      const peerMean = round(avg(nonSend.map((s) => subjectScore(s, "english"))));
      return makeResult(students, dataset, "English attainment by inclusion status", [{ label: "SEND", Average: sendMean }, { label: "Non-SEND", Average: peerMean }],
        [`SEND pupils average Grade ${sendMean} in current English evidence.`, `Non-SEND pupils average Grade ${peerMean}; the observed difference is ${round(peerMean - sendMean)} grades.`, "The comparison is based on the current loaded cohort."], [...send, ...nonSend],
        "The question requests observed English grades by inclusion status.", "All SEND pupils compared with all non-SEND pupils",
        [mean("SEND English mean", send.map((s) => subjectScore(s, "english"))), mean("Non-SEND English mean", nonSend.map((s) => subjectScore(s, "english"))), { label: "Peer difference", formula: "non-SEND mean − SEND mean", inputs: `${peerMean} − ${sendMean}`, result: `${round(peerMean - sendMean)} grades` }], "label", ["Average"]);
    }
    if (/absence|attendance/.test(lower)) {
      const risk = send.filter((s) => s.attendanceRate < 90);
      const data = [{ label: "SEND <90%", Attainment: pct(risk.filter((s) => termTwo(s) >= 5).length, risk.length) }, { label: "All SEND", Attainment: pct(send.filter((s) => termTwo(s) >= 5).length, send.length) }];
      return makeResult(students, dataset, "SEND persistent absence attainment impact", data,
        [`${risk.length} Students of Determination are below 90% attendance.`, `Their at/above-expected rate is ${data[0].Attainment}% versus ${data[1].Attainment}% across all SEND pupils.`, "This overlap belongs in inclusion and personal-development evidence."], risk,
        "The question combines SEND status with attendance below 90%.", "SEND pupils whose attendance is below 90%",
        [numberStep("SEND persistent absence", risk.length, "SEND status AND attendance < 90%"), share("SEND absent cohort at or above expected", risk.filter((s) => termTwo(s) >= 5).length, risk.length), share("All SEND at or above expected", send.filter((s) => termTwo(s) >= 5).length, send.length)]);
    }
    const sendDelta = round(avg(send.map((s) => termTwo(s) - termOne(s))));
    const nonDelta = round(avg(nonSend.map((s) => termTwo(s) - termOne(s))));
    return makeResult(students, dataset, "Current-cycle progress delta by inclusion cohort", [{ label: "SEND", Progress: sendDelta }, { label: "Non-SEND", Progress: nonDelta }],
      [`SEND pupils record a ${sendDelta >= 0 ? "+" : ""}${sendDelta} grade progress delta.`, `Non-SEND pupils record a ${nonDelta >= 0 ? "+" : ""}${nonDelta} grade progress delta.`, `The evidenced inclusion gap is ${round(sendDelta - nonDelta)} grades.`], send,
      "The question compares observed Term 1 to Term 2 progress by inclusion status.", "SEND pupils compared with all non-SEND peers",
      [mean("SEND progress delta", send.map((s) => termTwo(s) - termOne(s))), mean("Non-SEND progress delta", nonSend.map((s) => termTwo(s) - termOne(s))), { label: "Progress gap", formula: "SEND mean progress − non-SEND mean progress", inputs: `${sendDelta} − ${nonDelta}`, result: `${round(sendDelta - nonDelta)} grades` }], "label", ["Progress"]);
  }
  if (/borderline|58%|62%|boundary/.test(lower)) {
    const secondary = students.filter((s) => s.yearGroup >= 7 && s.yearGroup <= 11);
    const borderline = secondary.filter((s) => { const mark = subjectScore(s, "math"); return mark > 9 ? mark >= 58 && mark <= 62 : mark >= 5 && mark <= 5.6; });
    const secure = secondary.filter((s) => subjectScore(s, "math") >= 5.6).length;
    return makeResult(students, dataset, "Secondary Mathematics boundary tracking", [{ label: "Borderline", Count: borderline.length }, { label: "Secure Grade 5+", Count: secure }],
      [`${borderline.length} pupils sit in the configured Mathematics boundary window.`, "Every displayed row uses a pseudonymous student reference.", "Boundary flags use current marks only; no future score is predicted."], borderline,
      "The question requests pupils near the current Mathematics boundary.", "Math grade 5–5.6, or percentage mark 58–62 when available",
      [numberStep("Borderline pupils", borderline.length, "count Secondary pupils inside the stated mark window"), numberStep("Above boundary", secure, "count Secondary pupils with Mathematics grade ≥ 5.6")], "label", ["Count"]);
  }
  if (/gender|boys|girls|male|female/.test(lower)) {
    const year = lower.match(/(?:year|y)\s*(\d{1,2})/);
    const stage = /ks3/.test(lower) ? [7, 9] : /ks4/.test(lower) ? [10, 11] : null;
    const cohort = students.filter((s) => year ? s.yearGroup === Number(year[1]) : stage ? s.yearGroup >= stage[0] && s.yearGroup <= stage[1] : true);
    const subject: "math" | "science" | "english" = /math/.test(lower) ? "math" : /english/.test(lower) ? "english" : "science";
    const boys = cohort.filter((s) => s.gender === "Male");
    const girls = cohort.filter((s) => s.gender === "Female");
    const boysAvg = round(avg(boys.map((s) => subjectScore(s, subject))));
    const girlsAvg = round(avg(girls.map((s) => subjectScore(s, subject))));
    return makeResult(students, dataset, `${subject[0].toUpperCase() + subject.slice(1)} attainment by gender`, [{ label: "Boys", Average: boysAvg }, { label: "Girls", Average: girlsAvg }],
      [`Boys average Grade ${boysAvg}; girls average Grade ${girlsAvg} in the selected cohort.`, `The observed gender gap is ${round(Math.abs(girlsAvg - boysAvg))} grades.`, "The comparison uses current records only."], [...boys, ...girls],
      `The question requests ${subject} grade averages grouped by gender${year ? ` for Year ${year[1]}` : stage ? ` for ${/ks3/.test(lower) ? "KS3" : "KS4"}` : ""}.`, "Pupils with Male or Female gender value in the selected year or stage",
      [mean(`Boys ${subject} mean`, boys.map((s) => subjectScore(s, subject))), mean(`Girls ${subject} mean`, girls.map((s) => subjectScore(s, subject))), { label: "Absolute gender gap", formula: "absolute value of girls mean − boys mean", inputs: `|${girlsAvg} − ${boysAvg}|`, result: `${round(Math.abs(girlsAvg - boysAvg))} grades` }], "label", ["Average"]);
  }
  if (/attendance|absence|below 85|below 90/.test(lower)) {
    const threshold = /85/.test(lower) ? 85 : 90;
    const risk = students.filter((s) => s.attendanceRate < threshold);
    const rest = students.filter((s) => s.attendanceRate >= threshold);
    const riskRate = pct(risk.filter((s) => termTwo(s) >= 5).length, risk.length);
    const restRate = pct(rest.filter((s) => termTwo(s) >= 5).length, rest.length);
    return makeResult(students, dataset, `Attainment by attendance threshold (${threshold}%)`, [{ label: `Below ${threshold}%`, Attainment: riskRate }, { label: `At least ${threshold}%`, Attainment: restRate }],
      [`${risk.length} of ${students.length} pupils have attendance below ${threshold}%.`, `Their at/above-expected attainment rate is ${riskRate}% versus ${restRate}% for peers at or above ${threshold}%.`, "This is an observed association, not a causal claim."], risk,
      `The question requests an observed comparison using the ${threshold}% attendance threshold.`, `Pupils whose attendance is below ${threshold}%`,
      [share("Attendance risk prevalence", risk.length, students.length), share("Below threshold attainment", risk.filter((s) => termTwo(s) >= 5).length, risk.length), share("At or above threshold attainment", rest.filter((s) => termTwo(s) >= 5).length, rest.length)]);
  }
  if (/emirati|national/.test(lower)) {
    const national = students.filter((s) => s.emiratiStatus);
    const peers = students.filter((s) => !s.emiratiStatus);
    const nationalRate = pct(national.filter((s) => termTwo(s) >= 5).length, national.length);
    const peersRate = pct(peers.filter((s) => termTwo(s) >= 5).length, peers.length);
    return makeResult(students, dataset, "Emirati cohort attainment", [{ label: "Emirati", Attainment: nationalRate }, { label: "Other pupils", Attainment: peersRate }],
      [`${national.length} Emirati pupils are in the active cohort.`, `Their at/above-expected rate is ${nationalRate}% versus ${peersRate}% for other pupils.`, `The observed gap is ${round(nationalRate - peersRate)} percentage points.`], national,
      "The question requests attainment by Emirati status.", "Pupils marked Emirati in the committed dataset",
      [share("Emirati attainment", national.filter((s) => termTwo(s) >= 5).length, national.length), share("Other pupil attainment", peers.filter((s) => termTwo(s) >= 5).length, peers.length), { label: "Attainment gap", formula: "Emirati rate − other pupil rate", inputs: `${nationalRate}% − ${peersRate}%`, result: `${round(nationalRate - peersRate)} percentage points` }]);
  }
  if (!/attainment|benchmark|subject|math|science|english|core|school|dsib|grade/.test(lower)) {
    const noReference = /roll|student|pupil|reference|mark/.test(lower);
    const message = noReference
      ? "No matching pupil reference was found in the active files. Check the exact roll or student ID and ask again."
      : "I could not map that question to a verified calculation. Ask about attainment, attendance, SEND, gender, Emirati pupils, phases, or data quality.";
    return {
      intent: { intentType: "general", filters: [], clarificationNeeded: true, clarificationPrompt: message },
      kpis: [], table: table([]), chart: null, highlightedStudents: [],
      filterDescription: "No calculation was run", sourceDataset: dataset, explanation: message,
      suggestedActions: [message],
      verification: { interpretation: "The local query rules could not identify a supported calculation.", cohortRule: "No filter was applied", totalRecords: students.length, matchedRecords: 0, steps: [], evidence: table([]) },
    };
  }
  const subjects = [["English", "english"], ["Mathematics", "math"], ["Science", "science"]] as const;
  const requested = subjects.filter(([label, subject]) => lower.includes(subject) || lower.includes(label.toLowerCase()));
  const selected = requested.length === 1 && !/whole.school|core subjects|across/.test(lower) ? requested : subjects;
  const data = selected.map(([label, subject]) => ({ label, Attainment: pct(students.filter((s) => subjectScore(s, subject) >= 5).length, students.length), "Below Expected": pct(students.filter((s) => subjectScore(s, subject) < 5).length, students.length) }));
  return makeResult(students, dataset, "Core attainment against the 75% DSIB benchmark", data,
    [`${data.filter((s) => s.Attainment >= 75).length} of ${data.length} assessed subject${data.length === 1 ? "" : "s"} meet the 75% DSIB reference.`, `The strongest assessed subject is ${[...data].sort((a, b) => b.Attainment - a.Attainment)[0].label}.`, "All percentages are reproducible from the anonymized evidence ledger."], students,
    "The question requests current core subject attainment against the 75% reference.", "All committed pupils, assessed separately in English, Mathematics, and Science",
    selected.flatMap(([label, subject]) => { const attained = students.filter((s) => subjectScore(s, subject) >= 5).length; return [share(`${label} at or above expected`, attained, students.length), share(`${label} below expected`, students.length - attained, students.length)]; }), "label", ["Attainment", "Below Expected"]);
}
