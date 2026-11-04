import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";
import "./Aeroplane.css";

/* ══════════════════════════════════════════════
   MEMORY DATA
══════════════════════════════════════════════ */
const MEMORIES = [
  {
    id: 0,
    date: "21st May",
    nav: "21 MAY",
    title: "The First Conversation",
    sub: "The day our story began 💌",
    color: new THREE.Color("#f5c8c0"),
    t: 0.02,
  },
  {
    id: 1,
    date: "27th May",
    nav: "27 MAY",
    title: "Our First Time Out",
    sub: "Our first little adventure together 🌸",
    color: new THREE.Color("#c9963c"),
    t: 0.18,
  },
  {
    id: 2,
    date: "6th June",
    nav: "6 JUN",
    title: "My Birthday",
    sub: "A birthday made more special by you by a Single Status🎂",
    color: new THREE.Color("#f0deb0"),
    t: 0.34,
  },
  {
    id: 3,
    date: "5th July",
    nav: "5 JUL",
    title: "A Little Story From You",
    sub: "A little story that meant a lot to me 📱❤️",
    color: new THREE.Color("#d4b8c8"),
    t: 0.5,
  },
  {
    id: 4,
    date: "10th July",
    nav: "10 JUL",
    title: "Our First Date ",
    sub: "The moment you chose White Sauce Pasta over me 🍝❤️",
    color: new THREE.Color("#e8a89c"),
    t: 0.65,
  },
  {
    id: 5,
    date: "12th July",
    nav: "12 JUL",
    title: "Our First Kiss",
    sub: "Our first kiss ❤️",
    color: new THREE.Color("#d4828f"),
    t: 0.79,
  },
  {
    id: 6,
    date: "12th August",
    nav: "12 AUG",
    title: "The Real Beginning",
    sub: "The day we truly became us ❤️",
    color: new THREE.Color("#c9963c"),
    t: 0.97,
  },
];

/* ══════════════════════════════════════════════
   FLIGHT PATH — organic heart-ish winding curve
══════════════════════════════════════════════ */
const PATH_POINTS = [
  new THREE.Vector3(-15, -5, 0),
  new THREE.Vector3(-17, 1, 0),
  new THREE.Vector3(-15, 7, 0),
  new THREE.Vector3(-10, 10, 0),
  new THREE.Vector3(-4, 9, 0),
  new THREE.Vector3(0, 3, 0),
  new THREE.Vector3(4, 9, 0),
  new THREE.Vector3(10, 10, 0),
  new THREE.Vector3(15, 7, 0),
  new THREE.Vector3(17, 1, 0),
  new THREE.Vector3(15, -5, 0),
  new THREE.Vector3(9, -9, 0),
  new THREE.Vector3(2, -7, 0),
  new THREE.Vector3(-5, -5, 0),
  new THREE.Vector3(-10, -3, 0),
  new THREE.Vector3(-2, -2, 0),
  new THREE.Vector3(7, -1, 0),
  new THREE.Vector3(15, 2, 0),
];

/* Map memory.t to a world position on the curve */
function useFlightCurve() {
  return useMemo(
    () => new THREE.CatmullRomCurve3(PATH_POINTS, false, "catmullrom", 0.5),
    [],
  );
}

/* Memory world positions — evenly spaced along curve t values */
function getMemoryPos(curve, t) {
  const pt = curve.getPointAt(Math.min(t, 0.999));
  return pt.clone().add(new THREE.Vector3(0, 0.35, 0.2));
}

/* ══════════════════════════════════════════════
   CONTRAIL
══════════════════════════════════════════════ */
function Contrail({ points }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current || points.length < 2) return;
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    ref.current.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  if (points.length < 2) return null;
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial
        color="#f5c8c0"
        transparent
        opacity={0.18}
        linewidth={1}
      />
    </line>
  );
}

/* ══════════════════════════════════════════════
   AIRPLANE MESH
══════════════════════════════════════════════ */
function AirplaneMesh() {
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.22, 1.2, 3]} />
        <meshBasicMaterial color="#fffaf0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.01, 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.84, 3]} />
        <meshBasicMaterial color="#f5c8c0" side={THREE.DoubleSide} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.ConeGeometry(0.22, 1.2, 3)]} />
        <lineBasicMaterial color="#6b5744" transparent opacity={0.75} />
      </lineSegments>
    </group>
  );
}

