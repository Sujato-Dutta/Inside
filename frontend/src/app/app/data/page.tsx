"use client";
import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IssueResolution, resolveQualityIssues, stageSchoolFiles, StagedDataset } from "@/lib/engine/secure-ingestion";
import { AlertTriangle, CheckCircle2, Database, Download, FileCheck, FileSpreadsheet, Lock, RefreshCw, ShieldCheck, Trash2, Upload, Wrench } from "lucide-react";

const BASE_OPTIONS = [100, 80, 60, 50, 40];

export default function DataHubPage() {
  const { activeFiles, students, deleteSessionDataNow, commitSanitizedDataset } = useSessionData();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [staged, setStaged] = useState<StagedDataset | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, IssueResolution>>({});
  const [repairOpen, setRepairOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(() => (staged?.files || activeFiles).reduce((sum, file) => sum + file.size, 0), [staged, activeFiles]);
  const processFiles = async (files: File[]) => {
    if (!files.length) return;
    setProcessing(true); setError("");
    try {
      const result = await stageSchoolFiles(files);
      setStaged(result);
      setResolutions(Object.fromEntries(result.issues.map((issue) => [issue.id, { action: issue.action }])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "These files could not be read.");
    } finally { setProcessing(false); }
  };
  const commit = () => {
    if (!staged) return;
    const records = resolveQualityIssues(staged, resolutions);
    commitSanitizedDataset(staged.files.map((file) => ({ ...file, status: "ready" })), records, staged.readinessScore);
    setRepairOpen(false); router.push("/app");
  };
  const requestCommit = () => staged && (staged.issues.length ? setRepairOpen(true) : commit());
  const downloadAudit = () => {
    if (!staged) return;
    const lines = ["Inside Data Hygiene Diagnostic Log", "All processing completed client-side in volatile browser memory.", "",
      ...staged.auditLog.map((e) => [e.sourceFile, e.studentRef, e.action, e.detail].join(",")),
      ...staged.issues.map((e) => [e.sourceFile, e.studentRef, e.issue, e.observed, resolutions[e.id]?.action || e.action].join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "inside_data_hygiene_log.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  const files = staged?.files || activeFiles;
  const validRecords = staged?.records.length ?? students.length;
  const unmapped = staged?.mappings.filter((mapping) => mapping.mappedTo === "ignore").length ?? 0;
  const healthStats: Array<{
    label: string;
    value: number;
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    { label: "Valid pupil records", value: validRecords, Icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50" },
    { label: "Repaired cell anomalies", value: staged?.repairedCells || 0, Icon: Wrench, color: "text-amber-700 bg-amber-50" },
    { label: "Unmapped / dropped", value: unmapped + (staged?.droppedRows || 0), Icon: AlertTriangle, color: "text-red-700 bg-red-50" },
  ];

  return (
    <div className="space-y-7 pb-16">
      <input ref={inputRef} type="file" multiple accept=".csv,.tsv,.xlsx" className="hidden" onChange={(e) => processFiles(Array.from(e.target.files || []))} />
      <div className="flex flex-col gap-4 border-b border-[#E3DED4] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-600"><Database className="h-3.5 w-3.5" />Secure ingestion & hygiene control room</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Data Hub</h1>
          <p className="mt-1 max-w-2xl text-[14px] text-[#5C5852]">Join MIS, marks, SEND, and attendance files by pupil reference. Nothing is uploaded.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={downloadAudit} disabled={!staged} icon={<Download className="h-4 w-4" />}>Download hygiene log</Button>
      </div>
      <div onDragEnter={(e) => { e.preventDefault(); setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
        className={"rounded-3xl border-2 border-dashed p-8 text-center transition " + (dragging ? "border-orange-500 bg-orange-50" : "border-[#D6D0C4] bg-white")}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600"><Upload className="h-5 w-5" /></div>
        <h2 className="mt-4 text-lg font-extrabold">Drop all source files together</h2>
        <p className="mx-auto mt-1 max-w-xl text-[13px] text-[#5C5852]">CSV, TSV, and XLSX from SIMS, iSAMS, Bromcom, or Engage. Files are read with the browser FileReader API only.</p>
        <Button className="mt-5" variant="primary" onClick={() => inputRef.current?.click()} disabled={processing} icon={<FileSpreadsheet className="h-4 w-4" />}>{processing ? "Validating in memory..." : "Choose multiple files"}</Button>
        {error && <p className="mt-3 text-[13px] font-semibold text-red-700">{error}</p>}
      </div>
      {files.length > 0 && <div className="rounded-3xl border border-[#E3DED4] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Loaded source files</p>
            <div className="mt-2 flex flex-wrap gap-2">{files.map((file) => <span key={file.id} className="inline-flex items-center gap-2 rounded-xl border border-[#E3DED4] bg-[#F9F6F0] px-3 py-2 text-[12px] font-semibold"><FileCheck className="h-4 w-4 text-emerald-700" />{file.name} | {file.rowCount} rows</span>)}</div>
            <p className="mt-2 text-[12px] text-[#5C5852]">{(totalSize / 1024).toFixed(1)} KB held in volatile RAM</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} icon={<RefreshCw className="h-4 w-4" />}>Replace source files</Button>
            <Button variant="outline" size="sm" onClick={() => setPurgeOpen(true)} className="border-red-200 text-red-700 hover:bg-red-50" icon={<Trash2 className="h-4 w-4" />}>Purge RAM immediately</Button></div>
        </div>
      </div>}
      <div className="grid gap-4 sm:grid-cols-3">{healthStats.map(({ label, value, Icon, color }) => <div key={label} className="rounded-2xl border border-[#E3DED4] bg-white p-5 shadow-sm">
        <div className={"flex h-9 w-9 items-center justify-center rounded-xl " + color}><Icon className="h-4 w-4" /></div>
        <div className="mt-4 text-2xl font-extrabold">{String(value)}</div><div className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">{label}</div>
      </div>)}</div>
      {staged && <div className="overflow-hidden rounded-3xl border border-[#E3DED4] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#E3DED4] bg-[#F9F6F0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-extrabold">Automated schema mapping</h2><p className="text-[12px] text-[#5C5852]">Review score bases before the commit gateway.</p></div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">{staged.readinessScore}% ready</span>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[12px]"><thead className="border-b border-[#E3DED4] text-[#5C5852]"><tr><th className="p-3">Target key</th><th className="p-3">Detected MIS header</th><th className="p-3">Validation</th><th className="p-3">Score base</th><th className="p-3">In-memory normalization</th></tr></thead>
          <tbody>{staged.mappings.map((mapping, index) => <tr key={mapping.sourceFile + mapping.original + index} className="border-b border-[#E3DED4] last:border-0">
            <td className="p-3 font-bold">{mapping.mappedTo}</td><td className="p-3"><span className="block font-semibold">{mapping.original}</span><span className="text-[10px] text-[#8C877E]">{mapping.sourceFile}</span></td>
            <td className="p-3"><span className={mapping.confidence >= 80 ? "text-emerald-700" : "text-red-700"}>{mapping.confidence >= 80 ? "Verified" : "Unmapped"} | {mapping.confidence}%</span></td>
            <td className="p-3">{mapping.scoreBase ? <select aria-label={"Maximum mark for " + mapping.original} value={mapping.scoreBase}
              onChange={(e) => setStaged({ ...staged, mappings: staged.mappings.map((item, i) => i === index ? { ...item, scoreBase: Number(e.target.value) } : item) })}
              className="rounded-lg border border-[#E3DED4] bg-white px-2 py-1.5 font-semibold">{Array.from(new Set([mapping.scoreBase, ...BASE_OPTIONS])).map((base) => <option key={base} value={base}>{base === 100 ? "100 (Default %)" : base}</option>)}</select> : "-"}</td>
            <td className="p-3 text-[#5C5852]">{mapping.normalization}</td></tr>)}</tbody>
        </table></div>
        <div className="flex flex-col gap-3 border-t border-[#E3DED4] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] font-semibold text-emerald-800"><Lock className="mr-1 inline h-3.5 w-3.5" />FileReader API reads client-side only | Zero data touches disk or cloud DB</p>
          <Button variant="primary" onClick={requestCommit} icon={<CheckCircle2 className="h-4 w-4" />}>Commit Dataset to Executive Memory</Button>
        </div>
      </div>}
      <Modal isOpen={repairOpen} onClose={() => setRepairOpen(false)} title="Resolve data quality exceptions">
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">{staged?.issues.map((issue) => <div key={issue.id} className="rounded-xl border border-[#E3DED4] p-3">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-bold">{issue.studentRef} | {issue.issue}</p><p className="text-[11px] text-[#5C5852]">{issue.sourceFile} | Observed: {issue.observed}{issue.maximum ? " | Max: " + issue.maximum : ""}</p></div>
            <select value={resolutions[issue.id]?.action || issue.action} onChange={(e) => setResolutions({ ...resolutions, [issue.id]: { action: e.target.value as IssueResolution["action"] } })} className="rounded-lg border border-[#E3DED4] px-2 py-1 text-[12px] font-semibold">
              <option value="cap">Cap to max</option><option value="adjust-base">Adjust base mark</option><option value="override">Manual override</option><option value="exclude">Exclude row</option>
            </select></div>
          {["adjust-base", "override"].includes(resolutions[issue.id]?.action) && <input type="number" aria-label="Resolution value" placeholder={resolutions[issue.id]?.action === "adjust-base" ? "New base mark" : "Corrected value"}
            onChange={(e) => setResolutions({ ...resolutions, [issue.id]: { ...resolutions[issue.id], value: Number(e.target.value) } })} className="mt-2 w-full rounded-lg border border-[#E3DED4] px-3 py-2 text-[12px]" />}
        </div>)}</div>
        <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => setRepairOpen(false)}>Review mapping</Button><Button variant="primary" onClick={commit}>Apply repairs & commit</Button></div>
      </Modal>
      <Modal isOpen={purgeOpen} onClose={() => setPurgeOpen(false)} title="Purge volatile session memory?">
        <p className="text-[14px] text-[#5C5852]">This immediately removes loaded records, answers, and file metadata from the active browser session.</p>
        <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setPurgeOpen(false)}>Cancel</Button><Button variant="primary" className="bg-red-600" onClick={() => { deleteSessionDataNow(); setStaged(null); setPurgeOpen(false); }}>Purge all data</Button></div>
      </Modal>
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[12px] text-emerald-900"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>School-owned data:</strong> raw identifiers remain only in volatile browser memory for local cross-sheet joins. Displayed references are SHA-256 pseudonyms, and no pupil row is sent to an AI service.</p></div>
    </div>
  );
}
