import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import "./balloons.css";

/* ─────────────────────────────────────────────
   22 things about Tanni — one per balloon
───────────────────────────────────────────── */
const THINGS = [
  "the way your eyes light up when something makes you happy",
  "how you remember the tiny details no one else notices",
  "your laugh — it fills the whole room without even trying",
  "the kindness you carry quietly everywhere you go",
  "how you make ordinary moments feel worth keeping",
  "the way you love the people in your life so fully",
  "your curiosity — you never stop wanting to know more",
  "how soft your heart is, even when it's been a hard day",
  "the way you say things that stay with me for weeks",
  "your patience, which I secretly admire more than you know",
  "how you find beauty in things most people walk past",
  "the warmth you bring into any room you walk into",
  "your honesty — gentle, but always true",
  "the way you care about the little things, because they're not little",
  "how brave you are, even when you don't feel it",
  "your taste — in music, in words, in everything",
  "the way you listen like what you're hearing actually matters",
  "how you grow, quietly and steadily, every single day",
  "your imagination — the worlds you build inside your head",
  "the way you make people feel seen without trying",
  "how you hold onto hope even when it's difficult",
  "simply being you — that's the best one of all",
];

/* ─────────────────────────────────────────────
   Balloon colours — warm palette from theme
───────────────────────────────────────────── */
const BALLOON_COLORS = [
  { body: "#e8a89c", shine: "#f5c8c0", knot: "#d4828f" }, // blush
  { body: "#c9963c", shine: "#f0deb0", knot: "#a87830" }, // gold
  { body: "#8fad91", shine: "#b8d0ba", knot: "#6b9070" }, // sage
  { body: "#d4b8c8", shine: "#eddde8", knot: "#b898b0" }, // dusty rose
  { body: "#f5c8c0", shine: "#fde8e4", knot: "#e8a89c" }, // pale blush
  { body: "#a08c78", shine: "#c4b0a0", knot: "#7a6858" }, // warm taupe
];

/* ─────────────────────────────────────────────
   Confetti helper
───────────────────────────────────────────── */
const CONFETTI_COLORS = [
  "#e8a89c",
  "#c9963c",
  "#8fad91",
  "#d4b8c8",
  "#f5c8c0",
  "#2e2118",
];

