import assert from "node:assert/strict";
import fs from "node:fs";
import { stageSchoolFiles } from "../src/lib/engine/secure-ingestion.ts";
import { buildCat4RealityMap, buildInspectionFlanks } from "../src/lib/engine/screening.ts";

const file = (name, contents) => Object.assign(new Blob([contents]), { name });
const demo = file("demo.xlsx", fs.readFileSync("../data/Inside_Demo_UAE_School_Master_Database.xlsx"));
const staged = await stageSchoolFiles([demo]);
assert.equal(staged.records.length, 1300);
assert.equal(staged.dataTrust.identityIntegrity, 100);
assert.equal(staged.dataTrust.requiredFieldsCompleteness, 100);
assert.equal(staged.dataTrust.assessmentCompleteness, 100);
assert.equal(staged.dataTrust.eligiblePupils, 1045);
assert.equal(staged.dataTrust.availableCoreMarks, 3135);
assert.equal(staged.dataTrust.cat4Availability, 65.92);
assert.equal(staged.dataTrust.overallHealth, 100);
const cat4 = buildCat4RealityMap(staged.records);
assert.deepEqual(cat4.map((item) => item.cohort), [857, 857, 857]);
assert.equal(cat4[0].evidence.rows.length, 857);
const demoFlanks = buildInspectionFlanks(staged.records);
assert(demoFlanks.some((item) => item.id === "gender-english"));
assert.equal(demoFlanks.find((item) => item.id === "severe-absence")?.rows.length, 25);

const strict = await stageSchoolFiles([file("headers.csv", "Student_Ref,Verbal_SAS,Overall_SAS,Year_Group,Phase,Gender,Emirati,Maths_T2,English_T2,Science_T2\nTEST-1,120,105,Y8,Secondary,Female,Y,5,6,7")]);
assert.equal(strict.records[0].cat4_sas, 105);
assert.equal(strict.mappings.find((item) => item.original === "Verbal_SAS")?.mappedTo, "ignore");
assert.equal(strict.mappings.find((item) => item.original === "Overall_SAS")?.mappedTo, "cat4_sas");

const joined = await stageSchoolFiles([
  file("mis.csv", "Student_Ref,Student_Name,Gender,Year_Group,Phase,Emirati\nTEST-2,Demo Pupil,Female,Y7,Secondary,Y"),
  file("marks.csv", "Student_Ref,Maths,English,Science\nTEST-2,6,7,5"),
]);
assert.equal(joined.records.length, 1);
assert.equal(joined.dataTrust.identityIntegrity, 100);
assert.equal(joined.dataTrust.requiredFieldsCompleteness, 100);
assert.equal(joined.dataTrust.assessmentCompleteness, 100);
assert.equal(joined.dataTrust.cat4Availability, 0);
assert.equal(joined.dataTrust.overallHealth, 100);
const duplicate = await stageSchoolFiles([file("duplicate.csv", "Student_Ref,Student_Name,Gender,Year_Group,Phase,Emirati,Maths,English,Science\nTEST-3,Demo Pupil,Female,Y7,Secondary,Y,6,7,5\nTEST-3,Demo Pupil,Female,Y7,Secondary,Y,6,7,5")]);
assert.equal(duplicate.dataTrust.duplicateRefs, 1);
assert.equal(duplicate.dataTrust.identityIntegrity, 50);

const makePupil = (index, gender, mark, sas = null, attendance = 95) => ({
  id: `STU-${index}`, sourceRef: `TEST-${index}`, name: "Redacted in analysis", gender,
  yearGroup: 8, classGroup: "8A", attendanceRate: attendance, attendancePresent: true,
  mathGrade: mark, englishGrade: mark, scienceGrade: mark, overallScore: mark,
  assessmentPresent: { math: true, english: true, science: true }, cat4_sas: sas,
  emiratiStatus: true, senStatus: false, riskLevel: "Low",
});
const gender = Array.from({ length: 20 }, (_, index) => makePupil(index, index < 10 ? "Female" : "Male", index < 10 ? 6 : 4));
const genderFlank = buildInspectionFlanks(gender).find((item) => item.id === "gender-english");
assert(genderFlank);
assert.equal(genderFlank.rows.length, 20);
assert(genderFlank.cohortImpact.includes("100"));
const tooSmall = buildInspectionFlanks(gender.slice(0, 18));
assert(!tooSmall.some((item) => item.id.startsWith("gender-")));

const progress = Array.from({ length: 10 }, (_, index) => ({
  ...makePupil(index, "Other", 6), emiratiStatus: false,
  term1MathGrade: 7, term2MathGrade: 6,
  term1EnglishGrade: 7, term2EnglishGrade: 6,
  term1ScienceGrade: 7, term2ScienceGrade: 6,
  attendanceRate: index < 2 ? 80 : 95,
}));
const progressFlanks = buildInspectionFlanks(progress);
assert(progressFlanks.some((item) => item.id === "progress-english"));
assert.equal(progressFlanks.find((item) => item.id === "severe-absence")?.rows.length, 2);

assert.equal(buildCat4RealityMap(gender).length, 0);
const highVariance = buildCat4RealityMap(Array.from({ length: 20 }, (_, index) => makePupil(index, "Other", 6, 80)));
const lowVariance = buildCat4RealityMap(Array.from({ length: 20 }, (_, index) => makePupil(index, "Other", 4, 100)));
assert.equal(highVariance[0].evidence.tone, "amber");
assert.equal(lowVariance[0].evidence.tone, "orange");
console.log("Data trust, strict CAT4 mapping, local screening, and evidence tests passed.");
