import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import * as THREE from "three";
import "./HeartBeat.css";

/* ══════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════ */
const GOAL = 50; // clicks to win

const LOVE_PHRASES = [
  "i love you",
  "I love you",
  "i love you ♡",
  "love you",
  "i love you so much",
  "always",
  "forever",
  "i love you, Tanni",
  "truly, deeply",
  "more every day",
  "i love you ✦",
  "always & always",
  "endlessly",
  "I love you ❤",
  "genuinely, you",
  "i really do",
  "with everything",
];

const MILESTONES = {
  10: "10 heartbeats 🌸",
  20: "20! you're doing great ✦",
  30: "30 — halfway there 💛",
  40: "40 beats, still going 🌿",
  50: "50! the heart is full ❤",
};

const COLORS_WARM = [
  "#e8a89c",
  "#d4828f",
  "#c9963c",
  "#8fad91",
  "#d4b8c8",
  "#a08c78",
  "#f0deb0",
  "#e87878",
];

/* ══════════════════════════════════════════════
   THREE.JS — 3D BEATING HEART
══════════════════════════════════════════════ */
function HeartGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.5);
    shape.bezierCurveTo(0, 0.95, -0.65, 0.95, -0.65, 0.5);
    shape.bezierCurveTo(-0.65, 0.05, 0, -0.25, 0, -0.7);
    shape.bezierCurveTo(0, -0.25, 0.65, 0.05, 0.65, 0.5);
    shape.bezierCurveTo(0.65, 0.95, 0, 0.95, 0, 0.5);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.1,
      bevelThickness: 0.1,
      steps: 1,
    });
  }, []);
}

function ThreeDHeart({ clickSignal }) {
  const mesh = useRef();
  const geo = HeartGeometry();
  const beatRef = useRef(0); // 0 = idle, >0 = beating
  const baseScale = 1.9;

  // Material with internal glow feel
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#e8a89c"),
        roughness: 0.12,
        metalness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        emissive: new THREE.Color("#d4606a"),
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.96,
      }),
    [],
  );

  // React to click signal
  useEffect(() => {
    if (clickSignal > 0) {
      beatRef.current = 1; // trigger beat
    }
  }, [clickSignal]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();

    // Idle gentle throb
    const idleScale = baseScale + Math.sin(t * 1.8) * 0.04;

    // Beat thump
    let extraScale = 0;
    if (beatRef.current > 0) {
      beatRef.current -= 0.06;
      const p = beatRef.current;
      extraScale = Math.sin(p * Math.PI) * 0.22;
    }

    const s = idleScale + extraScale;
    mesh.current.scale.set(s, s, s);

    // Slow yaw drift
    mesh.current.rotation.y = Math.sin(t * 0.25) * 0.18;
    mesh.current.rotation.x = -0.15 + Math.sin(t * 0.18) * 0.06;

    // Emissive pulses brighter on beat
    mat.emissiveIntensity =
      0.18 + (beatRef.current > 0 ? 0.4 * beatRef.current : 0);
  });

  return (
    <mesh ref={mesh} geometry={geo} material={mat} position={[0, 0, 0]}>
      {/* Inner glow sphere */}
    </mesh>
  );
}

function HeartScene({ clickSignal }) {
  return (
    <>
      <ambientLight intensity={2.0} color="#fff8f0" />
      <directionalLight position={[4, 8, 6]} intensity={1.6} color="#ffe8d0" />
      <directionalLight
        position={[-5, 3, -3]}
        intensity={0.7}
        color="#f5c8c0"
      />
      <pointLight position={[0, 2, 5]} intensity={1.4} color="#e8a89c" />
      <pointLight position={[0, -3, 3]} intensity={0.5} color="#f0deb0" />
      <ThreeDHeart clickSignal={clickSignal} />
    </>
  );
}

/* ══════════════════════════════════════════════
   FLOATING WORD COMPONENT
══════════════════════════════════════════════ */
let wordId = 0;

