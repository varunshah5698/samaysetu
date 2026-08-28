/* Quiet Dispatch: tactile, interactive route canvas that remains useful without an external map dependency. */
import { Minus, Navigation, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type RouteStop = {
  id: string;
  label: string;
  shortLabel?: string;
  x: number;
  y: number;
  status?: "hub" | "delivered" | "next" | "pending" | "customer";
};

type RouteMapProps = {
  stops: RouteStop[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function RouteMap({ stops, selectedId, onSelect, className = "" }: RouteMapProps) {
  const [zoom, setZoom] = useState(1);
  const [internalSelected, setInternalSelected] = useState(selectedId ?? stops[0]?.id);
  const activeId = selectedId ?? internalSelected;

  useEffect(() => setInternalSelected(selectedId ?? stops[0]?.id), [selectedId, stops]);

  const path = useMemo(() => stops.map(stop => `${stop.x},${stop.y}`).join(" "), [stops]);
  const select = (id: string) => { setInternalSelected(id); onSelect?.(id); };
  const reset = () => { setZoom(1); select(stops[0]?.id ?? ""); };

  return <div className={`route-canvas ${className}`}>
    <div className="route-grid-lines" aria-hidden="true"><i /><i /><i /><i /></div>
    <svg viewBox="0 0 100 100" role="img" aria-label="Interactive delivery route map" preserveAspectRatio="xMidYMid slice">
      <g transform={`translate(50 50) scale(${zoom}) translate(-50 -50)`}>
        <path className="road-primary" d="M-4 18 C16 20 20 38 37 42 S67 35 103 18" />
        <path className="road-primary second" d="M8 97 C22 71 43 68 54 57 S76 29 91 -3" />
        <path className="road-minor" d="M2 5 C22 17 37 16 48 27 S79 56 100 58" />
        <path className="road-minor" d="M-2 81 C17 80 26 66 41 70 S70 93 102 82" />
        <path className="road-minor" d="M15 -4 C24 25 42 34 50 46 S54 80 65 104" />
        <path className="road-minor" d="M83 -3 C64 13 65 26 51 34 S18 43 -4 55" />
        <path className="route-shadow" points={path} />
        <polyline className="route-line" points={path} />
        {stops.map((stop, index) => <g key={stop.id} className={`map-stop ${stop.status ?? "pending"} ${activeId === stop.id ? "active" : ""}`} onClick={() => select(stop.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") select(stop.id); }} tabIndex={0} role="button" aria-label={`Select ${stop.label}`}>
          {activeId === stop.id && <circle className="map-pulse" cx={stop.x} cy={stop.y} r="5.4" />}
          <circle className="map-pin" cx={stop.x} cy={stop.y} r={stop.status === "hub" ? 3.5 : 2.85} />
          <text x={stop.x} y={stop.y + .9}>{stop.status === "hub" ? "D" : index}</text>
        </g>)}
      </g>
    </svg>
    <div className="map-chip map-chip-north"><Navigation size={13} /> N</div>
    <div className="map-controls"><button onClick={() => setZoom(value => Math.min(1.45, value + .1))} aria-label="Zoom in"><Plus size={15} /></button><button onClick={() => setZoom(value => Math.max(.85, value - .1))} aria-label="Zoom out"><Minus size={15} /></button><button onClick={reset} aria-label="Re-center route"><RotateCcw size={14} /></button></div>
    <div className="map-scale"><span /> 1 km</div>
  </div>;
}
