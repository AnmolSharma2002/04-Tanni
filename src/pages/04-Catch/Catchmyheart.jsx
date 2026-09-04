import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Heart, Sparkles, ArrowRight, Play } from "lucide-react";
import * as THREE from "three";
import "./catchmyheart.css";

/* ══════════════════════════════════════════════
   CONSTANTS & CONFIG
══════════════════════════════════════════════ */
const GAME_W = 560;
const GAME_H = 480;
const BASKET_W = 90;
const BASKET_H = 36;
const BASKET_Y_OFFSET = 56; // from bottom
const PETAL_RADIUS = 16;
const TOTAL_LOVE = 100;
const PETAL_COLORS = [
  "#e8a89c",
  "#f5c8c0",
  "#d4b8c8",
  "#c9963c",
  "#f0deb0",
  "#8fad91",
  "#d4828f",
];

/* ══════════════════════════════════════════════
   THREE.JS — 3D HEART RAIN (finale)
══════════════════════════════════════════════ */

/** One 3D heart mesh using a parametric approach */
function Heart3D({ position, rotation, scale, speed, drift, phase, color }) {
  const mesh = useRef();

  // Build heart shape geometry once
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Heart curve using bezier — classic heart silhouette
    shape.moveTo(0, 0.5);
    shape.bezierCurveTo(0, 0.9, -0.6, 0.9, -0.6, 0.5);
    shape.bezierCurveTo(-0.6, 0.1, 0, -0.2, 0, -0.6);
    shape.bezierCurveTo(0, -0.2, 0.6, 0.1, 0.6, 0.5);
    shape.bezierCurveTo(0.6, 0.9, 0, 0.9, 0, 0.5);

    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();

    // Fall downward, wrap at bottom
    const yRange = 28;
    const rawY = position[1] - speed * t * 0.6;
    mesh.current.position.y = ((rawY + 14) % yRange) - 14 + phase * 2;
    mesh.current.position.x = position[0] + Math.sin(t * drift + phase) * 1.6;
    mesh.current.position.z = position[2];

    // Gentle tumble
    mesh.current.rotation.x = rotation[0] + t * 0.3 + phase;
    mesh.current.rotation.y = rotation[1] + t * 0.5;
    mesh.current.rotation.z = rotation[2] + Math.sin(t * 0.4 + phase) * 0.4;

    // Subtle pulsing scale
    const pulse = 1 + Math.sin(t * 2.5 + phase) * 0.06;
    mesh.current.scale.setScalar(scale * pulse);
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={position}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.15}
        metalness={0.05}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

const HEART_COLORS = [
  "#e8a89c",
  "#d4828f",
  "#f5c8c0",
  "#c9963c",
  "#d4b8c8",
  "#f0deb0",
  "#8fad91",
  "#e87878",
];

function HeartRainScene() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 26,
          Math.random() * 28 - 2,
          (Math.random() - 0.5) * 8 - 2,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: 0.3 + Math.random() * 0.65,
        speed: 0.5 + Math.random() * 0.8,
        drift: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: HEART_COLORS[i % HEART_COLORS.length],
      })),
    [],
  );

  // Slow camera drift
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(clock.getElapsedTime() * 0.08) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.6} color="#fff8f0" />
      <directionalLight position={[6, 10, 6]} intensity={1.4} color="#ffe8c8" />
      <directionalLight
        position={[-6, 4, -4]}
        intensity={0.7}
        color="#f5c8c0"
      />
      <pointLight position={[0, 4, 6]} intensity={1.0} color="#e8a89c" />
      {hearts.map((h) => (
        <Heart3D key={h.id} {...h} />
      ))}
    </group>
  );
}

/* ══════════════════════════════════════════════
   CANVAS 2D GAME ENGINE
══════════════════════════════════════════════ */