/* ══════════════════════════════════════════════
   MEMORY SCENE — floating destination orb
══════════════════════════════════════════════ */
function MemoryOrb({ memory, active, visited, onCheckpoint }) {
  const group = useRef();
  const orb = useRef();

  useFrame(() => {
    if (!group.current) return;
    if (orb.current) {
      orb.current.material.opacity = active ? 1 : visited ? 0.75 : 0.5;
    }
  });

  return (
    <group
      ref={group}
      onClick={(event) => {
        event.stopPropagation();
        onCheckpoint(memory.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Clickable checkpoint dot */}
      <mesh ref={orb}>
        <circleGeometry args={[active ? 0.34 : 0.26, 24]} />
        <meshBasicMaterial color={active ? "#d4829a" : "#c9963c"} />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════
   FLIGHT PATH LINE
══════════════════════════════════════════════ */
function FlightPathLine({ curve, progress }) {
  const pts = useMemo(() => curve.getPoints(220), [curve]);
  const travelledPts = pts.slice(
    0,
    Math.max(2, Math.floor(progress * pts.length)),
  );

  return (
    <group>
      <points>
        <bufferGeometry setFromPoints={pts} />
        <pointsMaterial color="#a08c78" size={0.14} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry setFromPoints={travelledPts} />
        <pointsMaterial color="#d4829a" size={0.2} sizeAttenuation />
      </points>
    </group>
  );
}

/* ══════════════════════════════════════════════
   MAIN 3D SCENE
══════════════════════════════════════════════ */
function Scene({ flightT, activeMemory, visitedIds, onCheckpoint, onReady }) {
  const curve = useFlightCurve();
  const planeRef = useRef();
  const groupRef = useRef();

  const { camera } = useThree();

  // Memory positions in world space
  const memoryPositions = useMemo(
    () => MEMORIES.map((m) => getMemoryPos(curve, m.t)),
    [curve],
  );

  useEffect(() => {
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
    onReady?.();
  }, [camera, onReady]);

  useFrame(({ clock }) => {
    const t = Math.max(0.001, Math.min(0.999, flightT));
    const pt = curve.getPointAt(t);
    const pt2 = curve.getPointAt(Math.min(t + 0.005, 0.999));

    // Plane orientation
    if (planeRef.current) {
      const forward = pt2.clone().sub(pt).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();
      const actualUp = new THREE.Vector3()
        .crossVectors(right, forward)
        .normalize();

      const matrix = new THREE.Matrix4();
      matrix.makeBasis(right, actualUp, forward.clone().negate());
      planeRef.current.quaternion.setFromRotationMatrix(matrix);
      planeRef.current.position.copy(pt);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Soft paper-map lighting */}
      <ambientLight intensity={1.8} color="#fff8ed" />
      <directionalLight position={[4, 10, 6]} intensity={0.7} color="#f0c9b5" />

      {/* Scene elements */}
      <FlightPathLine curve={curve} progress={flightT} />

      {/* Clickable date checkpoints */}
      {MEMORIES.map((mem, i) => (
        <group key={mem.id} position={memoryPositions[i]}>
          <MemoryOrb
            memory={mem}
            active={activeMemory === i}
            visited={visitedIds.has(i)}
            onCheckpoint={onCheckpoint}
          />
        </group>
      ))}

      {/* Airplane */}
      <group ref={planeRef} scale={0.72}>
        <AirplaneMesh />
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════
   MEMORY TEXT REVEAL
══════════════════════════════════════════════ */
function MemoryReveal({ memory, visible }) {
  const [phase, setPhase] = useState(0); // 0=date, 1=title, 2=sub

  useEffect(() => {
    if (!visible || !memory) {
      setPhase(0);
      return;
    }
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible, memory?.id]);

  if (!memory) return null;

  return (
    <div className={`memory-reveal ${!visible ? "hidden" : ""}`}>
      <div className="memory-card">
        {phase >= 0 && <span className="mem-date">{memory.date}</span>}
        <span className="mem-rule" />
        {phase >= 1 && <h2 className="mem-title">{memory.title}</h2>}
        {phase >= 2 && <p className="mem-sub">{memory.sub}</p>}
        <div className="mem-heart-row" aria-hidden="true">
          ♥ ✦ ♥
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════ */
export default function AeroJourney({ onNext }) {
  const [started, setStarted] = useState(false);
  const [flightT, setFlightT] = useState(0.001);
  const [activeMemory, setActiveMem] = useState(null);
  const [visitedIds, setVisited] = useState(new Set());
  const [showReveal, setShowReveal] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [isTransiting, setTransiting] = useState(false);

  const tRef = useRef(0.001);
  const targetTRef = useRef(0.001);
  const rafRef = useRef(null);
  const scrollAcc = useRef(0);

  /* Animate t toward targetT smoothly */
  useEffect(() => {
    const animate = () => {
      const diff = targetTRef.current - tRef.current;
      if (Math.abs(diff) > 0.0002) {
        tRef.current += diff * 0.04;
        setFlightT(tRef.current);

        // Check proximity to each memory
        const nearIdx = MEMORIES.findIndex(
          (m) => Math.abs(tRef.current - m.t) < 0.045,
        );

        if (nearIdx !== -1 && activeMemory !== nearIdx && !isTransiting) {
          setActiveMem(nearIdx);
          setVisited((prev) => new Set([...prev, nearIdx]));
          setShowReveal(true);
          setTransiting(true);
          setTimeout(() => {
            setShowReveal(false);
            setTransiting(false);
          }, 3200);
        }

        if (tRef.current >= 0.95 && !showFinale) {
          setTimeout(() => setShowFinale(true), 2000);
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeMemory, isTransiting, showFinale]);

  /* Clear activeMemory when leaving zone */
  useEffect(() => {
    const nearIdx = MEMORIES.findIndex((m) => Math.abs(flightT - m.t) < 0.05);
    if (nearIdx === -1 && activeMemory !== null && !isTransiting) {
      setActiveMem(null);
    }
  }, [flightT, activeMemory, isTransiting]);

  /* Scroll handler */
  useEffect(() => {
    if (!started) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00015;
      targetTRef.current = Math.min(
        0.999,
        Math.max(0.001, targetTRef.current + delta),
      );
    };
    const onTouch = (() => {
      let lastY = null;
      return {
        start: (e) => {
          lastY = e.touches[0].clientY;
        },
        move: (e) => {
          if (lastY === null) return;
          const dy = (lastY - e.touches[0].clientY) * 0.0006;
          targetTRef.current = Math.min(
            0.999,
            Math.max(0.001, targetTRef.current + dy),
          );
          lastY = e.touches[0].clientY;
        },
      };
    })();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouch.start);
    window.addEventListener("touchmove", onTouch.move);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch.start);
      window.removeEventListener("touchmove", onTouch.move);
    };
  }, [started]);

  const flyTo = useCallback((memIdx) => {
    const mem = MEMORIES[memIdx];
    targetTRef.current = mem.t;
  }, []);

  const handleStart = () => {
    setStarted(true);
    targetTRef.current = 0.18;
  };

  const progressPct = (flightT / 0.999) * 100;

  return (
    <div className="journey-root">
      {/* Three.js canvas */}
      <Canvas
        className="journey-canvas"
        orthographic
        camera={{ position: [0, 0, 30], zoom: 24, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            flightT={flightT}
            activeMemory={activeMemory}
            visitedIds={visitedIds}
            onCheckpoint={flyTo}
          />
        </Suspense>
      </Canvas>

      {/* Topbar */}
      <header className="journey-topbar">
        <a className="journey-wordmark" href="/" aria-label="Back to cover">
          <span className="journey-wordmark-initial">T</span>
          <span className="journey-wordmark-text">the little book of us</span>
        </a>
        <span className="journey-chapter-label">
          chapter <strong>10</strong> <em>/</em> 22
        </span>
      </header>

      {/* Opening screen */}
      {!started && (
        <div className="journey-opening">
          <span className="opening-plane">✈️</span>
          <h1 className="opening-title">
            Take a flight
            <br />
            through our story
          </h1>
          <p className="opening-sub">Every little moment brought us here.</p>
          <button className="opening-cta" onClick={handleStart} type="button">
            ✦ scroll or click to begin ✦
          </button>
        </div>
      )}

      {/* Memory text reveal */}
      {started && (
        <MemoryReveal
          memory={activeMemory !== null ? MEMORIES[activeMemory] : null}
          visible={showReveal}
        />
      )}

      {/* Scroll hint */}
      {started && !showFinale && (
        <div className="journey-progress">
          <span className="progress-text">scroll</span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ height: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Finale */}
      {showFinale && (
        <div className={`journey-finale ${showFinale ? "visible" : ""}`}>
          <h2 className="finale-main">
            Look how far
            <br />
            <em>we've come.</em> ❤️
          </h2>
          <p className="finale-sub">And this is only the beginning.</p>
          {onNext && (
            <button className="finale-continue" onClick={onNext} type="button">
              Continue our story <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
