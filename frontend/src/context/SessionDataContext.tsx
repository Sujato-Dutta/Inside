"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StudentRecord, UploadedFileMeta, AskAnswer, ColumnMapping } from "@/types/student-data";
import { InsightAnomaly } from "@/lib/engine/types";
import { DeterministicResult } from "@/lib/engine/types";
import { SAMPLE_STUDENTS } from "@/data/mock-school-data";
import { scanDatasetInsights } from "@/lib/engine/calculator";
import { parseSpreadsheetInBrowser, ParseResult } from "@/lib/engine/data-parser";

export interface AskExchange {
  id: string;
  question: string;
  interpretedQuestion: string;
  result: DeterministicResult;
}

interface SessionDataContextType {
  students: StudentRecord[];
  activeFiles: UploadedFileMeta[];
  insights: InsightAnomaly[];
  readinessScore: number;
  sessionMinutesRemaining: number;
  sessionDeleted: boolean;
  answersHistory: AskAnswer[];
  askExchanges: AskExchange[];
  prefilledQuery: string;
  prefilledReportTemplate: string;
  activeModalStudentIds: string[] | null;
  activeModalTitle: string;
  setPrefilledQuery: (q: string) => void;
  setPrefilledReportTemplate: (t: string) => void;
  addAnswer: (ans: AskAnswer) => void;
  clearAnswersHistory: () => void;
  addAskExchange: (exchange: AskExchange) => void;
  resetAskConversation: () => void;
  openStudentModal: (title: string, ids: string[]) => void;
  closeStudentModal: () => void;
  deleteSessionDataNow: () => void;
  loadSampleDataset: () => void;
  importParsedData: (fileName: string, fileSize: number, records: StudentRecord[]) => void;
  commitSanitizedDataset: (
    files: UploadedFileMeta[],
    records: StudentRecord[],
    readiness: number
  ) => void;
  importFileContent: (fileName: string, fileSize: number, contentString: string) => ParseResult;
}

const SessionDataContext = createContext<SessionDataContextType | undefined>(undefined);

