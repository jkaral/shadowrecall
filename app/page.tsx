"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, Brain, Check, Clock3, GitCompare, MemoryStick, Play, ShieldAlert, ShieldCheck, Sparkles, X } from "lucide-react";
import type { AnalysisResult, PlannedAction } from "@/lib/types";

const DEFAULT_INSTRUCTION = "Schedule the project review for the earliest available time.";

function value(value: unknown) {
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function ActionCard({ title, subtitle, action, tone }: { title: string; subtitle: string; action: PlannedAction; tone: "violet" | "slate" }) {
  return (
    <article className={`action-card ${tone}`}>
      <div className="card-heading">
        <div className="agent-icon">{tone === "violet" ? <Brain size={20} /> : <MemoryStick size={20} />}</div>
        <div><h3>{title}</h3><p>{subtitle}</p></div>
      </div>
      <div className="tool-chip"><Activity size={14} /> {action.tool.replaceAll("_", " ")}</div>
      <dl className="argument-list">
        {Object.entries(action.arguments).map(([key, item]) => (
          <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{value(item)}</dd></div>
        ))}
      </dl>
      <p className="rationale">{action.rationale}</p>
    </article>
  );
}

export default function Home() {
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  const changed = useMemo(() => result?.diffs.filter((diff) => diff.changed) ?? [], [result]);

  async function analyze() {
    setLoading(true); setError(""); setApproved(false);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, demo: demoMode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed");
    } finally { setLoading(false); }
  }

  function reset() { setResult(null); setApproved(false); setInstruction(DEFAULT_INSTRUCTION); }

  return (
    <main>
      <nav className="nav shell">
        <div className="brand"><div className="brand-mark"><GitCompare size={19} /></div><span>ShadowRecall</span></div>
        <button className="nav-status mode-toggle" onClick={() => { setDemoMode((mode) => !mode); setResult(null); }} title="Switch between the guided scenario and live Backboard memory retrieval"><span className="pulse" /> {demoMode ? "Guided demo" : "Live Backboard memory"}</button>
      </nav>

      <section className="hero shell">
        <div className="eyebrow"><Sparkles size={14} /> MEMORY INFLUENCE FIREWALL</div>
        <h1>Know when memory<br /><span>changes the decision.</span></h1>
        <p>
  ShadowRecall compares a memory-informed action plan with an
  amnesiac control, isolates the memory behind any disagreement,
  and pauses execution before it matters.
</p>
      </section>

      <section className="workspace shell">
        <div className="instruction-panel">
          <div className="panel-label"><span>01</span> Give the agent an instruction</div>
          <textarea aria-label="Agent instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} maxLength={1000} />
          <div className="prompt-footer">
            <button className="example" onClick={() => setInstruction(DEFAULT_INSTRUCTION)}>Load demo scenario</button>
            <button className="analyze" onClick={analyze} disabled={loading || instruction.trim().length < 3}>
              {loading ? <><span className="spinner" /> Running twins…</> : <><Play size={15} fill="currentColor" /> Analyze influence</>}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </div>

        {!result ? (
          <div className="empty-flow">
            <div className="twin remembering"><Brain size={23} /><span>Remembering agent</span></div>
            <div className="flow-line"><ArrowRight size={18} /></div>
            <div className="waiting"><GitCompare size={27} /><strong>Waiting to compare</strong><span>No action is ever executed during analysis</span></div>
            <div className="flow-line reverse"><ArrowRight size={18} /></div>
            <div className="twin amnesiac"><MemoryStick size={23} /><span>Amnesiac twin</span></div>
          </div>
        ) : (
          <div className="results">
            <div className="result-header">
              <div className="panel-label"><span>02</span> Compare planned actions</div>
              <div className={`risk-badge ${result.risk}`}>{result.diverged ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />} {result.diverged ? `${result.risk} influence` : "No influence"}</div>
            </div>
            <div className="actions-grid">
              <ActionCard
  title="Remembering agent"
  subtitle={
    result.mode === "live"
      ? "Live Backboard memory"
      : "Guided memory fixture"
  }
  action={result.remembered}
  tone="violet"
/>
              <div className="versus">VS</div>
              <ActionCard
  title="Amnesiac twin"
  subtitle="Memory deliberately withheld"
  action={result.amnesiac}
  tone="slate"
/>
            </div>

            {result.diverged && (
              <div className="difference-panel">
                <div className="difference-title"><ShieldAlert size={19} /><div><strong>Memory changed {changed.length} action {changed.length === 1 ? "field" : "fields"}</strong><span>Execution is paused for review</span></div></div>
                <div className="diff-table">
                  <div className="diff-row head"><span>Field</span><span>Remembering</span><span>Amnesiac</span></div>
                  {changed.map((diff) => <div className="diff-row" key={diff.path}><strong>{diff.path}</strong><span>{value(diff.remembered)}</span><span>{value(diff.amnesiac)}</span></div>)}
                </div>
              </div>
            )}

            <div className="attribution-panel">
              <div className="panel-label"><span>03</span> Trace the cause</div>
              {result.attribution ? (
                <div className="memory-cause">
                  <div className="memory-top"><div className="memory-symbol"><Brain size={19} /></div><div><small>LIKELY INFLUENCING MEMORY</small><strong>“{result.attribution.memory.content}”</strong></div><div className="field coverage">{Math.round(result.attribution.confidence * 100)}%<small>field coverage</small></div></div>
                  <p>{result.attribution.explanation}</p>
                  <div className="source"><Clock3 size={13} /> {result.attribution.memory.source} · {result.attribution.memory.createdAt}</div>
                </div>
              ) : <div className="no-cause"><Check size={18} /> No individual memory changed the action.</div>}
            </div>

            <div className="decision-bar">
              <div><strong>{approved ? "Action approved" : "Human decision required"}</strong><span>{approved ? "The remembering plan was approved for this simulation." : "No external tool will run without your approval."}</span></div>
              <div className="decision-actions">
                <button className="reject" onClick={reset}><X size={15} /> Reject</button>
                <button className="approve" onClick={() => setApproved(true)} disabled={approved}><Check size={15} /> {approved ? "Approved" : "Approve plan"}</button>
              </div>
            </div>
            <div className="telemetry"><span>Mode: {result.mode}</span><span>{result.memoriesConsidered.length} memories tested</span><span>{result.durationMs}ms total</span><span>Action executed: no</span></div>
          </div>
        )}
      </section>

      <footer className="shell"><span>Built for CUTC Transform 2026</span><span>Apps · Workflows · Design</span></footer>
    </main>
  );
}
