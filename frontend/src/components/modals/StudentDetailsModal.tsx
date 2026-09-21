"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useSessionData } from "@/context/SessionDataContext";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function StudentDetailsModal() {
  const { activeModalStudentIds, activeModalTitle, closeStudentModal, students, setPrefilledQuery } =
    useSessionData();
  const router = useRouter();

  if (!activeModalStudentIds) return null;

  const flaggedStudents = students.filter((s) => activeModalStudentIds.includes(s.id));

  const handleAskAboutCohort = () => {
    const studentNames = flaggedStudents.map((s) => s.name).slice(0, 4).join(", ");
    setPrefilledQuery(`Provide an action plan for students needing support: ${studentNames}`);
    closeStudentModal();
    router.push("/app/ask");
  };

  return (
    <Modal isOpen={true} onClose={closeStudentModal} title={activeModalTitle || "Flagged Student Records"}>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[13px] text-[#5C5852] pb-2 border-b border-[#E3DED4]">
          <span>{flaggedStudents.length} Students Flagged</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Session Isolated
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#E3DED4] divide-y divide-[#E3DED4]">
          {flaggedStudents.map((stu) => (
            <div key={stu.id} className="p-3 hover:bg-orange-50/40 transition flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold text-[13px] shrink-0">
                  {stu.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#1C1A17] truncate">
                    {stu.name}
                  </div>
                  <div className="text-[12px] text-[#5C5852] flex items-center gap-2">
                    <span>Year {stu.yearGroup} ({stu.classGroup})</span>
                    <span>•</span>
                    <span>Att: <strong className={stu.attendanceRate < 85 ? "text-red-600" : "text-[#1C1A17]"}>{stu.attendanceRate}%</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[12px] font-semibold text-[#1C1A17]">
                  Math {stu.mathGrade} | Eng {stu.englishGrade}
                </div>
                <div className="text-[11px] px-2 py-0.5 rounded-full inline-block mt-0.5 font-bold bg-orange-50 text-orange-600 border border-orange-200">
                  {stu.riskLevel} Priority
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={closeStudentModal}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleAskAboutCohort} icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Ask Inside About This Cohort
          </Button>
        </div>
      </div>
    </Modal>
  );
}
