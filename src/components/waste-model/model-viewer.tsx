import { Canvas } from "@react-three/fiber";
import { RotateCcw, Tags, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { STAGES, WasteScene, type StageId, type ViewMode } from "./scene";

const modes: { id: ViewMode; label: string }[] = [
  { id: "overview", label: "Full system" },
  { id: "gas", label: "Biogas path" },
  { id: "compost", label: "Compost path" },
];

export function ModelViewer() {
  const [mode, setMode] = useState<ViewMode>("overview");
  const [selected, setSelected] = useState<StageId>("digester");
  const [labels, setLabels] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const stage = STAGES[selected];

  return <main className="model-shell">
    <header className="model-header">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden>TIU</div>
        <div><p className="eyebrow">CIRCULAR CAMPUS SYSTEM · CONCEPT MODEL</p><h1>Wet-waste recovery pipeline</h1></div>
      </div>
      <div className="header-metrics" aria-label="System design capacity">
        <div><strong>100</strong><span>kg/day feed</span></div><i />
        <div><strong>8.0</strong><span>m³/day gas</span></div><i />
        <div><strong>18</strong><span>kg/day compost</span></div>
      </div>
    </header>

    <section className="viewer-grid">
      <div className="canvas-wrap">
        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [12, 11, 18], fov: 46 }} gl={{ antialias: true }}>
          <WasteScene mode={mode} labels={labels} selected={selected} onSelect={setSelected} resetKey={resetKey} />
        </Canvas>
        <div className="view-tabs" role="group" aria-label="Model view">
          {modes.map((item) => <Button key={item.id} variant={mode === item.id ? "primary" : "ghost"} onClick={() => setMode(item.id)}>{item.label}</Button>)}
        </div>
        <div className="canvas-actions">
          <Button size="icon" variant="secondary" aria-label="Toggle equipment labels" title="Toggle labels" onClick={() => setLabels((value) => !value)}><Tags size={16} /></Button>
          <Button size="icon" variant="secondary" aria-label="Reset model view" title="Reset view" onClick={() => setResetKey((value) => value + 1)}><RotateCcw size={16} /></Button>
        </div>
        <div className="gesture-hint">DRAG TO ORBIT · SCROLL TO ZOOM</div>
      </div>

      <aside className="detail-panel">
        <div className="stage-number">{String(Object.keys(STAGES).indexOf(selected) + 1).padStart(2, "0")}</div>
        <p className="eyebrow">{stage.kicker}</p>
        <h2>{stage.title}</h2>
        <div className="fact-list">{stage.facts.map((fact) => <div key={fact}><span />{fact}</div>)}</div>
        <div className="stage-list" aria-label="Process stages">
          {(Object.keys(STAGES) as StageId[]).map((id) => <button key={id} className={selected === id ? "active" : ""} onClick={() => setSelected(id)}><span>{String(Object.keys(STAGES).indexOf(id) + 1).padStart(2, "0")}</span>{STAGES[id].title}</button>)}
        </div>
        <div className="safety-note"><TriangleAlert size={17} /><p><strong>Safety envelope</strong><br />5 m electrical clearance · 10 m from occupied air intakes · methane and H₂S detection</p></div>
      </aside>
    </section>

    <footer className="model-footer">
      <div className="legend"><span><i className="waste" />Wet waste</span><span><i className="gas" />Biogas</span><span><i className="liquid" />Filtrate recycle</span><span><i className="compost" />Digestate / compost</span></div>
      <p>Concept visualization based on IS 9478:2023 design criteria. Final construction requires certified civil, process, fire and electrical engineering review.</p>
    </footer>
  </main>;
}