function useGameEngine(canvasRef, state, setState, onWin) {
  const gameRef = useRef({
    petals: [],
    particles: [],
    basketX: GAME_W / 2,
    targetX: GAME_W / 2,
    score: 0,
    love: 0,
    spawnTimer: 0,
    spawnInterval: 90, // frames between spawns
    speed: 2.2,
    frame: 0,
    mouseX: null,
    animId: null,
    running: false,
  });

  const spawnPetal = useCallback(() => {
    const g = gameRef.current;
    g.petals.push({
      x: PETAL_RADIUS + Math.random() * (GAME_W - PETAL_RADIUS * 2),
      y: -PETAL_RADIUS,
      vy: g.speed + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.8,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.03,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      r: PETAL_RADIUS - 2 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      caught: false,
      missed: false,
    });
  }, []);

  const spawnParticles = useCallback((x, y, color) => {
    const g = gameRef.current;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      g.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        decay: 0.04 + Math.random() * 0.03,
        color,
        r: 3 + Math.random() * 4,
      });
    }
  }, []);

  const drawHeart = useCallback((ctx, x, y, size, color, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(
      x,
      y + size * 0.6,
      x - size * 0.55,
      y + size * 0.6,
      x - size * 0.55,
      y + size * 0.3,
    );
    ctx.bezierCurveTo(x - size * 0.55, y, x, y - size * 0.1, x, y + size * 0.3);
    ctx.bezierCurveTo(
      x,
      y - size * 0.1,
      x + size * 0.55,
      y,
      x + size * 0.55,
      y + size * 0.3,
    );
    ctx.bezierCurveTo(
      x + size * 0.55,
      y + size * 0.6,
      x,
      y + size * 0.6,
      x,
      y + size * 0.3,
    );
    ctx.fill();
    ctx.restore();
  }, []);

  const drawBasket = useCallback(
    (ctx, bx) => {
      const by = GAME_H - BASKET_Y_OFFSET;
      const w = BASKET_W;
      const h = BASKET_H;

      // Shadow
      ctx.save();
      ctx.shadowColor = "rgba(46,33,24,0.15)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;

      // Main body — lily-shaped catcher (rounded trapezoid)
      ctx.beginPath();
      ctx.moveTo(bx - w / 2 + 10, by - h / 2);
      ctx.lineTo(bx + w / 2 - 10, by - h / 2);
      ctx.quadraticCurveTo(bx + w / 2, by - h / 2, bx + w / 2, by - h / 2 + 8);
      ctx.lineTo(bx + w / 2 - 6, by + h / 2);
      ctx.quadraticCurveTo(
        bx + w / 2 - 6,
        by + h / 2 + 4,
        bx + w / 2 - 14,
        by + h / 2 + 4,
      );
      ctx.lineTo(bx - w / 2 + 14, by + h / 2 + 4);
      ctx.quadraticCurveTo(
        bx - w / 2 + 6,
        by + h / 2 + 4,
        bx - w / 2 + 6,
        by + h / 2,
      );
      ctx.lineTo(bx - w / 2, by - h / 2 + 8);
      ctx.quadraticCurveTo(bx - w / 2, by - h / 2, bx - w / 2 + 10, by - h / 2);
      ctx.closePath();
      ctx.fillStyle = "#c9a882";
      ctx.fill();
      ctx.restore();

      // Inner belly
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(bx, by + 2, w / 2 - 12, h / 2 - 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#d4b896";
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.restore();

      // Tiny heart on basket
      drawHeart(ctx, bx, by + 2, 8, "#e8a89c", 0.8);

      // Rim highlight
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx - w / 2 + 12, by - h / 2 + 4);
      ctx.lineTo(bx + w / 2 - 12, by - h / 2 + 4);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    },
    [drawHeart],
  );

  const drawPetal = useCallback((ctx, p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = 0.88;

    // Petal body — teardrop shape
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.bezierCurveTo(p.r * 0.7, -p.r * 0.4, p.r * 0.7, p.r * 0.6, 0, p.r);
    ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.6, -p.r * 0.7, -p.r * 0.4, 0, -p.r);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Shine
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(
      -p.r * 0.15,
      -p.r * 0.3,
      p.r * 0.25,
      p.r * 0.4,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore();
  }, []);

  const tick = useCallback(() => {
    const g = gameRef.current;
    if (!g.running || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = GAME_W;
    const H = GAME_H;

    // Clear
    ctx.clearRect(0, 0, W * dpr, H * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "rgba(245,237,224,0)");
    bg.addColorStop(1, "rgba(239,228,208,0.4)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid lines (like paper)
    ctx.strokeStyle = "rgba(160,140,120,0.06)";
    ctx.lineWidth = 1;
    for (let yy = 40; yy < H; yy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(W, yy);
      ctx.stroke();
    }

    g.frame++;

    // Smooth basket tracking
    if (g.mouseX !== null) {
      g.targetX = Math.max(BASKET_W / 2, Math.min(W - BASKET_W / 2, g.mouseX));
    }
    g.basketX += (g.targetX - g.basketX) * 0.12;

    // Spawn
    g.spawnTimer++;
    if (g.spawnTimer >= g.spawnInterval) {
      g.spawnTimer = 0;
      spawnPetal();
      // Gradually increase difficulty
      if (g.spawnInterval > 40) g.spawnInterval -= 0.4;
      if (g.speed < 4.5) g.speed += 0.02;
    }

    const basketTop = H - BASKET_Y_OFFSET - BASKET_H / 2;
    const basketBot = H - BASKET_Y_OFFSET + BASKET_H / 2;

    // Update & draw petals
    g.petals = g.petals.filter((p) => {
      if (p.caught || p.missed) return false;

      p.y += p.vy;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotSpeed;

      // Catch detection
      if (
        p.y + p.r >= basketTop &&
        p.y - p.r <= basketBot &&
        p.x >= g.basketX - BASKET_W / 2 - p.r &&
        p.x <= g.basketX + BASKET_W / 2 + p.r
      ) {
        p.caught = true;
        g.score++;
        g.love = Math.min(TOTAL_LOVE, g.love + 4.5);
        spawnParticles(p.x, p.y, p.color);
        setState((s) => ({ ...s, score: g.score, love: g.love }));
        if (g.love >= TOTAL_LOVE) {
          g.running = false;
          setTimeout(() => onWin(g.score), 400);
        }
        return false;
      }

      // Miss detection
      if (p.y - p.r > H) {
        p.missed = true;
        g.love = Math.max(0, g.love - 1.5);
        setState((s) => ({ ...s, love: g.love }));
        return false;
      }

      drawPetal(ctx, p);
      return true;
    });

    // Particles
    g.particles = g.particles.filter((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.12;
      pt.life -= pt.decay;
      if (pt.life <= 0) return false;

      ctx.save();
      ctx.globalAlpha = pt.life * 0.9;
      // Draw tiny heart as particle
      drawHeart(ctx, pt.x, pt.y, pt.r, pt.color, pt.life);
      ctx.restore();
      return true;
    });

    // Draw basket
    drawBasket(ctx, g.basketX);

    ctx.restore();
    g.animId = requestAnimationFrame(tick);
  }, [
    canvasRef,
    spawnPetal,
    spawnParticles,
    drawPetal,
    drawBasket,
    drawHeart,
    setState,
    onWin,
  ]);

  const start = useCallback(() => {
    const g = gameRef.current;
    g.petals = [];
    g.particles = [];
    g.basketX = GAME_W / 2;
    g.targetX = GAME_W / 2;
    g.score = 0;
    g.love = 0;
    g.spawnTimer = 0;
    g.spawnInterval = 88;
    g.speed = 2.2;
    g.frame = 0;
    g.running = true;
    if (g.animId) cancelAnimationFrame(g.animId);
    g.animId = requestAnimationFrame(tick);
    setState({ phase: "playing", score: 0, love: 0 });
  }, [tick, setState]);

  const stop = useCallback(() => {
    const g = gameRef.current;
    g.running = false;
    if (g.animId) cancelAnimationFrame(g.animId);
  }, []);

  const setMouseX = useCallback((x) => {
    gameRef.current.mouseX = x;
  }, []);

  const setTargetX = useCallback((x) => {
    gameRef.current.targetX = x;
  }, []);

  // Setup canvas DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_W * dpr;
    canvas.height = GAME_H * dpr;
    canvas.style.width = GAME_W + "px";
    canvas.style.height = GAME_H + "px";
  }, [canvasRef]);

  // Cleanup
  useEffect(() => () => stop(), [stop]);

  return { start, stop, setMouseX, setTargetX };
}

