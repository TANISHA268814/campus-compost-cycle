import { Html, Line, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type ViewMode = "overview" | "gas" | "compost";
export type StageId = "intake" | "digester" | "gas" | "separator" | "compost" | "kitchen";

export const STAGES: Record<StageId, { title: string; kicker: string; facts: string[] }> = {
  intake: { title: "Sort + macerate", kicker: "PRE-TREATMENT", facts: ["100 kg wet waste / day", "3 HP grinder · <5 mm", "1:1 dilution to 9% TS"] },
  digester: { title: "Anaerobic digester", kicker: "PRIMARY REACTOR", facts: ["7.5 m³ FRP floating drum", "6.0 m³ active liquid", "30-day HRT · 35 ± 2°C"] },
  gas: { title: "Gas conditioning", kicker: "CLEAN + STORE", facts: ["8.0 m³ biogas / day", "H₂S scrubbed below 50 ppm", "1.5% pipe fall to trap"] },
  kitchen: { title: "Kitchen energy", kicker: "END USE", facts: ["3.6 kg LPG offset / day", "8–14 mbar supply", "Flame arrestor + shutoff"] },
  separator: { title: "Digestate separation", kicker: "NUTRIENT RECOVERY", facts: ["160 L liquid / day", "Filtrate loops to dilution", "Cake at 20–25% TS"] },
  compost: { title: "Micro-compost", kicker: "AEROBIC FINISH", facts: ["350–500 L rotary drum", "55–65°C for 14–21 days", "18 kg cured compost / day"] },
};

const P = {
  steel: "#c8d1d0", dark: "#263332", green: "#3f7f5a", green2: "#86b879",
  food: "#d7a84d", slurry: "#8b6b3f", gas: "#e5b949", liquid: "#4f9d98",
  compost: "#7c5637", red: "#d55c50", ground: "#d9ded7", concrete: "#adb4ae",
};

type Props = { mode: ViewMode; labels: boolean; selected: StageId; onSelect: (id: StageId) => void; resetKey: number };
type V3 = [number, number, number];

function CameraRig({ mode, resetKey }: Pick<Props, "mode" | "resetKey">) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const destination = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    if (mode === "gas") { destination.set(1, 7, 13); target.set(2, 2, 0); }
    else if (mode === "compost") { destination.set(9, 7, 14); target.set(5, 1.5, 0); }
    else { destination.set(12, 11, 18); target.set(0, 1, 0); }
    camera.position.copy(destination);
    camera.lookAt(target);
  }, [camera, destination, mode, resetKey, target]);
  return <OrbitControls makeDefault target={target} minDistance={8} maxDistance={30} maxPolarAngle={Math.PI / 2.05} enableDamping />;
}

function Label({ children, position, visible }: { children: string; position: V3; visible: boolean }) {
  if (!visible) return null;
  return <Html center position={position} distanceFactor={13}><div className="model-label">{children}</div></Html>;
}

function Selectable({ id, selected, onSelect, children, position = [0, 0, 0] }: { id: StageId; selected: boolean; onSelect: (id: StageId) => void; children: React.ReactNode; position?: V3 }) {
  return <group position={position} onClick={(e) => { e.stopPropagation(); onSelect(id); }} scale={selected ? 1.04 : 1}>{children}</group>;
}

function Box({ position, scale, color = P.steel, metalness = 0.25 }: { position: V3; scale: V3; color?: string; metalness?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={scale} /><meshStandardMaterial color={color} roughness={0.55} metalness={metalness} /></mesh>;
}

function Pipe({ points, color, dashed = false }: { points: V3[]; color: string; dashed?: boolean }) {
  const linePoints = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);
  return <Line points={linePoints} color={color} lineWidth={dashed ? 1.5 : 4} dashed={dashed} dashSize={0.2} gapSize={0.14} />;
}

function FlowDot({ points, color, speed = 0.12 }: { points: V3[]; color: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), [points]);
  useFrame(({ clock }) => { const t = (clock.elapsedTime * speed) % 1; ref.current?.position.copy(curve.getPoint(t)); });
  return <mesh ref={ref}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh>;
}

