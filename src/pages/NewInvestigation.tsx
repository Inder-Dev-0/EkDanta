import React, { useRef, useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  LoaderCircle, 
  ArrowRight, 
  ShieldAlert, 
  Database, 
  FileCode, 
  Hash, 
  Cpu, 
  Terminal,
  FileCheck
} from "lucide-react";
import type { Page } from "../data";

interface IngestedFile {
  name: string;
  size: string;
  hash: string;
  type: string;
  source: string;
  status: "PARSED" | "INGESTING" | "PENDING";
}

export function NewInvestigation({ navigate }: { navigate: (p: Page) => void }) {
  const [files, setFiles] = useState<IngestedFile[]>([
    {
      name: "midnight_leak_auth_audit.log",
      size: "4.8 MB",
      hash: "8f4a21e7d3c901b5a2e4f6d8c0b2...",
      type: "LOG (Syslog RFC5424)",
      source: "ActiveDirectory & Linux Auditd",
      status: "PARSED"
    },
    {
      name: "PROJECT_ORION_INTERNAL_SPEC.pdf",
      size: "84.2 MB",
      hash: "e3b0c44298fc1c149afbf4c8996f...",
      type: "PDF (Classified Spec)",
      source: "Server-04 Vault Store",
      status: "PARSED"
    }
  ]);

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pipelineSteps = [
    { label: "DOCUMENT LOADED", sub: "Integrity verified via SHA-256" },
    { label: "TEXT EXTRACTION", sub: "Unstructured logs & text parsing" },
    { label: "ENTITY DETECTION", sub: "Identifying accounts, IPs, assets" },
    { label: "EVENT EXTRACTION", sub: "Syscall & authentication triage" },
    { label: "TIMESTAMP NORMALIZATION", sub: "Aligning UTC event sequences" },
    { label: "RELATIONSHIP BUILDING", sub: "Graph node adjacency calculation" },
    { label: "TIMELINE RECONSTRUCTION", sub: "Chronological incident assembly" },
    { label: "AI ANALYSIS", sub: "Evidence grounding & inference engine" }
  ];

  const handleStartAnalysis = () => {
    setRunning(true);
    setProgress(0);
    setCurrentStepIdx(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      const pct = Math.min(Math.round((current / pipelineSteps.length) * 100), 100);
      setProgress(pct);
      setCurrentStepIdx(current - 1);

      if (current >= pipelineSteps.length) {
        clearInterval(interval);
        setRunning(false);
        setProgress(100);
      }
    }, 450);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      setFiles((prev) => [
        {
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
          hash: "a49b29cf12089eb1287e028b...",
          type: f.name.split(".").pop()?.toUpperCase() || "BINARY",
          source: "Investigator Drop",
          status: "PENDING"
        },
        ...prev
      ]);
    }
  };

  return (
    <main className="page new-page cyber-workstation">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">EVIDENCE INGESTION WORKSTATION</span>
        <h1>CASE INITIALIZATION</h1>
        <p>
          Ingest raw, scattered case material (logs, PCAPs, forensic memory dumps, badge access logs).
          EKDANTA extracts identities, establishes cryptographic custody, and synthesizes the crime scene.
        </p>
      </div>

      <div className="ingestion-grid">
        {/* Left: Drop Area & Active Ingested Files */}
        <div className="ingestion-left">
          <div
            className="evidence-drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".docx,.pdf,.txt,.log,.csv,.json"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const f = e.target.files[0];
                  setFiles((prev) => [
                    {
                      name: f.name,
                      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                      hash: "7c12f089b3a4e98d1a498b...",
                      type: f.name.split(".").pop()?.toUpperCase() || "LOG",
                      source: "Investigator Upload",
                      status: "PENDING"
                    },
                    ...prev
                  ]);
                }
              }}
            />
            <div className="drop-icon-wrapper">
              <UploadCloud size={32} />
            </div>
            <h3>DROP DIGITAL EVIDENCE</h3>
            <p className="supported-formats">SUPPORTED: DOCX &bull; PDF &bull; TXT &bull; LOG &bull; CSV &bull; JSON</p>
            <button className="primary-action-btn" type="button">
              <span>SELECT EVIDENCE FILES</span>
            </button>
          </div>

          {/* Section 12: Ingested File Metadata Display */}
          <div className="file-metadata-panel">
            <div className="panel-subhead">
              <span className="font-mono text-cyan text-xs">CUSTODIAL EVIDENCE REGISTRY</span>
              <span className="status-badge guarded font-mono">[ SHA-256 SIGNED ]</span>
            </div>

            <div className="table-responsive">
              <table className="forensic-table">
                <thead>
                  <tr>
                    <th>FILE NAME</th>
                    <th>SIZE</th>
                    <th>HASH (SHA-256)</th>
                    <th>TYPE</th>
                    <th>SOURCE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => (
                    <tr key={i}>
                      <td>
                        <div className="file-name-cell">
                          <FileText size={14} className="text-cyan" />
                          <b className="font-mono">{file.name}</b>
                        </div>
                      </td>
                      <td className="font-mono">{file.size}</td>
                      <td className="font-mono text-muted text-xs">{file.hash}</td>
                      <td>
                        <span className="type-tag">{file.type}</span>
                      </td>
                      <td className="text-secondary">{file.source}</td>
                      <td>
                        <span className={`status-pill ${file.status.toLowerCase()}`}>
                          {file.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Technical Extraction Pipeline */}
        <div className="ingestion-right">
          <div className="pipeline-card">
            <div className="pipeline-header">
              <div>
                <span className="technical-kicker">ANALYSIS ENGINE</span>
                <h3>EVIDENCE INGESTION PIPELINE</h3>
              </div>
              {running && <LoaderCircle className="spin text-cyan" size={18} />}
              {progress === 100 && <span className="status-badge high">[ RECONSTRUCTION COMPLETE ]</span>}
            </div>

            {/* Glowing progress bar */}
            <div className="pipeline-progress-bar">
              <div
                className="pipeline-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step-by-step pipeline sequence from Section 12 */}
            <div className="pipeline-steps-list">
              {pipelineSteps.map((step, idx) => {
                const isDone = progress >= ((idx + 1) / pipelineSteps.length) * 100 || (progress === 100);
                const isCurrent = running && currentStepIdx === idx;

                return (
                  <div key={step.label} className={`pipeline-step-item ${isDone ? "done" : isCurrent ? "active" : ""}`}>
                    <div className="step-indicator">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-cyan" />
                      ) : isCurrent ? (
                        <span className="current-dot" />
                      ) : (
                        <span className="pending-dot" />
                      )}
                      {idx < pipelineSteps.length - 1 && <span className="step-connector-line" />}
                    </div>

                    <div className="step-copy">
                      <b>{step.label}</b>
                      <small>{step.sub}</small>
                    </div>

                    {isCurrent && <span className="step-badge-processing">PROCESSING...</span>}
                    {isDone && <span className="font-mono text-cyan text-xs">OK</span>}
                  </div>
                );
              })}
            </div>

            {/* Ingestion Actions */}
            <div className="pipeline-actions">
              <button
                className="primary-action-btn full"
                disabled={running || progress === 100}
                onClick={handleStartAnalysis}
              >
                {running ? (
                  <>
                    <LoaderCircle className="spin" size={16} />
                    <span>SYNTHESIZING EVIDENCE ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <span>INITIALIZE RECONSTRUCTION PIPELINE</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {progress === 100 && (
                <button
                  className="open-dashboard-btn"
                  onClick={() => navigate("dashboard")}
                >
                  <span>LAUNCH INVESTIGATION DASHBOARD</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
