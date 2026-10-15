import { StudentRecord } from "@/types/student-data";
import rawStudents from "./mock-school-data.json";

export const PRESET_QUESTIONS = [
  "How is whole-school attainment compared with the 75% reference?",
  "Which core subject needs attention first?",
  "How does persistent absence relate to attainment?",
  "Show Year 8 attendance week by week this term.",
  "Did the Year 10-11 Maths Booster work?",
  "Are our SEND students making progress compared with peers?",
  "Is there a gap for our Emirati students?",
  "Which classes are underperforming on progress?",
  "Is there a gender gap in KS3 English?",
  "Which Year 10-11 students are closest to a grade 5, and are they attending?",
  "Are new joiners settling in and making progress?",
  "Are our source files mapped and free of duplicate references?"
];

export const PRESET_DESCRIPTIONS: Record<string, string> = {
  "How is whole-school attainment compared with the 75% reference?": "79.0% at Grade 5+ (N = 1,045); Science highest (86.2%), English (82.0%), Maths lowest (79.0%).",
  "Which core subject needs attention first?": "Maths (79.0%) is lowest of core subjects vs Science (86.2%). Gives VP Academics a clear priority.",
  "How does persistent absence relate to attainment?": "9.2% persistently absent (119 pupils). Pupils <90% attain 68.9% vs 80.0% for >=90% (-11.1 pp gap).",
  "Show Year 8 attendance week by week this term.": "Year 8 drifts down from 94.6% (W1) to trough of 90.3% in W7 (13 pupils with 3+ absences in W6).",
  "Did the Year 10-11 Maths Booster work?": "68.0% of enrolled booster pupils (N = 25) reached Grade 5+ vs 27.8% in comparison group (N = 18).",
  "Are our SEND students making progress compared with peers?": "SEND (82 pupils) progress +0.22 vs peers +0.09, but SEMH is flat at +0.00 (N = 11).",
  "Is there a gap for our Emirati students?": "199 Emirati pupils (156 assessed): 76.3% attain Grade 5+ vs 79.5% non-Emirati (-3.25 pp gap).",
  "Which classes are underperforming on progress?": "Class 9C shows -0.33 average core grade movement (9B -0.03, 9A +0.08, 9D +0.20).",
  "Is there a gender gap in KS3 English?": "KS3 boys average 5.60 vs girls 6.24 (-0.64 grade gap).",
  "Which Year 10-11 students are closest to a grade 5, and are they attending?": "21 borderline pupils (core average 4.00-4.99), of whom 3 have <90% attendance.",
  "Are new joiners settling in and making progress?": "New joiners average -0.04 grade movement vs +0.11 for continuing students.",
  "Are our source files mapped and free of duplicate references?": "100% Data Hub health: 1,300 unique Student_Ref keys with 0 duplicate records."
};

export const SAMPLE_STUDENTS: StudentRecord[] = rawStudents as unknown as StudentRecord[];
