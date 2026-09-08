import { useState, useEffect, useRef, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ArrowUpRight, Heart, Sparkles, CakeSlice, Music2 } from "lucide-react";
import * as THREE from "three";
import "./App.css";
import BalloonsPage from "./pages/02-ballons/BalloonsPage.jsx";
import ScrollPage from "./pages/03-scroll/Scrollpage.jsx";
import CatchMyHeart from "./pages/04-Catch/Catchmyheart.jsx";
import FearFundaPage from "./pages/05-fear/fearFunda.jsx";
import HeartBeat from "./pages/06-beatTheHeart/HeartBeat.jsx";
import ILoveYouPuzzle from "./pages/07-puzzle/HeartPuzzle.jsx";
import birthdayMusic from "./assets/bayside-breeze.mp3";

// Pages with their own audio controls manage music locally.
const MUSIC_EXCLUDED_PATHS = ["/chapter/3"];
/* ─────────────────────────────────────────────
   THREE.JS — Floating petal particle field
───────────────────────────────────────────── */

function PetalGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.1, 0.5, 0.4, 0.4, 0.7);
    shape.bezierCurveTo(0.3, 1.0, 0, 1.1, -0.1, 0.8);
    shape.bezierCurveTo(-0.25, 0.5, -0.2, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape, 6);
  }, []);
}

function Petal({ position, rotation, scale, speed, drift, phase }) {
  const mesh = useRef();
  const geo = PetalGeometry();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const y = ((position[1] - speed * t * 0.3 - phase * 10) % 20) - 5;
    mesh.current.position.y = y;
    mesh.current.position.x = position[0] + Math.sin(t * drift + phase) * 1.2;
    mesh.current.rotation.z = rotation + Math.sin(t * 0.4 + phase) * 0.3;
    mesh.current.rotation.y = t * 0.2 + phase;
    mesh.current.rotation.x = Math.sin(t * 0.15 + phase) * 0.4;
  });

  const color = useMemo(() => {
    const palette = [
      "#e8a89c",
      "#f5c8c0",
      "#d4b8c8",
      "#c9963c",
      "#f0deb0",
      "#8fad91",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }, []);

  return (
    <mesh
      ref={mesh}
      geometry={geo}
      position={position}
      rotation={[rotation, 0, rotation * 0.5]}
      scale={scale}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.72}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.05}
      />
    </mesh>
  );
}

function FloatingDust() {
  const points = useRef();
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= 0.003;
      if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * 0.01;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c9963c"
        size={0.06}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function PetalField() {
  const petals = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 28,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 8 - 2,
        ],
        rotation: Math.random() * Math.PI * 2,
        scale: 0.18 + Math.random() * 0.38,
        speed: 0.4 + Math.random() * 0.6,
        drift: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  );

  return (
    <>
      {petals.map((p) => (
        <Petal key={p.id} {...p} />
      ))}
      <FloatingDust />
    </>
  );
}

function SceneSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 12);
  }, [camera]);
  return null;
}

function ThreeCanvas() {
  return (
    <Canvas
      className="three-canvas"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <SceneSetup />
      <ambientLight intensity={1.4} color="#fff8f0" />
      <directionalLight position={[5, 8, 5]} intensity={1.0} color="#ffe8c8" />
      <pointLight position={[-8, 4, 4]} intensity={0.6} color="#f5c8c0" />
      <PetalField />
    </Canvas>
  );
}

