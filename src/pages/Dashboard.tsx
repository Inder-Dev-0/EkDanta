import React from "react";
import { 
  FileSearch, 
  Users, 
  Share2, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Clock3, 
  CheckCircle2, 
  BrainCircuit, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { activeCase, timeline, evidence } from "../data";
import { Graph } from "../components/Graph";

export function Dashboard() {
  return (
    <main className="page dashboard-page cyber-dashboard">
      {/* Top Command Center Header */}
      <div className="case-command-header">
        <div className="command-title-group">
          <div className="command-kicker-row">
            <span className="font-mono text-cyan font-bold">{activeCase.code}</span>
            <span className="divider">/</span>
            <span className="case-status-badge">[ {activeCase.status} ]</span>
            <span className="divider">/</span>
            <span className="font-mono text-muted text-xs">{activeCase.classification}</span>
          </div>
          <h1>{activeCase.title}</h1>
          <p className="case-desc">{activeCase.summary}</p>
        </div>

        <div className="command-actions">
          <button className="cyber-btn secondary" onClick={() => window.print()}>
            <Download size={14} />
            <span>EXPORT DOSSIER</span>
          </button>
          <div className="case-incident-window font-mono">
            <span>WINDOW:</span> {activeCase.incidentWindow}
          </div>
        </div>
      </div>

      {/* KPI Forensic Stat Strip */}
      <div className="forensic-stat-grid">
        <div className="stat-tile">
          <div className="stat-icon-wrapper">
            <FileSearch size={18} className="text-cyan" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono">47</b>
            <span className="stat-label">EVIDENCE ITEMS</span>
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-icon-wrapper">
            <Users size={18} className="text-blue" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono">12</b>
            <span className="stat-label">ENTITIES</span>
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-icon-wrapper">
            <Share2 size={18} className="text-purple" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono">8</b>
            <span className="stat-label">RELATIONSHIPS</span>
          </div>
        </div>

        <div className="stat-tile alert-highlight">
          <div className="stat-icon-wrapper">
            <ShieldAlert size={18} className="text-danger" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono text-danger">3</b>
            <span className="stat-label">PERSONS OF INTEREST</span>
          </div>
        </div>
      </div>

      {/* Main Area: Connection Graph with Corner Frame */}
      <div className="dashboard-graph-wrapper">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />
        <Graph />
      </div>

      {/* Bottom Forensic Panels Grid */}
      <div className="dashboard-bottom-grid">
        {/* Incident Timeline */}
        <section className="command-panel timeline-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Clock3 size={15} className="text-cyan" />
              <h3>INCIDENT TIMELINE</h3>
            </div>
            <span className="font-mono text-muted text-xs">CHRONOLOGICAL EVENT CHAIN</span>
          </div>

          <div className="vertical-timeline-list">
            {timeline.slice(0, 5).map((evt) => (
              <div key={evt.id} className="timeline-node-item">
                <div className="node-time font-mono">{evt.time}</div>
                <div className="node-axis">
                  <span className={`node-marker ${evt.type}`} />
                  <span className="node-stem" />
                </div>
                <div className="node-details">
                  <div className="node-title-row">
                    <b>{evt.title}</b>
                    <span className={`status-badge ${evt.classification.toLowerCase().replace(" ", "-")}`}>
                      [ {evt.classification.toUpperCase()} ]
                    </span>
                  </div>
                  <p>{evt.desc}</p>
                  <div className="node-metadata font-mono text-xs">
                    <span>ASSET: {evt.entity}</span> &bull; <span>CONFIDENCE: {evt.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence Explorer & AI Insights Split */}
        <div className="dashboard-right-stack">
          {/* AI Investigation Insights */}
          <section className="command-panel ai-insights-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <BrainCircuit size={15} className="text-purple" />
                <h3>AI INVESTIGATION INSIGHTS</h3>
              </div>
              <span className="status-badge guarded font-mono">[ EVIDENCE-GROUNDED ]</span>
            </div>

            <div className="ai-insight-content">
              <h4>PRIMARY HYPOTHESIS: ROGUE CREDENTIAL ABUSE</h4>
              <p>
                Session UID 1004 authenticated with authorized Kerberos TGT belonging to Rohit, 
                yet network telemetry verifies origin at an uncatalogued MAC address (D4:F5:47:9A:11:02).
              </p>

              <div className="ai-evidence-chain-mini">
                <div className="chain-step">
                  <span className="font-mono text-cyan">01</span>
                  <span>11:42 PM · Credential handshake accepted</span>
                </div>
                <div className="chain-step">
                  <span className="font-mono text-cyan">02</span>
                  <span>11:47 PM · Direct handle on PROJECT_ORION</span>
                </div>
                <div className="chain-step">
                  <span className="font-mono text-cyan">03</span>
                  <span>11:49 PM · 800 MB external stream initiated</span>
                </div>
              </div>

              <div className="grounding-callout">
                <AlertTriangle size={14} className="text-warning flex-shrink-0" />
                <span>
                  <strong>CRITICAL LIMITATION:</strong> Physical badge records at 18:30 do not place Rohit on site during breach. Credential theft or session token hijacking remains an active alternative explanation.
                </span>
              </div>
            </div>
          </section>

          {/* Compact Evidence Ledger */}
          <section className="command-panel evidence-summary-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <FileSearch size={15} className="text-cyan" />
                <h3>EVIDENCE EXPLORER</h3>
              </div>
              <span className="font-mono text-muted text-xs">TOP 4 CORRELATED LOGS</span>
            </div>

            <div className="table-responsive">
              <table className="forensic-table compact">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TIME</th>
                    <th>TYPE</th>
                    <th>DESCRIPTION</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {evidence.slice(0, 4).map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-cyan">{item.id}</td>
                      <td className="font-mono">{item.time}</td>
                      <td><span className="type-tag">{item.type}</span></td>
                      <td className="text-truncate">{item.desc}</td>
                      <td>
                        <span className={`status-badge ${item.classification.toLowerCase().replace(" ", "-")}`}>
                          [ {item.classification.toUpperCase()} ]
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
