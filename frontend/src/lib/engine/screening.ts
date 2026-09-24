import type { StudentRecord } from "@/types/student-data";

export type CoreSubject = "english" | "math" | "science";
export type ScreeningTone = "amber" | "orange" | "red" | "neutral";

export interface EvidenceRow {
  studentRef: string;
  yearGroup: number;
  cat4Sas: number | null;
  currentMark: number | null;
  attendance: number | null;
}

export interface ScreeningEvidence {
  id: string;
  title: string;
  summary: string;
  talkingPoint: string;
  tone: ScreeningTone;
  rule: string;
  cohortImpact: string;
  steps: string[];
  rows: EvidenceRow[];
}

export interface Cat4Comparison {
  subject: CoreSubject;
  cohort: number;
  passed: number;
  baselineAtLeast90: number;
  passRate: number;
  baselineRate: number;
  variance: number;
  higher: number;
  expected: number;
  lower: number;
  evidence: ScreeningEvidence;
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const pct = (part: number, total: number) => total ? round2(part / total * 100) : 0;
const label = (subject: CoreSubject | "overall") => subject === "math" ? "Maths" : subject === "overall" ? "Overall Core" : subject[0].toUpperCase() + subject.slice(1);
const currentMark = (student: StudentRecord, subject: CoreSubject) => subject === "math"
  ? student.term2MathGrade ?? student.mathGrade
  : subject === "english" ? student.term2EnglishGrade ?? student.englishGrade : student.term2ScienceGrade ?? student.scienceGrade;
const priorMark = (student: StudentRecord, subject: CoreSubject) => subject === "math"
  ? student.term1MathGrade : subject === "english" ? student.term1EnglishGrade : student.term1ScienceGrade;
const hasMark = (student: StudentRecord, subject: CoreSubject) =>
  student.assessmentPresent ? student.assessmentPresent[subject] : Number.isFinite(currentMark(student, subject)) && currentMark(student, subject) > 0;
const hasValidSas = (student: StudentRecord) => Number.isInteger(student.cat4_sas) && student.cat4_sas! >= 60 && student.cat4_sas! <= 141;
const hasAttendance = (student: StudentRecord) => student.attendancePresent ?? Number.isFinite(student.attendanceRate);
const overallMark = (student: StudentRecord) => round2((currentMark(student, "english") + currentMark(student, "math") + currentMark(student, "science")) / 3);
const withAllCoreMarks = (student: StudentRecord) => hasMark(student, "english") && hasMark(student, "math") && hasMark(student, "science");

function rowFor(student: StudentRecord, mark: number | null): EvidenceRow {
  return {
    studentRef: student.sourceRef || student.id,
    yearGroup: student.yearGroup,
    cat4Sas: student.cat4_sas ?? null,
    currentMark: mark,
    attendance: hasAttendance(student) ? student.attendanceRate : null,
  };
}

export function buildCat4RealityMap(students: StudentRecord[], passGrade = 5): Cat4Comparison[] {
  if (!students.some(hasValidSas)) return [];
  return (["english", "math", "science"] as const).map((subject) => {
    const cohort = students.filter((student) => hasValidSas(student) && hasMark(student, subject));
    const n = cohort.length;
    const passed = cohort.filter((student) => currentMark(student, subject) >= passGrade).length;
    const baselineAtLeast90 = cohort.filter((student) => student.cat4_sas! >= 90).length;
    const higher = cohort.filter((student) => student.cat4_sas! >= 112).length;
    const expected = cohort.filter((student) => student.cat4_sas! >= 90 && student.cat4_sas! <= 111).length;
    const lower = cohort.filter((student) => student.cat4_sas! < 90).length;
    const passRate = pct(passed, n);
    const baselineRate = pct(baselineAtLeast90, n);
    const variance = round2(passRate - baselineRate);
    const tone: ScreeningTone = variance > 15 ? "amber" : variance < -10 ? "orange" : "neutral";
    const summary = tone === "amber"
      ? "Attainment–Baseline Variance: internal pass rate exceeds the cognitive baseline share."
      : tone === "orange" ? "Attainment–Baseline Gap: internal attainment is below the baseline share."
        : "No CAT4 comparison threshold triggered.";
    const name = label(subject);
    return {
      subject, cohort: n, passed, baselineAtLeast90, passRate, baselineRate, variance, higher, expected, lower,
      evidence: {
        id: `cat4-${subject}`, title: `${name} CAT4 baseline comparison`, summary,
        talkingPoint: "Check assessment moderation and curriculum context before interpreting this difference. Cognitive SAS is not a predicted grade.",
        tone,
        rule: `Rule: (Grade ${passGrade}+ pass % − SAS ≥ 90 %) > +15 pp or < −10 pp in ${name}; Inside screening heuristic, not a regulator formula.`,
        cohortImpact: `CAT4-eligible ${name} cohort: ${n} pupils · ${passed} Grade ${passGrade}+ · ${baselineAtLeast90} SAS ≥ 90 · variance ${variance >= 0 ? "+" : ""}${variance} pp`,
        steps: [
          `Current pass rate: ${passed} ÷ ${n} × 100 = ${passRate}%`,
          `Baseline share: ${baselineAtLeast90} ÷ ${n} × 100 = ${baselineRate}%`,
          `Variance: ${passRate}% − ${baselineRate}% = ${variance >= 0 ? "+" : ""}${variance} percentage points`,
        ],
        rows: cohort.map((student) => rowFor(student, currentMark(student, subject))),
      },
    };
  });
}

export function buildInspectionFlanks(students: StudentRecord[]): ScreeningEvidence[] {
  const findings: ScreeningEvidence[] = [];
  for (const subject of ["english", "math", "science", "overall"] as const) {
    const marked = students.filter((student) => student.emiratiStatus &&
      (subject === "overall" ? withAllCoreMarks(student) : hasMark(student, subject)));
    const female = marked.filter((student) => student.gender === "Female");
    const male = marked.filter((student) => student.gender === "Male");
    if (female.length < 10 || male.length < 10) continue;
    const getMark = (student: StudentRecord) => subject === "overall" ? overallMark(student) : currentMark(student, subject);
    const femalePass = female.filter((student) => getMark(student) >= 5).length;
    const malePass = male.filter((student) => getMark(student) >= 5).length;
    const femaleRate = pct(femalePass, female.length);
    const maleRate = pct(malePass, male.length);
    const gap = round2(Math.abs(femaleRate - maleRate));
    if (gap <= 10) continue;
    findings.push({
      id: `gender-${subject}`, title: `Gender Attainment Gap · ${label(subject)}`,
      summary: `Screening threshold triggered: ${gap} pp difference in ${label(subject)} attainment between female and male UAE National cohorts.`,
      talkingPoint: `Review ${label(subject)} assessment evidence and current support by cohort; do not infer a cause from this comparison.`,
      tone: "amber",
      rule: `Rule: ABS(Emirati Female Grade 5+ % − Emirati Male Grade 5+ %) > 10 pp in ${label(subject)}; each assessed cohort N ≥ 10.`,
      cohortImpact: `${female.length} females (${femaleRate}% pass) vs ${male.length} males (${maleRate}% pass) · absolute gap ${gap} pp`,
      steps: [
        `Female pass rate: ${femalePass} ÷ ${female.length} × 100 = ${femaleRate}%`,
        `Male pass rate: ${malePass} ÷ ${male.length} × 100 = ${maleRate}%`,
        `Absolute difference: |${femaleRate}% − ${maleRate}%| = ${gap} percentage points`,
      ],
      rows: [...female, ...male].map((student) => rowFor(student, getMark(student))),
    });
  }

  for (const subject of ["english", "math", "science"] as const) {
    const paired = students.filter((student) => hasMark(student, subject) && priorMark(student, subject) !== undefined && Number.isFinite(priorMark(student, subject)));
    if (!paired.length) continue;
    const passed = paired.filter((student) => currentMark(student, subject) >= 5).length;
    const attainment = pct(passed, paired.length);
    const totalDelta = paired.reduce((sum, student) => sum + currentMark(student, subject) - priorMark(student, subject)!, 0);
    const delta = round2(totalDelta / paired.length);
    if (attainment < 75 || delta > 0) continue;
    findings.push({
      id: `progress-${subject}`, title: `Progress Stagnation · ${label(subject)}`,
      summary: `Screening threshold triggered: ${attainment}% current ${label(subject)} attainment with ${delta >= 0 ? "+" : ""}${delta} average grade change.`,
      talkingPoint: "Check the paired pupils' starting points and assessment comparability before deciding whether additional challenge is needed.",
      tone: "orange",
      rule: `Rule: ${label(subject)} Grade 5+ attainment ≥ 75% AND mean(T2 − T1) ≤ 0 for pupils with both term results.`,
      cohortImpact: `${paired.length} pupils with paired ${label(subject)} marks · ${passed} Grade 5+ · mean change ${delta >= 0 ? "+" : ""}${delta}`,
      steps: [
        `Current attainment: ${passed} ÷ ${paired.length} × 100 = ${attainment}%`,
        `Sum of T2 − T1 grade changes: ${round2(totalDelta)}`,
        `Mean grade change: ${round2(totalDelta)} ÷ ${paired.length} = ${delta >= 0 ? "+" : ""}${delta}`,
      ],
      rows: paired.map((student) => rowFor(student, currentMark(student, subject))),
    });
  }

  const absent = students.filter((student) => hasAttendance(student) && student.attendanceRate < 85);
  if (absent.length) {
    const rate = pct(absent.length, students.length);
    findings.push({
      id: "severe-absence", title: "Severe Absence Screening",
      summary: `${absent.length} pupils below 85% attendance (${rate}% of current dataset). Inside screening threshold triggered.`,
      talkingPoint: "Review the local attendance list with the pastoral team and check assessment overlap; this is not a statutory threshold.",
      tone: "red",
      rule: "Rule: count(attendance percentage < 85%) > 0; Inside screening heuristic, not a statutory threshold.",
      cohortImpact: `${absent.length} of ${students.length} current pupils are below 85% attendance (${rate}%).`,
      steps: [`Count with attendance < 85%: ${absent.length}`, `Cohort share: ${absent.length} ÷ ${students.length} × 100 = ${rate}%`],
      rows: absent.map((student) => rowFor(student, withAllCoreMarks(student) ? overallMark(student) : null)),
    });
  }
  return findings;
}