function SortingLine({ labels, selected, onSelect }: Pick<Props, "labels" | "selected" | "onSelect">) {
  return <Selectable id="intake" selected={selected === "intake"} onSelect={onSelect} position={[-7, 0, 0]}>
    <Box position={[0, 0.7, 0]} scale={[2.6, 0.12, 1.35]} />
    {[-1, 1].flatMap((x) => [-0.48, 0.48].map((z) => <Box key={`${x}-${z}`} position={[x, 0.35, z]} scale={[0.1, 0.7, 0.1]} color={P.dark} />))}
    <mesh position={[0.35, 0.85, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.42, 0.42, 0.08, 24]} /><meshStandardMaterial color={P.food} /></mesh>
    <group position={[2.1, 0.65, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.7, 0.85, 1.3, 16]} /><meshStandardMaterial color={P.dark} roughness={0.4} metalness={0.55} /></mesh>
      <mesh position={[0, 0.85, 0]}><coneGeometry args={[0.88, 0.65, 16]} /><meshStandardMaterial color={P.steel} metalness={0.7} /></mesh>
      <Box position={[0.92, 0.1, 0]} scale={[0.8, 0.7, 0.7]} color={P.green} />
    </group>
    <Label position={[0, 2, 0]} visible={labels}>01 · SORT + SHRED</Label>
  </Selectable>;
}

function Digester({ labels, selected, onSelect }: Pick<Props, "labels" | "selected" | "onSelect">) {
  return <Selectable id="digester" selected={selected === "digester"} onSelect={onSelect} position={[-2.3, 0, 0]}>
    <mesh position={[0, 2, 0]} castShadow><cylinderGeometry args={[2.05, 2.05, 3.8, 32]} /><meshStandardMaterial color={P.green} roughness={0.38} metalness={0.05} /></mesh>
    <mesh position={[0, 4, 0]} castShadow><cylinderGeometry args={[1.8, 1.95, 1.2, 32]} /><meshStandardMaterial color={P.steel} roughness={0.28} metalness={0.55} /></mesh>
    <mesh position={[0, 4.68, 0]}><cylinderGeometry args={[0.2, 0.2, 0.35, 16]} /><meshStandardMaterial color={P.dark} /></mesh>
    <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[2.25, 2.25, 0.28, 32]} /><meshStandardMaterial color={P.concrete} /></mesh>
    <Label position={[0, 5.7, 0]} visible={labels}>02 · 7.5 m³ FRP DIGESTER</Label>
  </Selectable>;
}

function GasTrain({ labels, selected, onSelect }: Pick<Props, "labels" | "selected" | "onSelect">) {
  return <Selectable id="gas" selected={selected === "gas"} onSelect={onSelect} position={[1.4, 0, -1.4]}>
    <group position={[0, 0, 0]}>
      <mesh position={[0, 1.25, 0]} castShadow><cylinderGeometry args={[0.55, 0.55, 2.5, 20]} /><meshStandardMaterial color={P.dark} metalness={0.65} roughness={0.3} /></mesh>
      <mesh position={[0, 2.6, 0]}><sphereGeometry args={[0.18, 14, 14]} /><meshStandardMaterial color={P.red} /></mesh>
      <Label position={[0, 3.15, 0]} visible={labels}>H₂S IRON SPONGE</Label>
    </group>
    <group position={[2.15, 0, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow><sphereGeometry args={[1.15, 24, 16]} /><meshStandardMaterial color={P.gas} roughness={0.65} /></mesh>
      <Box position={[0, 0.15, 0]} scale={[1.7, 0.18, 1.7]} color={P.dark} />
      <Label position={[0, 2.65, 0]} visible={labels}>GAS HOLDER · 8 m³/D</Label>
    </group>
  </Selectable>;
}

function Kitchen({ labels, selected, onSelect }: Pick<Props, "labels" | "selected" | "onSelect">) {
  return <Selectable id="kitchen" selected={selected === "kitchen"} onSelect={onSelect} position={[7.1, 0, -1.5]}>
    <Box position={[0, 0.7, 0]} scale={[2.5, 1.4, 1.6]} color={P.steel} />
    {[-0.65, 0.65].map((x) => <group key={x} position={[x, 1.45, 0]}><mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.42, 0.08, 8, 24]} /><meshStandardMaterial color={P.dark} /></mesh><mesh position={[0, 0.14, 0]}><coneGeometry args={[0.19, 0.48, 12]} /><meshStandardMaterial color={P.gas} emissive={P.gas} emissiveIntensity={0.7} /></mesh></group>)}
    <Label position={[0, 2.5, 0]} visible={labels}>04 · CANTEEN BURNERS</Label>
  </Selectable>;
}