/* ─────────────────────────────────────────────
   SVG lily illustration
───────────────────────────────────────────── */
function LilySVG() {
  return (
    <svg
      className="lily-svg"
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M60 155 Q57 120 60 90"
        stroke="#8fad91"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 125 Q40 115 38 100 Q50 108 60 120"
        fill="#8fad91"
        opacity="0.8"
      />
      <path
        d="M60 110 Q80 100 84 86 Q70 96 60 108"
        fill="#8fad91"
        opacity="0.7"
      />
      <ellipse
        cx="60"
        cy="70"
        rx="9"
        ry="28"
        fill="#f5c8c0"
        opacity="0.9"
        transform="rotate(-35 60 70)"
      />
      <ellipse
        cx="60"
        cy="70"
        rx="9"
        ry="28"
        fill="#e8a89c"
        opacity="0.85"
        transform="rotate(0 60 70)"
      />
      <ellipse
        cx="60"
        cy="70"
        rx="9"
        ry="28"
        fill="#f5c8c0"
        opacity="0.9"
        transform="rotate(35 60 70)"
      />
      <ellipse
        cx="60"
        cy="70"
        rx="9"
        ry="28"
        fill="#e8a89c"
        opacity="0.8"
        transform="rotate(-70 60 70)"
      />
      <ellipse
        cx="60"
        cy="70"
        rx="9"
        ry="28"
        fill="#f5d0c8"
        opacity="0.85"
        transform="rotate(70 60 70)"
      />
      <circle cx="60" cy="70" r="8" fill="#c9963c" opacity="0.9" />
      <circle cx="60" cy="70" r="4" fill="#f0deb0" />
      <line
        x1="60"
        y1="62"
        x2="55"
        y2="52"
        stroke="#c9963c"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="55" cy="51" r="2" fill="#c9963c" />
      <line
        x1="60"
        y1="62"
        x2="65"
        y2="52"
        stroke="#c9963c"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="65" cy="51" r="2" fill="#c9963c" />
      <line
        x1="60"
        y1="62"
        x2="60"
        y2="50"
        stroke="#c9963c"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="49" r="2" fill="#c9963c" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SVG teddy illustration
───────────────────────────────────────────── */
function TeddySVG() {
  return (
    <svg
      className="teddy-svg"
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="36" cy="38" r="14" fill="#c9a882" />
      <circle cx="84" cy="38" r="14" fill="#c9a882" />
      <circle cx="36" cy="38" r="9" fill="#d4b896" />
      <circle cx="84" cy="38" r="9" fill="#d4b896" />
      <ellipse cx="60" cy="56" rx="30" ry="28" fill="#c9a882" />
      <circle cx="48" cy="50" r="5" fill="#2e2118" />
      <circle cx="72" cy="50" r="5" fill="#2e2118" />
      <circle cx="50" cy="48" r="1.8" fill="white" />
      <circle cx="74" cy="48" r="1.8" fill="white" />
      <ellipse cx="60" cy="64" rx="14" ry="11" fill="#d4b896" />
      <ellipse cx="60" cy="59" rx="5" ry="3.5" fill="#8b6f5e" />
      <path
        d="M54 65 Q60 70 66 65"
        stroke="#8b6f5e"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="42" cy="64" rx="7" ry="4.5" fill="#e8a89c" opacity="0.5" />
      <ellipse cx="78" cy="64" rx="7" ry="4.5" fill="#e8a89c" opacity="0.5" />
      <ellipse cx="60" cy="108" rx="28" ry="26" fill="#c9a882" />
      <ellipse cx="60" cy="108" rx="18" ry="16" fill="#d4b896" opacity="0.7" />
      <ellipse
        cx="28"
        cy="100"
        rx="10"
        ry="18"
        fill="#c9a882"
        transform="rotate(-20 28 100)"
      />
      <ellipse
        cx="92"
        cy="100"
        rx="10"
        ry="18"
        fill="#c9a882"
        transform="rotate(20 92 100)"
      />
      <ellipse cx="44" cy="130" rx="11" ry="9" fill="#c9a882" />
      <ellipse cx="76" cy="130" rx="11" ry="9" fill="#c9a882" />
      <path
        d="M60 104 C60 104 56 100 53 102 C50 104 50 108 53 110 L60 117 L67 110 C70 108 70 104 67 102 C64 100 60 104 60 104Z"
        fill="#e8a89c"
        opacity="0.85"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Chapter 1 — Cover (extracted so router can wrap it)
───────────────────────────────────────────── */
function CoverPage() {
  const [isOpened, setIsOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className={`birthday-page ${mounted ? "is-mounted" : ""}`}>
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <div className="paper-grain" aria-hidden="true" />

      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Back to the beginning">
          <span className="wordmark-initial">T</span>
          <span className="wordmark-text">the little book of us</span>
        </a>
        <span className="page-count">
          chapter <strong>01</strong> <em>/</em> 22
        </span>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow">
            <Sparkles size={14} strokeWidth={1.5} />a birthday story, made just
            for you
          </p>
          <h1 className="cover-title">
            Happy birthday,
            <br />
            <em className="name-em">Tanni.</em>
          </h1>
          <p className="lead">
            For the girl who makes ordinary days feel like they have tiny
            flowers growing in them.
          </p>
          <div className="ink-rule" />
          <p className="hand-note">
            I made you a little place to wander through.
            <br />
            Take your time — there are 22 pages of love inside.
          </p>
          <button
            className={`open-button ${isOpened ? "is-open" : ""}`}
            type="button"
            onClick={() => {
              setIsOpened(true);
              setTimeout(() => navigate("/chapter/2"), 700);
            }}
          >
            <span className="btn-text">
              {isOpened ? "the story is open" : "open your birthday story"}
            </span>
            <span className="btn-icon">
              {isOpened ? (
                <Heart size={17} fill="currentColor" />
              ) : (
                <ArrowUpRight size={17} />
              )}
            </span>
          </button>
          {isOpened && (
            <p className="opened-note" role="status">
              <CakeSlice size={15} />
              Chapter two is waiting just around the corner.
            </p>
          )}
        </div>

        <div className="keepsake" aria-label="Lily and teddy for Tanni">
          <div className="date-stamp">
            <span className="date-day">04</span>
            <span className="date-dot">·</span>
            <span className="date-month">06</span>
            <small className="date-label">her day</small>
          </div>
          <div className="keepsake-illustrations">
            <LilySVG />
            <TeddySVG />
          </div>
          <p className="keepsake-caption">
            <Music2 size={13} />
            <span>a soft little place</span>
            <br />
            <em>for her soft little heart</em>
          </p>
        </div>
      </section>

      <footer className="footer-note">
        <span>made with a pocketful of sunshine</span>
        <Heart size={13} fill="currentColor" className="footer-heart" />
        <span>for Tanni</span>
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Chapter 2 wrapper — adds paper background
───────────────────────────────────────────── */
function Chapter2Wrapper() {
  const navigate = useNavigate();
  return (
    <>
      {/* Shared paper bg behind the balloons page */}
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <BalloonsPage onNext={() => navigate("/chapter/3")} />
    </>
  );
}

function Chapter3Wrapper() {
  const navigate = useNavigate();
  return (
    <>
      {/* Shared paper bg behind the scroll page */}
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <ScrollPage onNext={() => navigate("/chapter/4")} />
    </>
  );
}

function Chapter4Wrapper() {
  const navigate = useNavigate();
  return (
    <>
      {/* Shared paper bg behind the scroll page */}
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <CatchMyHeart onNext={() => navigate("/chapter/5")} />
    </>
  );
}

function Chapter5Wrapper() {
  const navigate = useNavigate();
  return (
    <>
      {/* Shared paper bg behind the scroll page */}
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <FearFundaPage onNext={() => navigate("/chapter/6")} />
    </>
  );
}

function Chapter6Wrapper() {
  const navigate = useNavigate();
  return (
    <>
      {/* Shared paper bg behind the scroll page */}
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <HeartBeat onNext={() => navigate("/chapter/7")} />
    </>
  );
}

function Chapter7Wrapper() {
  const navigate = useNavigate();
  return (
    <>
      {/* Shared paper bg behind the scroll page */}
      <div className="canvas-wrap" aria-hidden="true">
        <ThreeCanvas />
      </div>
      <ILoveYouPuzzle onNext={() => navigate("/chapter/8")} />
    </>
  );
}

function SharedMusic() {
  const { pathname } = useLocation();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isExcluded = MUSIC_EXCLUDED_PATHS.includes(pathname);
  const musicSource = birthdayMusic;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.loop = true;

    if (isExcluded) {
      audio.pause();
      setIsPlaying(false);
      return undefined;
    }

    audio.load();

    const startMusic = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    startMusic();
    window.addEventListener("pointerdown", startMusic, { once: true });
    return () => window.removeEventListener("pointerdown", startMusic);
  }, [isExcluded, musicSource]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={musicSource} preload="auto" loop />
      <button
        className="music-toggle"
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? "Pause birthday music" : "Play birthday music"}
      >
        <Music2 size={15} />
        <span>{isPlaying ? "music on" : "play music"}</span>
      </button>
    </>
  );
}

/* ─────────────────────────────────────────────
   Router root
───────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <SharedMusic />
      <Routes>
        <Route path="/" element={<CoverPage />} />
        <Route path="/chapter/2" element={<Chapter2Wrapper />} />
        <Route path="/chapter/3" element={<Chapter3Wrapper />} />
        <Route path="/chapter/4" element={<Chapter4Wrapper />} />
        <Route path="/chapter/5" element={<Chapter5Wrapper />} />
        <Route path="/chapter/6" element={<Chapter6Wrapper />} />
        <Route path="/chapter/7" element={<Chapter7Wrapper />} />
        {/* Add /chapter/3 … /chapter/22 here as you build them */}
      </Routes>
    </BrowserRouter>
  );
}