export function SessionDataProvider({ children }: { children: React.ReactNode }) {
  const initialInsights: InsightAnomaly[] = scanDatasetInsights(SAMPLE_STUDENTS);

  const [students, setStudents] = useState<StudentRecord[]>(SAMPLE_STUDENTS);
  const [activeFiles, setActiveFiles] = useState<UploadedFileMeta[]>([
    {
      id: "file-default-1",
      name: "inside_synthetic_school_data_500.csv",
      size: 48694,
      uploadedAt: "Just now",
      rowCount: SAMPLE_STUDENTS.length,
      columns: [
        "StudentID", "StudentName", "YearGroup", "ClassSection", "Gender",
        "Emirati_Status", "Inclusion_SEND", "EAL_Status", "Attendance_Pct",
        "CAT4_Verbal_SAS", "CAT4_NonVerbal_SAS", "CAT4_Quantitative_SAS", "CAT4_Spatial_SAS",
        "CAT4_Mean_SAS", "CAT4_Overall_Stanine", "Predicted_Math_Grade", "Predicted_Science_Grade",
        "Predicted_English_Grade", "Term1_Math_Grade", "Term1_Science_Grade", "Term1_English_Grade",
        "Term2_Math_Grade", "Term2_Science_Grade", "Term2_English_Grade", "Missing_Assignments", "Behaviour_Incidents"
      ],
      status: "ready",
    },
  ]);
  const [insights, setInsights] = useState<InsightAnomaly[]>(initialInsights);
  const [readinessScore, setReadinessScore] = useState<number>(100);
  const [sessionMinutesRemaining, setSessionMinutesRemaining] = useState<number>(45);
  const [sessionDeleted, setSessionDeleted] = useState<boolean>(false);
  const [answersHistory, setAnswersHistory] = useState<AskAnswer[]>([]);
  const [askExchanges, setAskExchanges] = useState<AskExchange[]>([]);
  const [prefilledQuery, setPrefilledQuery] = useState<string>("");
  const [prefilledReportTemplate, setPrefilledReportTemplate] = useState<string>("Leadership Summary");
  const [activeModalStudentIds, setActiveModalStudentIds] = useState<string[] | null>(null);
  const [activeModalTitle, setActiveModalTitle] = useState<string>("");

  // Decrement session timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionMinutesRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const deleteSessionDataNow = () => {
    setStudents([]);
    setActiveFiles([]);
    setInsights([]);
    setAnswersHistory([]);
    setAskExchanges([]);
    setReadinessScore(0);
    setSessionDeleted(true);
  };

  const loadSampleDataset = () => {
    setStudents(SAMPLE_STUDENTS);
    setActiveFiles([
      {
        id: `file-${Date.now()}`,
        name: "inside_synthetic_school_data_500.csv",
        size: 48694,
        uploadedAt: "Just now",
        rowCount: SAMPLE_STUDENTS.length,
        columns: [
          "StudentID", "StudentName", "YearGroup", "ClassSection", "Gender",
          "Emirati_Status", "Inclusion_SEND", "EAL_Status", "Attendance_Pct",
          "CAT4_Verbal_SAS", "CAT4_NonVerbal_SAS", "CAT4_Quantitative_SAS", "CAT4_Spatial_SAS",
          "CAT4_Mean_SAS", "CAT4_Overall_Stanine", "Predicted_Math_Grade", "Predicted_Science_Grade",
          "Predicted_English_Grade", "Term1_Math_Grade", "Term1_Science_Grade", "Term1_English_Grade",
          "Term2_Math_Grade", "Term2_Science_Grade", "Term2_English_Grade", "Missing_Assignments", "Behaviour_Incidents"
        ],
        status: "ready",
      },
    ]);
    setInsights(scanDatasetInsights(SAMPLE_STUDENTS));
    setAskExchanges([]);
    setReadinessScore(100);
    setSessionDeleted(false);
    setSessionMinutesRemaining(45);
  };

  const addAnswer = (ans: AskAnswer) => {
    setAnswersHistory((prev) => [...prev, ans]);
  };

  const clearAnswersHistory = () => {
    setAnswersHistory([]);
  };

  const addAskExchange = (exchange: AskExchange) => setAskExchanges((previous) => [...previous, exchange]);
  const resetAskConversation = () => { setAskExchanges([]); setPrefilledQuery(""); };

  const openStudentModal = (title: string, ids: string[]) => {
    setActiveModalTitle(title);
    setActiveModalStudentIds(ids);
  };

  const closeStudentModal = () => {
    setActiveModalStudentIds(null);
    setActiveModalTitle("");
  };

  const importParsedData = (fileName: string, fileSize: number, newRecords: StudentRecord[]) => {
    setStudents(newRecords);
    setInsights(scanDatasetInsights(newRecords));
    setAskExchanges([]);
    setActiveFiles((prev) => [
      {
        id: `file-${Date.now()}`,
        name: fileName,
        size: fileSize,
        uploadedAt: "Just now",
        rowCount: newRecords.length,
        columns: Object.keys(newRecords[0] || {}),
        status: "ready",
      },
      ...prev,
    ]);
    setReadinessScore(96);
    setSessionDeleted(false);
  };

  const commitSanitizedDataset = (
    files: UploadedFileMeta[],
    records: StudentRecord[],
    readiness: number
  ) => {
    setStudents(records);
    setInsights(scanDatasetInsights(records));
    setActiveFiles(files);
    setReadinessScore(readiness);
    setAnswersHistory([]);
    setAskExchanges([]);
    setSessionDeleted(false);
    setSessionMinutesRemaining(45);
  };

  const importFileContent = (fileName: string, fileSize: number, contentString: string): ParseResult => {
    const parseResult = parseSpreadsheetInBrowser(contentString, fileName);

    if (parseResult.records.length > 0) {
      setStudents(parseResult.records);
      setInsights(scanDatasetInsights(parseResult.records));
      setAskExchanges([]);
      setActiveFiles([
        {
          id: `file-${Date.now()}`,
          name: fileName,
          size: fileSize,
          uploadedAt: "Just now",
          rowCount: parseResult.records.length,
          columns: parseResult.headers,
          status: "ready",
        },
      ]);
      setReadinessScore(parseResult.readinessScore);
      setSessionDeleted(false);
    }

    return parseResult;
  };

  return (
    <SessionDataContext.Provider
      value={{
        students,
        activeFiles,
        insights,
        readinessScore,
        sessionMinutesRemaining,
        sessionDeleted,
        answersHistory,
        askExchanges,
        prefilledQuery,
        prefilledReportTemplate,
        activeModalStudentIds,
        activeModalTitle,
        setPrefilledQuery,
        setPrefilledReportTemplate,
        addAnswer,
        clearAnswersHistory,
        addAskExchange,
        resetAskConversation,
        openStudentModal,
        closeStudentModal,
        deleteSessionDataNow,
        loadSampleDataset,
        importParsedData,
        commitSanitizedDataset,
        importFileContent,
      }}
    >
      {children}
    </SessionDataContext.Provider>
  );
}

export function useSessionData() {
  const context = useContext(SessionDataContext);
  if (!context) {
    throw new Error("useSessionData must be used within a SessionDataProvider");
  }
  return context;
}