function Separator({ labels, selected, onSelect }: Pick<Props, "labels" | "selected" | "onSelect">) {
  return <Selectable id="separator" selected={selected === "separator"} onSelect={onSelect} position={[1.4, 0, 2.8]}>
    <Box position={[0, 1, 0]} scale={[1.8, 2, 1.25]} color={P.steel} />
    <mesh position={[0.95, 0.8, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.35, 0.35, 1.8, 16]} /><meshStandardMaterial color={P.dark} metalness={0.5} /></mesh>
    <Box position={[1.8, 0.28, 0]} scale={[1.2, 0.18, 1]} color={P.compost} />
    <Label position={[0, 2.6, 0]} visible={labels}>05 · SCREW PRESS</Label>
  </Selectable>;
}

function Composter({ labels, selected, onSelect }: Pick<Props, "labels" | "selected" | "onSelect">) {
  const drum = useRef<THREE.Group>(null);
  useFrame((_, rawDelta) => { if (drum.current) drum.current.rotation.x += Math.min(rawDelta, 0.05) * 0.22; });
  return <Selectable id="compost" selected={selected === "compost"} onSelect={onSelect} position={[5.4, 0, 3.1]}>
    <group ref={drum} rotation-z={Math.PI / 2} position={[0, 1.45, 0]}>
      <mesh castShadow><cylinderGeometry args={[1.05, 1.05, 2.8, 24]} /><meshStandardMaterial color={P.green2} roughness={0.55} /></mesh>
      {[-1.42, 1.42].map((y) => <mesh key={y} position={[0, y, 0]}><torusGeometry args={[1.06, 0.08, 8, 24]} /><meshStandardMaterial color={P.dark} /></mesh>)}
    </group>
    <Box position={[0, 0.35, 0]} scale={[3.2, 0.16, 1.8]} color={P.dark} />
    <group position={[2.5, 0, 0]}>{[0, 0.75].map((x) => <Box key={x} position={[x, 0.45, 0]} scale={[0.62, 0.8, 1.2]} color={P.compost} />)}</group>
    <Label position={[0.6, 3.15, 0]} visible={labels}>06 · ROTARY COMPOSTER</Label>
  </Selectable>;
}

export function WasteScene(props: Props) {
  const gasVisible = props.mode !== "compost";
  const compostVisible = props.mode !== "gas";
  const slurryPath: V3[] = [[-4.4, 1, 0], [-3.5, 1, 0], [-3.5, 2, 0], [-4.1, 2, 0]];
  const gasPath: V3[] = [[-2.3, 4.85, 0], [-2.3, 5.25, -1.4], [1.4, 3, -1.4], [3.6, 2.2, -1.4], [5.2, 2.2, -1.5], [7.1, 1.8, -1.5]];
  const digestPath: V3[] = [[-0.25, 0.7, 0], [0.2, 0.7, 2.8], [1.4, 1, 2.8]];
  const compostPath: V3[] = [[3.2, 0.8, 2.8], [3.8, 0.8, 3.1], [4, 1.4, 3.1]];
  return <>
    <color attach="background" args={["#eef0ec"]} />
    <fog attach="fog" args={["#eef0ec", 22, 40]} />
    <ambientLight intensity={1.1} />
    <hemisphereLight args={["#f9faf4", "#738277", 1.8]} />
    <directionalLight position={[-7, 13, 9]} intensity={2.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={12} shadow-camera-bottom={-8} />
    <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[34, 22]} /><meshStandardMaterial color={P.ground} roughness={0.95} /></mesh>
    <gridHelper args={[30, 30, "#aeb9b0", "#cbd1cb"]} position={[0, 0.01, 0]} />
    <SortingLine {...props} />
    <Digester {...props} />
    {gasVisible && <><GasTrain {...props} /><Kitchen {...props} /><Pipe points={gasPath} color={P.gas} /><FlowDot points={gasPath} color={P.gas} speed={0.08} /></>}
    {compostVisible && <><Separator {...props} /><Composter {...props} /><Pipe points={digestPath} color={P.slurry} /><Pipe points={compostPath} color={P.compost} /><FlowDot points={digestPath} color={P.slurry} /><FlowDot points={compostPath} color={P.compost} speed={0.16} /><Pipe points={[[1.4, 0.35, 2.8], [1.4, 0.2, 4.4], [-5.3, 0.2, 4.4], [-5.3, 0.8, 0.4]]} color={P.liquid} dashed /></>}
    <Pipe points={slurryPath} color={P.food} /><FlowDot points={slurryPath} color={P.food} speed={0.18} />
    <CameraRig mode={props.mode} resetKey={props.resetKey} />
  </>;
}