function spawnConfetti(container, cx, cy) {
  for (let i = 0; i < 14; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    const angle = (i / 14) * Math.PI * 2;
    const dist = 40 + Math.random() * 50;
    const tx = `translateX(${Math.cos(angle) * dist}px)`;
    const ty = `translateY(${Math.sin(angle) * dist - 20}px)`;
    const tr = `${(Math.random() - 0.5) * 540}deg`;
    el.style.cssText = `
      left: ${cx}px; top: ${cy}px;
      background: ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};
      --tx: ${tx}; --ty: ${ty}; --tr: ${tr};
      animation-delay: ${Math.random() * 0.08}s;
    `;
    container.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}

/* ─────────────────────────────────────────────
   Single Balloon SVG
───────────────────────────────────────────── */
function BalloonSVG({ color, size = 72 }) {
  const w = size;
  const h = size * 1.3;
  return (
    <svg
      className="balloon-body"
      width={w}
      height={h}
      viewBox="0 0 72 94"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main balloon body */}
      <ellipse cx="36" cy="40" rx="32" ry="36" fill={color.body} />
      {/* Shine highlight */}
      <ellipse
        cx="24"
        cy="22"
        rx="10"
        ry="14"
        fill={color.shine}
        opacity="0.55"
        transform="rotate(-20 24 22)"
      />
      <ellipse
        cx="20"
        cy="16"
        rx="4"
        ry="6"
        fill="white"
        opacity="0.3"
        transform="rotate(-20 20 16)"
      />
      {/* Bottom taper */}
      <path
        d="M28 74 Q36 80 44 74 Q40 78 36 80 Q32 78 28 74Z"
        fill={color.body}
      />
      {/* Knot */}
      <ellipse cx="36" cy="78" rx="4" ry="3" fill={color.knot} />
      {/* Knot highlight */}
      <ellipse cx="35" cy="77" rx="1.5" ry="1" fill="white" opacity="0.3" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Layout positions for 22 balloons
   Spread across the field in a natural cluster
───────────────────────────────────────────── */
function useLayout(count) {
  return useMemo(() => {
    // Rows: 4-5-5-4-4 = 22, positions as % of field
    const grid = [
      // row 1 (top)
      [10, 8],
      [26, 4],
      [42, 7],
      [58, 3],
      [74, 9],
      [90, 5],
      // row 2
      [6, 30],
      [22, 28],
      [38, 24],
      [54, 27],
      [70, 23],
      [86, 29],
      // row 3
      [14, 50],
      [30, 47],
      [46, 45],
      [62, 48],
      [78, 44],
      // row 4
      [8, 68],
      [26, 65],
      [44, 70],
      [62, 66],
      [80, 69],
    ];
    return grid.slice(0, count).map(([x, y], i) => ({
      x,
      y,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      // stagger float phase so they don't all move together
      floatDelay: (i * 0.37) % 4,
      floatDuration: 3.5 + (i % 5) * 0.4,
      size: 62 + (i % 4) * 8, // slight size variation
    }));
  }, [count]);
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function BalloonsPage({ onNext }) {
  const [popped, setPopped] = useState(new Set());
  const [activeBalloon, setActiveBalloon] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const fieldRef = useRef(null);
  const layout = useLayout(22);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (popped.size === 22) {
      const t = setTimeout(() => setShowCelebration(true), 600);
      return () => clearTimeout(t);
    }
  }, [popped]);

  const handlePop = useCallback(
    (index, e) => {
      setActiveBalloon(index);

      // Clicking an open note only brings it to the front.
      if (popped.has(index)) return;

      // spawn confetti at click point relative to field
      if (fieldRef.current) {
        const rect = fieldRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        spawnConfetti(fieldRef.current, cx, cy);
      }

      setPopped((prev) => new Set([...prev, index]));
    },
    [popped],
  );

  return (
    <>
      <div className={`balloons-page ${mounted ? "is-mounted" : ""}`}>
        {/* Paper grain — reuse from global */}
        <div className="paper-grain" aria-hidden="true" />

        {/* Top bar — same as App.jsx */}
        <header className="topbar">
          <a className="wordmark" href="/" aria-label="Back to cover">
            <span className="wordmark-initial">T</span>
            <span className="wordmark-text">the little book of us</span>
          </a>
          <span className="page-count">
            chapter <strong>02</strong> <em>/</em> 22
          </span>
        </header>

        {/* Header copy */}
        <div className="balloons-header">
          <p className="balloons-eyebrow">
            <Sparkles size={13} strokeWidth={1.5} />
            pop every balloon to find out
          </p>
          <h1 className="balloons-title">22 things I love about you</h1>
          <p className="balloons-subtitle">
            Each balloon is hiding something. Tap them one by one — I promise
            every single one is true.
          </p>
          <p className="balloons-counter">
            <span>{popped.size}</span> of 22 popped
          </p>
        </div>

        {/* Balloon field */}
        <div
          className="balloons-field"
          ref={fieldRef}
          aria-label="22 balloons to pop"
        >
          {layout.map((item, i) => {
            const isPopped = popped.has(i);
            return (
              <div
                key={i}
                className={`balloon-wrap ${isPopped ? "popped" : ""}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  zIndex: activeBalloon === i ? 100 : isPopped ? 10 : 1,
                  // float animation via CSS custom props
                  animation: isPopped
                    ? "none"
                    : `balloonFloat ${item.floatDuration}s ease-in-out ${item.floatDelay}s infinite`,
                }}
                onClick={(e) => handlePop(i, e)}
                role="button"
                tabIndex={0}
                aria-label={
                  isPopped ? `Balloon ${i + 1}: popped` : `Pop balloon ${i + 1}`
                }
                onKeyDown={(e) => e.key === "Enter" && handlePop(i, e)}
              >
                {!isPopped && (
                  <>
                    <BalloonSVG color={item.color} size={item.size} />
                    <div className="balloon-string" />
                  </>
                )}

                {/* Note revealed after pop */}
                {isPopped && (
                  <div className="balloon-note">
                    <p className="balloon-note-number">№ {i + 1}</p>
                    <p className="balloon-note-text">{THINGS[i]}</p>
                    <div className="balloon-note-heart">
                      <Heart size={14} fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="balloons-footer">
          <Heart
            size={13}
            fill="currentColor"
            style={{ color: "var(--blush)" }}
          />
          <span>every word is meant, every word is true</span>
        </footer>
      </div>

      {/* All-popped celebration overlay */}
      {showCelebration && (
        <div
          className="celebration-banner"
          role="dialog"
          aria-label="All balloons popped"
        >
          <Sparkles size={36} style={{ color: "var(--gold)" }} />
          <h2>
            all 22 found,
            <br />
            <em style={{ color: "var(--blush)", fontStyle: "italic" }}>
              Tanni.
            </em>
          </h2>
          <p>
            And these are just the ones I could write down. There are more — far
            too many to fit in 22 balloons.
          </p>
          {onNext && (
            <button className="celebration-next" onClick={onNext} type="button">
              keep going <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
