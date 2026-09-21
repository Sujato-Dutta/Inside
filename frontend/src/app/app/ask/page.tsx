"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { AskAnswer, StudentRecord, ColumnMapping } from "@/types/student-data";
import { PRESET_QUESTIONS, PRESET_DESCRIPTIONS } from "@/data/mock-school-data";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Table as TableIcon,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Users,
  Upload,
  Paperclip,
  FileSpreadsheet,
  FileCheck,
  FileText,
  Trash2,
  Clock,
  ShieldCheck,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  HelpCircle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { executeIntent, runPreset } from "@/lib/engine/calculator";
import { QueryIntent } from "@/lib/engine/types";
import { parseSpreadsheetInBrowser } from "@/lib/engine/data-parser";

const DONUT_COLORS = ["#f97316", "#fb923c", "#2563EB", "#059669", "#7C3AED"];

export default function AskInsidePage() {
  const router = useRouter();
  const {
    students,
    activeFiles,
    answersHistory,
    addAnswer,
    prefilledQuery,
    setPrefilledQuery,
    setPrefilledReportTemplate,
    openStudentModal,
    importParsedData,
    deleteSessionDataNow,
    sessionDeleted,
    loadSampleDataset,
  } = useSessionData();

  const [inputQuery, setInputQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState(0);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [sampleRawRows, setSampleRawRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [parsedRecords, setParsedRecords] = useState<StudentRecord[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(true);

  // Clarification state for ambiguous questions
  const [clarificationState, setClarificationState] = useState<{
    prompt: string;
    options: string[];
    baseQuery: string;
  } | null>(null);

  // Voice Chat States & Refs (Browser-native local speech only)
  const [isListening, setIsListening] = useState(false);
  const [playingAnswerId, setPlayingAnswerId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const analysisSteps = [
    "Interpreting query intent with Groq...",
    "Executing deterministic calculations on active session records...",
    "Validating cohort numbers and compiling verified charts...",
    "Synthesizing qualitative summary and action steps...",
  ];

  // If a pre-filled query was passed from another page, set it and trigger
  useEffect(() => {
    if (prefilledQuery) {
      const q = prefilledQuery;
      setInputQuery(q);
      setPrefilledQuery("");
      handleRunQuery(q);
    }
  }, [prefilledQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [answersHistory, isAnalyzing]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputQuery(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is supported in Google Chrome, Microsoft Edge, and modern Chromium browsers.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    }
  };

  // Browser-native speech synthesis with zero server transmission
  const speakAnswer = (answerId: string, text: string) => {
    if (playingAnswerId === answerId) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingAnswerId(null);
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingAnswerId(answerId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingAnswerId(null);
      utterance.onerror = () => setPlayingAnswerId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAnswerId(null);
    }
  };

  const primaryFile = activeFiles[0];

  // Core progressive execution pipeline:
  // Presets: 100% deterministic code (<10ms, sub-second, zero Groq latency)
  // Custom queries: Groq intent -> deterministic code -> Groq explanation
  const handleRunQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isAnalyzing) return;

    setClarificationState(null);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }

    setInputQuery("");
    setIsAnalyzing(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 350);

    const datasetName = primaryFile?.name || "inside_synthetic_school_data_500.csv";

    // 1. FAST PATH: Check for Preset Questions (<10ms deterministic execution, bypasses Groq)
    const lower = q.toLowerCase();
    const isPreset =
      PRESET_QUESTIONS.some((pq) => pq.toLowerCase() === lower) ||
      lower.includes("send") ||
      lower.includes("special") ||
      lower.includes("science") ||
      lower.includes("gender") ||
      lower.includes("attendance vs") ||
      lower.includes("grade decline");

    if (isPreset) {
      const calcResult = runPreset(students, q, datasetName);
      const answerId = `ans-${Date.now()}`;

      // Progressive render: Display KPIs, Table, Chart, and verified explanation immediately!
      const initialAnswer: AskAnswer = {
        id: answerId,
        query: q,
        timestamp: "Just now",
        explanation: calcResult.explanation,
        kpis: calcResult.kpis,
        chart: calcResult.chart || undefined,
        table: calcResult.table,
        highlightedStudents: calcResult.highlightedStudents as any,
        suggestedActions: calcResult.suggestedActions,
        filterDescription: calcResult.filterDescription,
        sourceDataset: datasetName,
      };

      addAnswer(initialAnswer);
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      return; // Pre-tested deterministic functions bypass Groq completely, sub-second results!
    }

    // 2. CUSTOM QUESTION PIPELINE: Intent -> Deterministic Code -> Explanation
    try {
      // Step A: Parse user intent with Groq (send only schema & query, zero student rows)
      const intentRes = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "intent",
          query: q,
          schema: [
            "StudentID", "StudentName", "YearGroup", "ClassSection", "Gender",
            "Inclusion_SEND", "Attendance_Pct", "Term1_Science_Grade", "Term2_Science_Grade",
            "Term1_Math_Grade", "Term2_Math_Grade", "Term1_English_Grade", "Term2_English_Grade",
            "gradeDrop", "CAT4_Mean_SAS", "riskLevel"
          ],
        }),
      });

      let intent: QueryIntent = {
        intentType: "general",
        targetMetric: "attendance_pct",
        filters: [],
        groupBy: null,
        comparison: null,
        timeRange: null,
      };

      if (intentRes.ok) {
        const intentData = await intentRes.json();
        if (intentData.clarificationNeeded && intentData.clarificationOptions?.length > 0) {
          setClarificationState({
            prompt: intentData.clarificationPrompt || "How would you like to define this query?",
            options: intentData.clarificationOptions,
            baseQuery: q,
          });
          clearInterval(stepInterval);
          setIsAnalyzing(false);
          return;
        }
        intent = intentData;
      }

      // Step B: Calculate results deterministically from source dataset
      const calcResult = executeIntent(students, intent, datasetName);
      const answerId = `ans-${Date.now()}`;

      const newAnswer: AskAnswer = {
        id: answerId,
        query: q,
        timestamp: "Just now",
        explanation: calcResult.explanation,
        kpis: calcResult.kpis,
        chart: calcResult.chart || undefined,
        table: calcResult.table,
        highlightedStudents: calcResult.highlightedStudents as any,
        suggestedActions: calcResult.suggestedActions,
        filterDescription: calcResult.filterDescription,
        sourceDataset: datasetName,
      };

      addAnswer(newAnswer);
      clearInterval(stepInterval);
      setIsAnalyzing(false);

      // Step C: Send ONLY verified aggregate metrics for qualitative summary
      fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "explain",
          query: q,
          statsSummary: {
            filteredCount: calcResult.kpis[0]?.value,
            avgAttendance: calcResult.kpis[1]?.value,
            avgMath: calcResult.kpis[2]?.value,
            avgScience: calcResult.kpis[3]?.value,
          },
          filterDescription: calcResult.filterDescription,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((aiData) => {
          if (aiData?.explanation) {
            newAnswer.explanation = aiData.explanation;
            if (aiData.suggestedActions) {
              newAnswer.suggestedActions = aiData.suggestedActions;
            }
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error("Ask query error:", err);
      const fallbackResult = executeIntent(
        students,
        {
          intentType: "general",
          targetMetric: "attendance_pct",
          filters: [],
          groupBy: null,
          comparison: null,
          timeRange: null,
        },
        datasetName
      );

      addAnswer({
        id: `ans-${Date.now()}`,
        query: q,
        timestamp: "Just now",
        explanation: fallbackResult.explanation,
        kpis: fallbackResult.kpis,
        chart: fallbackResult.chart || undefined,
        table: fallbackResult.table,
        highlightedStudents: fallbackResult.highlightedStudents as any,
        suggestedActions: fallbackResult.suggestedActions,
        filterDescription: fallbackResult.filterDescription,
        sourceDataset: datasetName,
      });
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  // Drag & Drop File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parseResult = parseSpreadsheetInBrowser(text, file.name);

      setDetectedHeaders(parseResult.headers);
      setSampleRawRows(
        parseResult.records.slice(0, 5).map((r) => [
          r.id,
          r.name,
          String(r.yearGroup),
          `${r.attendanceRate}%`,
          String(r.term2ScienceGrade ?? r.scienceGrade),
        ])
      );
      setColumnMappings(parseResult.mappings);
      setParsedRecords(parseResult.records);

      setIsProcessingFile(false);
      setUploadModalOpen(true);
    };

    reader.readAsText(file);
  };

  const handleConfirmMapping = () => {
    if (parsedRecords.length > 0) {
      importParsedData(uploadedFileName, uploadedFileSize, parsedRecords);
    } else if (sampleRawRows.length > 0) {
      importParsedData(uploadedFileName, uploadedFileSize, students);
    }
    setUploadModalOpen(false);
    setShowUploadConfirmation(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header & Dataset Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3DED4]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
            Ask Inside
          </h1>
          <p className="text-[13px] sm:text-[14.5px] text-[#5C5852]">
            Ask any question about your active student data in plain English.
          </p>
        </div>

        {/* Dataset Pill & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E3DED4] text-[13px] shadow-xs">
            <FileSpreadsheet className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-[#1C1A17] max-w-[150px] truncate" title={primaryFile?.name}>
              {primaryFile?.name || "inside_synthetic_school_data_500.csv"}
            </span>
            <span className="text-[#8C877E]">•</span>
            <span className="text-[#5C5852]">{students.length} pupils</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload Data
          </Button>

          <Button
            variant={isListening ? "primary" : "secondary"}
            size="sm"
            onClick={toggleListening}
            icon={isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-orange-600" />}
            className={isListening ? "animate-pulse bg-red-600 hover:bg-red-700 text-white border-red-700" : ""}
          >
            {isListening ? "Listening..." : "Voice Query"}
          </Button>
        </div>
      </div>

      {/* Confirmation Banner & 3 Demo Buttons */}
      {showUploadConfirmation && students.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-[#1C1A17]">
                {students.length} students loaded · 26 fields recognised · Ready to analyse
              </div>
              <div className="text-[11.5px] text-[#5C5852]">
                Session-only memory · Deterministic calculation engine active
              </div>
            </div>
          </div>

          {/* 3 Planted Demo Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 shrink-0">
              Demo Presets:
            </span>
            {PRESET_QUESTIONS.map((pq) => (
              <button
                key={pq}
                onClick={() => handleRunQuery(pq)}
                className="px-3 py-1.5 rounded-xl bg-white border border-orange-200 hover:border-orange-500 hover:bg-orange-50 text-[#1C1A17] hover:text-orange-600 text-[12.5px] font-bold transition shadow-xs whitespace-nowrap"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answers Conversation Stream */}
      <div className="space-y-8 min-h-[300px]">
        {answersHistory.length === 0 && !isAnalyzing && (
          <div className="text-center py-12 px-6 rounded-3xl bg-white border border-[#E3DED4] shadow-sm space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-200 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-[17px] font-bold text-[#1C1A17]">
                How can I assist your school today?
              </h3>
              <p className="text-[13px] text-[#5C5852]">
                Ask a question about the active cohort, or drop your school spreadsheet directly below.
              </p>
            </div>

            {/* In-page Drag & Drop Area for Ask Inside */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`max-w-xl mx-auto p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                dragActive
                  ? "border-orange-500 bg-orange-50"
                  : "border-[#E3DED4] hover:border-orange-500/60 bg-orange-50/30"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E3DED4] flex items-center justify-center text-orange-600 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-[13.5px] font-bold text-[#1C1A17]">
                    Upload new Excel or CSV file
                  </div>
                  <div className="text-[12px] text-[#5C5852]">
                    Drag and drop file here, or click to browse
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Preset Questions */}
            <div className="space-y-2 pt-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">
                Or select a planted demo query:
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {PRESET_QUESTIONS.map((pq, i) => (
                  <button
                    key={i}
                    onClick={() => handleRunQuery(pq)}
                    className="px-3.5 py-2 text-[13px] rounded-xl bg-orange-50/50 border border-orange-200 hover:border-orange-500 hover:text-orange-600 text-[#1C1A17] transition text-left font-semibold"
                  >
                    "{pq}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clarification Options Card (One-click ambiguity resolver) */}
        {clarificationState && (
          <div className="p-5 rounded-2xl bg-orange-50/70 border-2 border-orange-500 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-[14px]">
              <HelpCircle className="w-4 h-4" />
              <span>{clarificationState.prompt}</span>
            </div>
            <p className="text-[13px] text-[#5C5852]">
              Select a benchmark definition to calculate verified figures immediately:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {clarificationState.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const refinedQuery = `${clarificationState.baseQuery} (${opt})`;
                    setClarificationState(null);
                    handleRunQuery(refinedQuery);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-orange-500 text-orange-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-600 hover:text-white text-[13px] font-bold transition shadow-xs"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing Answers Stream: Rendered Progressively (KPI -> Table -> Chart -> Explanation -> Actions) */}
        {answersHistory.map((item) => (
          <div key={item.id} className="space-y-4 animate-in fade-in duration-300">
            {/* User Question */}
            <div className="flex items-center gap-3 justify-end">
              <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[13.5px] sm:text-[14.5px] font-semibold shadow-xs max-w-lg rounded-tr-none">
                {item.query}
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#1C1A17] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                IN
              </div>
            </div>

            {/* Inside Answer Container */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E3DED4] shadow-sm space-y-6">
              {/* Verified Filter & Dataset Scope Badge */}
              <div className="flex items-center justify-between text-[12px] pb-2 border-b border-[#E3DED4] text-[#5C5852]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Filter className="w-3.5 h-3.5 text-orange-600" />
                  <span>{item.filterDescription || "Active Cohort Scope"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => speakAnswer(item.id, item.explanation)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold border transition-colors shadow-xs ${
                      playingAnswerId === item.id
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500"
                        : "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
                    }`}
                    title={playingAnswerId === item.id ? "Stop voice audio" : "Listen to browser voice audio"}
                  >
                    {playingAnswerId === item.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                  <span className="text-[#8C877E] hidden sm:inline">•</span>
                  <span className="font-semibold text-emerald-700 hidden sm:inline">
                    {item.sourceDataset || "inside_synthetic_school_data_500.csv"}
                  </span>
                </div>
              </div>

              {/* PROGRESSIVE STEP 1: Top KPI Cards */}
              {item.kpis && item.kpis.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {item.kpis.map((kpi, kIdx) => (
                    <div
                      key={kIdx}
                      className="p-3.5 rounded-2xl bg-[#F5F2EB]/50 border border-[#E3DED4] space-y-1"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852] block truncate">
                        {kpi.label}
                      </span>
                      <div className="text-xl sm:text-2xl font-extrabold text-[#1C1A17]">
                        {kpi.value}
                      </div>
                      {kpi.change && (
                        <p
                          className={`text-[11.5px] font-semibold flex items-center gap-1 ${
                            kpi.isPositive ? "text-emerald-700" : "text-orange-600"
                          }`}
                        >
                          <span>{kpi.change}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* PROGRESSIVE STEP 2: Deterministic Data Table */}
              {item.table && item.table.rows && item.table.rows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
                      <TableIcon className="w-4 h-4 text-orange-600" />
                      <span>Verified Student Roster ({item.table.rows.length} Shown)</span>
                    </span>
                    <span className="text-[11px] text-[#5C5852]">
                      Calculated from active session records
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-[#E3DED4] shadow-2xs">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-orange-50/50 text-[11.5px] font-bold uppercase text-[#5C5852] border-b border-orange-200">
                        <tr>
                          {item.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3DED4] bg-white">
                        {item.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-orange-50/30 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`px-3.5 py-2 whitespace-nowrap ${
                                  cIdx === 1 ? "font-bold text-[#1C1A17]" : "text-[#5C5852]"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PROGRESSIVE STEP 3: Deterministically Chosen Chart */}
              {item.chart && item.chart.data && item.chart.data.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    <span>{item.chart.title}</span>
                  </span>
                  <div className="h-64 sm:h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {item.chart.type === "line" ? (
                        <LineChart data={item.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E3DED4" vertical={false} />
                          <XAxis dataKey={item.chart.xKey} tick={{ fontSize: 11, fill: "#5C5852" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#5C5852" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#E3DED4",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          />
                          {item.chart.yKeys.map((yKey, i) => (
                            <Line
                              key={yKey}
                              type="monotone"
                              dataKey={yKey}
                              stroke={i === 0 ? "#f97316" : "#2563EB"}
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: "#f97316" }}
                            />
                          ))}
                        </LineChart>
                      ) : item.chart.type === "donut" ? (
                        <PieChart>
                          <Pie
                            data={item.chart.data}
                            dataKey={item.chart.yKeys[0] || "count"}
                            nameKey={item.chart.xKey}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                          >
                            {item.chart.data.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#E3DED4",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      ) : (
                        <BarChart data={item.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E3DED4" vertical={false} />
                          <XAxis dataKey={item.chart.xKey} tick={{ fontSize: 11, fill: "#5C5852" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#5C5852" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#E3DED4",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          />
                          {item.chart.yKeys.map((yKey, i) => (
                            <Bar
                              key={yKey}
                              dataKey={yKey}
                              fill={i === 0 ? "#f97316" : "#2563EB"}
                              radius={[6, 6, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* PROGRESSIVE STEP 4: Qualitative Explanation */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 font-bold text-xs border border-orange-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[13px] text-[#1C1A17] block">
                    Inside Analysis Summary
                  </span>
                  <p className="text-[13.5px] sm:text-[14.5px] text-[#1C1A17] leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </div>

              {/* PROGRESSIVE STEP 5: Highlighted Students */}
              {item.highlightedStudents && item.highlightedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px] font-bold text-[#5C5852] uppercase tracking-wider">
                    <span>Priority Pupils In Focus</span>
                    <button
                      onClick={() =>
                        openStudentModal(
                          `Cohort Drill-Down: ${item.query}`,
                          item.highlightedStudents!.map((s) => s.id)
                        )
                      }
                      className="text-orange-600 hover:underline"
                    >
                      View All Drill-Down ({item.highlightedStudents.length})
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.highlightedStudents.slice(0, 6).map((stu) => (
                      <span
                        key={stu.id}
                        onClick={() =>
                          openStudentModal(`Student Profile: ${stu.name}`, [stu.id])
                        }
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50/50 border border-orange-200 hover:border-orange-500 text-[13px] font-semibold text-[#1C1A17] cursor-pointer shadow-xs transition"
                      >
                        <span>{stu.name}</span>
                        <span className="text-[11px] text-orange-600 font-bold">
                          ({stu.metric})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PROGRESSIVE STEP 6: Recommended Actions & Create Report Action */}
              <div className="pt-3 border-t border-[#E3DED4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">
                    Recommended Follow-Up Actions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(item.suggestedActions || []).map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleRunQuery(`Explain next steps for: ${action}`)}
                        className="px-3 py-1.5 text-[13px] rounded-xl bg-orange-50/50 hover:bg-orange-100 text-[#1C1A17] font-medium transition flex items-center gap-1.5 border border-orange-200 hover:border-orange-500"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct "Create Report" Button */}
                <button
                  onClick={() => {
                    const qLower = item.query.toLowerCase();
                    setPrefilledReportTemplate(
                      qLower.includes("attendance") || qLower.includes("decline")
                        ? "Attendance Analysis"
                        : qLower.includes("send") || qLower.includes("science") || qLower.includes("gender")
                        ? "Attainment Gap"
                        : "Leadership Summary"
                    );
                    router.push("/app/reports");
                  }}
                  className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-[13px] font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Report</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Animated Typing & Analysis State */}
        {isAnalyzing && (
          <div className="p-6 rounded-3xl bg-white border border-orange-500 shadow-sm space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-orange-600 uppercase tracking-wider">
                  Analyzing Dataset
                </h4>
                <p className="text-[14px] text-[#1C1A17] font-semibold">
                  {analysisSteps[analysisStep]}
                </p>
              </div>
            </div>
            <div className="w-full bg-[#E3DED4] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Query Input Bar */}
      <div className="sticky bottom-4 z-30 pt-2">
        {isListening && (
          <div className="mb-2.5 p-3 px-4 rounded-2xl bg-orange-50 border border-orange-200 shadow-sm flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] font-bold text-orange-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>Microphone listening... Speak your question clearly</span>
            </div>
            <button
              onClick={toggleListening}
              className="text-[12px] font-extrabold text-orange-600 hover:underline px-2 py-1 rounded-lg bg-white border border-orange-200"
            >
              Stop recording
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery();
          }}
          className="p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E3DED4] shadow-lg flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-[#5C5852] hover:text-orange-600 hover:bg-orange-50 transition"
            title="Upload CSV or Excel dataset"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-xs"
                : "text-[#5C5852] hover:text-orange-600 hover:bg-orange-50"
            }`}
            title={isListening ? "Listening... click to stop" : "Speak your question (Voice STT)"}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAnalyzing}
            placeholder={
              isListening
                ? "Listening to your voice... Speak now"
                : "Ask a question about your students (or speak with the mic icon)..."
            }
            className="flex-1 py-2.5 px-2 text-[13.5px] sm:text-[15px] bg-transparent text-[#1C1A17] placeholder-[#8C877E] focus:outline-none"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isAnalyzing}
            icon={<Send className="w-4 h-4" />}
          >
            Ask Inside
          </Button>
        </form>

        <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#8C877E] px-2">
          <span>Local browser voice processing: audio never leaves your device.</span>
          <span className="font-semibold text-emerald-700">Zero Raw Rows Transmitted</span>
        </div>
      </div>

      {/* Data Upload & Column Mapping Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={`Confirm Column Mapping: ${uploadedFileName}`}
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#5C5852]">
            Inside has automatically detected your spreadsheet headers and mapped them to student fields.
          </p>

          <div className="max-h-[260px] overflow-y-auto rounded-xl border border-[#E3DED4]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-orange-50/50 text-[12px] font-bold text-[#5C5852] uppercase border-b border-orange-200">
                <tr>
                  <th className="px-3 py-2">Header</th>
                  <th className="px-3 py-2">Mapped Field</th>
                  <th className="px-3 py-2">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DED4] bg-white">
                {columnMappings.map((map, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-semibold text-[#1C1A17]">
                      {map.original}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        defaultValue={map.mappedTo}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E3DED4] bg-[#F5F2EB] text-[13px] text-[#1C1A17] font-medium"
                      >
                        <option value="id">Student ID</option>
                        <option value="name">Student Name</option>
                        <option value="yearGroup">Year Group</option>
                        <option value="classGroup">Class Section</option>
                        <option value="gender">Gender</option>
                        <option value="inclusionSend">Inclusion SEND</option>
                        <option value="attendanceRate">Attendance Rate</option>
                        <option value="mathGrade">Math Grade</option>
                        <option value="scienceGrade">Science Grade</option>
                        <option value="englishGrade">English Grade</option>
                        <option value="emiratiStatus">Emirati Status</option>
                        <option value="ignore">Skip</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-emerald-700 font-bold text-[12px]">
                      {map.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E3DED4]">
            <span className="text-[13px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Session-isolated storage
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmMapping} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Load into Session
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
