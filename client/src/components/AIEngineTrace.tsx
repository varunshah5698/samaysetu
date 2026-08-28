import { BrainCircuit, CalendarClock, CheckCircle2, GitBranch, MapPinned, Radar, Route as RouteIcon, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Factor = { label: string; value: string; impact: string; note: string };
type CustomerDecision = { runId: string; day: string; time: string; festival: boolean; recommendation: { label: string; range: string; score: number }; selected: { label: string; score: number }; alternatives: { label: string; score: number }[]; factors: Factor[]; routeDistance: string; };
type FieldDecision = { runId: string; nextStop: string; remainingStops: number; confidence: number; reasons: string[]; changeNote: string; onReoptimize: () => void; };

export function AIEngineTrace({ context, compact = false, decision }: { context: "customer"; compact?: boolean; decision: CustomerDecision } | { context: "field"; compact?: boolean; decision: FieldDecision }) {
  const [active, setActive] = useState(0); useEffect(() => setActive(0), [decision.runId]);
  const stages = useMemo(() => context === "customer" ? [
    { name: "Your choice", icon: Radar, metric: `${decision.day} · ${decision.time}`, detail: "We check the day, time and nearby delivery route before suggesting a delivery time." },
    { name: "Best time", icon: BrainCircuit, metric: `${decision.recommendation.label} ${decision.recommendation.score}%`, detail: `${decision.recommendation.range} is the strongest time in today’s comparison.` },
    { name: "Other times", icon: GitBranch, metric: `${Math.max(0, decision.recommendation.score - [...decision.alternatives].sort((a, b) => b.score - a.score)[1]?.score)} pt lead`, detail: "You can see other available times before choosing what works for you." },
    { name: "Postman route", icon: RouteIcon, metric: `${decision.routeDistance} checked`, detail: "This time is kept because the postman can add it without going far out of the way." },
  ] : [
    { name: "Read route", icon: Radar, metric: `${decision.remainingStops} stops left`, detail: `The current next stop is ${decision.nextStop}. Completed handoffs are removed before the remaining sequence is scored.` },
    { name: "Test sequence", icon: BrainCircuit, metric: `${decision.confidence}% route fit`, detail: decision.changeNote },
    { name: "Protect handoff", icon: MapPinned, metric: "Low detour", detail: "The current order preserves one continuous delivery sweep instead of sending the postman back across the loop." },
    { name: "Apply change", icon: CheckCircle2, metric: "One click", detail: "Re-optimise only changes the unfinished part of the route; completed delivery evidence is never rewritten." },
  ], [context, decision]);
  const item = stages[active]; const Icon = item.icon;
  return <section className={`ai-engine decision-workbench ${compact ? "compact" : ""}`} aria-label="Explainable delivery decision">
    <div className="ai-engine-head"><div><p className="eyebrow">{context === "customer" ? "YOUR DELIVERY TIME" : "DELIVERY ORDER"}</p><h3>{context === "customer" ? "Why this is a good delivery time." : "See why the next route order was chosen."}</h3></div><span className="engine-live"><Sparkles size={14} /> {context === "customer" ? "checked for you" : "recalculated from current inputs"}</span></div>
    <div className="engine-track" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>{stages.map((stage, index) => { const StageIcon = stage.icon; return <button key={stage.name} onClick={() => setActive(index)} className={index === active ? "active" : ""} aria-current={index === active ? "step" : undefined}><span>0{index + 1}</span><StageIcon size={15} /><strong>{stage.name}</strong></button>; })}</div>
    <div className="engine-detail"><div className="engine-icon"><Icon size={22} /></div><div><p className="eyebrow">{item.metric}</p><h4>{item.name}</h4><p>{item.detail}</p></div><div className="engine-progress"><span>{context === "customer" ? "ON-TIME CHANCE" : "CURRENT ROUTE FIT"}</span><strong>{context === "customer" ? `${decision.recommendation.score}%` : `${decision.confidence}%`}</strong><i><b style={{ width: `${context === "customer" ? decision.recommendation.score : decision.confidence}%` }} /></i></div></div>
    {context === "customer" ? <div className="decision-evidence"><div className="evidence-list">{decision.factors.map(factor => <div className="evidence-row" key={factor.label}><span>{factor.label}</span><strong>{factor.value}</strong><b>{factor.impact}</b><small>{factor.note}</small></div>)}</div><div className="option-compare"><span>OTHER AVAILABLE TIMES</span>{decision.alternatives.map(option => <div key={option.label} className={option.label === decision.recommendation.label ? "best" : ""}><small>{option.label}</small><b>{option.score}%</b><i><em style={{ width: `${option.score}%` }} /></i></div>)}<p>{decision.selected.label === decision.recommendation.label ? "You chose the best available delivery time." : `Your selected ${decision.selected.label.toLowerCase()} time is ${decision.recommendation.score - decision.selected.score} points below the best time.`}</p></div></div> : <div className="route-reasoning"><ul>{decision.reasons.map(reason => <li key={reason}><CheckCircle2 size={14} /> {reason}</li>)}</ul><button className="engine-action" onClick={decision.onReoptimize}><CalendarClock size={15} /> Re-optimise unfinished stops</button></div>}
  </section>;
}