function FloatingWord({ text, x, y, color, size, rot, rise, onDone }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => onDone();
    el.addEventListener("animationend", handler, { once: true });
    return () => el.removeEventListener("animationend", handler);
  }, [onDone]);

  return (
    <span
      ref={ref}
      className="love-word"
      style={{
        left: x,
        top: y,
        fontSize: size,
        color,
        "--rot": `${rot}deg`,
        "--rise": `${rise}px`,
      }}
    >
      {text}
    </span>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function HeartBeat({ onNext }) {
  const [mounted, setMounted] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [words, setWords] = useState([]);
  const [shockwaves, setShockwaves] = useState([]);
  const [milestone, setMilestone] = useState(null);
  const [isBeat, setIsBeat] = useState(false);
  const [clickSignal, setClickSignal] = useState(0);
  const [bpmPips, setBpmPips] = useState([false, false, false, false, false]);
  const [bpm, setBpm] = useState(0);
  const [showFinale, setShowFinale] = useState(false);
  const stageRef = useRef(null);
  const bpmRef = useRef({ times: [], timer: null });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // BPM calculator
  const recordBeat = useCallback(() => {
    const now = Date.now();
    const b = bpmRef.current;
    b.times.push(now);
    if (b.times.length > 6) b.times.shift();
    if (b.times.length >= 2) {
      const gaps = [];
      for (let i = 1; i < b.times.length; i++)
        gaps.push(b.times[i] - b.times[i - 1]);
      const avg = gaps.reduce((a, v) => a + v, 0) / gaps.length;
      const computed = Math.round(60000 / avg);
      setBpm(Math.min(computed, 300));
    }
    // Pip animation
    setBpmPips((prev) => {
      const next = [...prev];
      const idx = (next.lastIndexOf(true) + 1) % next.length;
      return next.map((_, i) => i === idx);
    });
    // Clear bpm after inactivity
    if (b.timer) clearTimeout(b.timer);
    b.timer = setTimeout(() => {
      setBpm(0);
      setBpmPips([false, false, false, false, false]);
    }, 2000);
  }, []);

  const handleClick = useCallback(() => {
    if (showFinale) return;

    const stage = stageRef.current;
    const rect = stage?.getBoundingClientRect();

    setClicks((prev) => {
      const next = prev + 1;

      // Milestone
      if (MILESTONES[next]) {
        setMilestone({ text: MILESTONES[next], id: Date.now() });
        setTimeout(() => setMilestone(null), 1800);
      }

      // Win
      if (next >= GOAL) {
        setTimeout(() => setShowFinale(true), 600);
      }

      return next;
    });

    // Beat animation
    setClickSignal((s) => s + 1);
    setIsBeat(true);
    setTimeout(() => setIsBeat(false), 400);
    recordBeat();

    // Spawn floating word
    if (stage) {
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Scatter around the heart
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 80;
      const wx = cx + Math.cos(angle) * dist;
      const wy = cy + Math.sin(angle) * dist - 20;

      const phrase =
        LOVE_PHRASES[Math.floor(Math.random() * LOVE_PHRASES.length)];
      const color = COLORS_WARM[Math.floor(Math.random() * COLORS_WARM.length)];
      const size = `${16 + Math.random() * 14}px`;
      const rot = (Math.random() - 0.5) * 22;
      const rise = -(90 + Math.random() * 70);
      const id = ++wordId;

      setWords((w) => [
        ...w,
        { id, text: phrase, x: wx, y: wy, color, size, rot, rise },
      ]);
    }

    // Shockwave
    const swId = Date.now() + Math.random();
    setShockwaves((s) => [...s, swId]);
    setTimeout(() => setShockwaves((s) => s.filter((x) => x !== swId)), 650);
  }, [showFinale, recordBeat]);

  const removeWord = useCallback((id) => {
    setWords((w) => w.filter((x) => x.id !== id));
  }, []);

  const progress = Math.min(clicks / GOAL, 1);

  return (
    <>
      {/* ── Finale ── */}
      {showFinale && (
        <div className="beat-finale">
          <Sparkles size={40} style={{ color: "var(--gold)" }} />
          <h2>
            you felt it,
            <br />
            <em>Tanni.</em>
          </h2>
          <p>
            {clicks} heartbeats. That's how many times the heart was waiting for
            you to show up — and you did, every single time.
          </p>
          <p className="beat-finale-count">
            total beats: <strong>{clicks}</strong>
          </p>
          {onNext && (
            <button className="beat-finale-btn" onClick={onNext} type="button">
              keep going <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* ── Main Page ── */}
      {!showFinale && (
        <div className={`beat-page ${mounted ? "is-mounted" : ""}`}>
          <div className="paper-grain" aria-hidden="true" />

          {/* Top bar */}
          <header className="topbar">
            <a className="wordmark" href="/" aria-label="Back to cover">
              <span className="wordmark-initial">T</span>
              <span className="wordmark-text">the little book of us</span>
            </a>
            <span className="page-count">
              chapter <strong>05</strong> <em>/</em> 22
            </span>
          </header>

          {/* Header */}
          <div className="beat-header">
            <p className="beat-eyebrow">
              <Sparkles size={13} strokeWidth={1.5} />
              listen to it beat
            </p>
            <h1 className="beat-title">beat my heart</h1>
            <p className="beat-subtitle">
              Click the heart {GOAL} times. With every beat — something comes
              out of it.
            </p>

            {/* BPM */}
            <div className="bpm-bar">
              <span className="bpm-label">bpm</span>
              <div className="bpm-beats">
                {bpmPips.map((active, i) => (
                  <div
                    key={i}
                    className={`bpm-pip ${active ? "active" : ""}`}
                  />
                ))}
              </div>
              <span className="bpm-value">{bpm > 0 ? bpm : "—"}</span>
            </div>
          </div>

          {/* Stage */}
          <div className="beat-stage" ref={stageRef}>
            {/* Click counter */}
            <div className="click-counter">
              <span>{clicks}</span> / {GOAL} beats
            </div>

            {/* Progress ring via SVG behind the heart */}
            <svg
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
                zIndex: 5,
              }}
              width="320"
              height="320"
              viewBox="0 0 320 320"
            >
              <circle
                cx="160"
                cy="160"
                r="148"
                fill="none"
                stroke="rgba(160,140,120,0.12)"
                strokeWidth="6"
              />
              <circle
                cx="160"
                cy="160"
                r="148"
                fill="none"
                stroke="var(--blush)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 148}`}
                strokeDashoffset={`${2 * Math.PI * 148 * (1 - progress)}`}
                transform="rotate(-90 160 160)"
                style={{
                  transition: "stroke-dashoffset 0.35s ease",
                  opacity: 0.55,
                }}
              />
            </svg>

            {/* 3D Heart canvas */}
            <button
              className={`heart-btn ${isBeat ? "beat" : ""}`}
              onClick={handleClick}
              aria-label="Click to beat the heart"
              type="button"
            >
              <div className="heart-svg">
                <Canvas
                  gl={{ antialias: true, alpha: true }}
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  dpr={[1, 2]}
                  style={{ width: "100%", height: "100%", display: "block" }}
                >
                  <HeartScene clickSignal={clickSignal} />
                </Canvas>
              </div>

              {/* Shockwave rings */}
              {shockwaves.map((id) => (
                <span key={id} className="shockwave" />
              ))}
            </button>

            {/* Floating "I love you" words */}
            {words.map((w) => (
              <FloatingWord key={w.id} {...w} onDone={() => removeWord(w.id)} />
            ))}

            {/* Milestone flash */}
            {milestone && (
              <div key={milestone.id} className="milestone-flash">
                {milestone.text}
              </div>
            )}

            {/* Tap hint before first click */}
            {clicks === 0 && <p className="tap-hint">tap the heart ↑</p>}
          </div>

          {/* Footer */}
          <footer className="beat-footer">
            <Heart
              size={13}
              fill="currentColor"
              style={{ color: "var(--blush)" }}
            />
            <span>this heart has been yours for a while now</span>
          </footer>
        </div>
      )}
    </>
  );
}