/* ══════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════ */
export default function CatchMyHeart({ onNext }) {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState({
    phase: "idle",
    score: 0,
    love: 0,
  });
  const [showFinale, setShowFinale] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useMemo(() => "ontouchstart" in window, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleWin = useCallback((score) => {
    setFinalScore(score);
    setShowFinale(true);
  }, []);

  const engine = useGameEngine(canvasRef, gameState, setGameState, handleWin);

  // Mouse movement over canvas
  const handleMouseMove = useCallback(
    (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = GAME_W / rect.width;
      engine.setMouseX((e.clientX - rect.left) * scaleX);
    },
    [engine],
  );

  // Touch movement
  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const touch = e.touches[0];
      const scaleX = GAME_W / rect.width;
      engine.setMouseX((touch.clientX - rect.left) * scaleX);
    },
    [engine],
  );

  // Keyboard
  useEffect(() => {
    if (gameState.phase !== "playing") return;
    const STEP = 22;
    let held = {};
    let raf;
    const g = () => {
      if (held["ArrowLeft"] || held["a"])
        engine.setTargetX(
          Math.max(
            BASKET_W / 2,
            (engine.setTargetX._last || GAME_W / 2) - STEP,
          ),
        );
      if (held["ArrowRight"] || held["d"])
        engine.setTargetX(
          Math.min(
            GAME_W - BASKET_W / 2,
            (engine.setTargetX._last || GAME_W / 2) + STEP,
          ),
        );
      raf = requestAnimationFrame(g);
    };

    // Simpler arrow key approach — move target directly
    const onKey = (e) => {
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key)) {
        e.preventDefault();
        // We'll use gameRef via engine's setTargetX — just shift mouse X
        const shift = e.key === "ArrowLeft" || e.key === "a" ? -STEP : STEP;
        engine.setMouseX(null); // stop mouse tracking
        // Use a closure to track position
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [gameState.phase, engine]);

  const lovePercent = Math.round((gameState.love / TOTAL_LOVE) * 100);

  return (
    <>
      {/* ── 3D Heart Rain Canvas (finale) ── */}
      {showFinale && (
        <div className="heart-rain-canvas">
          <Canvas
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0, 14], fov: 60 }}
            dpr={[1, 2]}
            style={{ width: "100%", height: "100%" }}
          >
            <HeartRainScene />
          </Canvas>
        </div>
      )}

      {/* ── Finale overlay ── */}
      {showFinale && (
        <div className="finale-overlay interactive">
          <Sparkles size={40} style={{ color: "var(--gold)" }} />
          <h2 className="finale-title">
            you caught
            <br />
            <em>every one,</em>
            <br />
            Tanni.
          </h2>
          <p className="finale-sub">
            Just like you catch all the little things in life that most people
            miss. That's one of my favourite things about you.
          </p>
          <p className="finale-score">
            petals caught: <strong>{finalScore}</strong>
          </p>
          {onNext && (
            <button className="finale-next" onClick={onNext} type="button">
              keep reading <ArrowRight size={17} />
            </button>
          )}
        </div>
      )}

      {/* ── Main page ── */}
      {!showFinale && (
        <div className={`catch-page ${mounted ? "is-mounted" : ""}`}>
          <div className="paper-grain" aria-hidden="true" />

          {/* Top bar */}
          <header className="topbar">
            <a className="wordmark" href="/" aria-label="Back to cover">
              <span className="wordmark-initial">T</span>
              <span className="wordmark-text">the little book of us</span>
            </a>
            <span className="page-count">
              chapter <strong>04</strong> <em>/</em> 22
            </span>
          </header>

          {/* Header */}
          <div className="ch4-header">
            <p className="ch4-eyebrow">
              <Sparkles size={13} strokeWidth={1.5} />a little game, just for
              you
            </p>
            <h1 className="ch4-title">catch my heart</h1>
            <p className="ch4-subtitle">
              Petals are falling. Catch them with your basket to fill the love
              meter — then something beautiful happens.
            </p>
          </div>

          {/* Love meter */}
          {gameState.phase === "playing" && (
            <div className="love-meter-wrap">
              <span className="love-meter-label">love</span>
              <div
                className="love-meter-track"
                role="progressbar"
                aria-valuenow={lovePercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="love-meter-fill"
                  style={{ width: `${lovePercent}%` }}
                />
              </div>
              <Heart
                size={16}
                fill="currentColor"
                className="love-meter-icon"
              />
            </div>
          )}

          {/* Game canvas */}
          <div className="game-wrap">
            <div
              className="game-canvas-container"
              ref={containerRef}
              style={{ width: `min(${GAME_W}px, 96vw)`, height: GAME_H + "px" }}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              aria-label="Catch the falling petals game"
            >
              <canvas ref={canvasRef} />

              {/* Score pill (during play) */}
              {gameState.phase === "playing" && (
                <div className="score-pill">
                  caught <span>{gameState.score}</span>
                </div>
              )}

              {/* IDLE overlay */}
              {gameState.phase === "idle" && (
                <div className="game-overlay">
                  <Heart
                    size={48}
                    fill="currentColor"
                    className="overlay-icon"
                  />
                  <h2 className="overlay-title">ready to play?</h2>
                  <p className="overlay-sub">
                    Move your cursor or finger to guide the basket. Catch the
                    falling petals. Fill the love meter.
                  </p>
                  {!isMobile && (
                    <p className="overlay-keys">
                      or use <span className="key-chip">← →</span> arrow keys
                    </p>
                  )}
                  <button
                    className="overlay-btn"
                    type="button"
                    onClick={engine.start}
                  >
                    <Play size={16} fill="currentColor" /> start catching
                  </button>
                </div>
              )}
            </div>
          </div>

          {isMobile && gameState.phase === "playing" && (
            <p className="touch-hint">
              slide your finger across the screen to move the basket
            </p>
          )}

          {/* Footer */}
          <footer className="ch4-footer">
            <Heart
              size={13}
              fill="currentColor"
              style={{ color: "var(--blush)" }}
            />
            <span>every petal you catch is something I feel for you</span>
          </footer>
        </div>
      )}
    </>
  );
}
