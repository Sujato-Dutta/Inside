import assert from "node:assert/strict";
import { analyzeAdvice, analyzeRecordList } from "../src/lib/engine/statutory-analysis.ts";

const pupils = Array.from({ length: 24 }, (_, index) => ({
  id: `STU-${index}`,
  name: "",
  gender: index < 12 ? "Male" : "Female",
  yearGroup: 9,
  classGroup: "9A",
  attendanceRate: index < 2 ? 80 : 96,
  mathGrade: index < 12 ? 4 : 6,
  scienceGrade: 6,
  englishGrade: 6,
  overallScore: 60,
  senStatus: false,
  riskLevel: "Low",
}));
const plan = {
  analysis: "advice",
  subject: "Mathematics",
  year: null,
  stage: null,
  gender: "Male",
  send: null,
  emirati: null,
  metric: null,
  focus: "attainment",
  presentation: "",
  reasoning: "",
  advice: ["This is model text and must not be treated as a verified finding."],
  attendanceThreshold: null,
  clarification: null,
};
const result = analyzeAdvice(pupils, plan);
assert.equal(result.intent.clarificationNeeded, undefined);
assert.equal(result.chart.data[0].Cohort, 0);
assert.equal(result.chart.data[0].Peers, 100);
assert.equal(result.verification.evidence.rows.length, 24);
assert.equal(result.verification.localRecordIds.length, 24);
assert.ok(result.verification.steps.length >= 3);
assert.ok(result.suggestedActions.every((finding) => !finding.includes("model text")));

const rankingPupils = pupils.map((pupil, index) => ({ ...pupil, name: `Pupil ${index}`, sourceRef: `ROLL-${index}`, mathGrade: index === 0 ? 2 : index === 1 ? 3 : pupil.mathGrade }));
const ranking = analyzeRecordList(rankingPupils, {
  ...plan, analysis: "record_list", subject: null, recordSort: "core_grade", recordOrder: "lowest", recordLimit: 2,
});
assert.equal(ranking.intent.intentType, "student_lookup");
assert.equal(ranking.table.rows.length, 2);
assert.equal(ranking.table.rows[0][1], "Pupil 0");
assert.equal(ranking.table.rows[0][2], "ROLL-0");
assert.equal(ranking.table.rows[1][1], "Pupil 1");
assert.equal(ranking.verification.localRecordIds.length, 12);
assert.equal(ranking.chart, null);

console.log("Ask Inside local calculation and record ranking checks passed.");
