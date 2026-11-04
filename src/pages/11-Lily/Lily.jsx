import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Heart, ArrowRight } from "lucide-react";
import "./Lily.css";

/* ══════════════════════════════════════════════
   22 LILY MESSAGES
══════════════════════════════════════════════ */
const LILY_MESSAGES = [
  "I love the way you make even the smallest things feel special.",
  "You bloom slowly, beautifully, and in your own perfect time.",
  "The way you laugh makes the whole world feel lighter.",
  "You carry kindness so naturally — it just flows out of you.",
  "Every ordinary moment becomes something worth keeping with you in it.",
  "You are softer and stronger than you know.",
  "The way you notice things others miss is one of my favourite things.",
  "You make people feel seen. That is rare and precious.",
  "Your heart holds more warmth than any lantern here.",
  "I love how you love — fully, quietly, without needing applause.",
  "You're the kind of person who makes rooms brighter just by entering them.",
  "The way you care about small things tells me everything about your big heart.",
  "You are patient in ways that take real courage.",
  "I notice you every single day. Every single time.",
  "You are someone's favourite part of every story.",
  "The world is genuinely better with you in it.",
  "Your imagination turns ordinary things into something worth marvelling at.",
  "You love deeply. That is your superpower.",
  "I think about the way you say things long after you've said them.",
  "You are exactly the kind of person poems are written about.",
  "Everything you touch becomes a little more beautiful.",
  "And this is where our real story begins — with you, always with you.",
];

/* ══════════════════════════════════════════════
   LILY POSITIONS — scattered on the water
   Each: { x: % from left, y: % from top of pond, size, pinkness }
══════════════════════════════════════════════ */
const LILY_POSITIONS = [
  { x: 12, y: 28, size: 68, hue: 345 },
  { x: 26, y: 18, size: 54, hue: 350 },
  { x: 38, y: 36, size: 80, hue: 340 },
  { x: 52, y: 12, size: 60, hue: 355 },
  { x: 48, y: 28, size: 90, hue: 338 }, // large centre
  { x: 62, y: 38, size: 72, hue: 348 },
  { x: 72, y: 20, size: 58, hue: 342 },
  { x: 82, y: 32, size: 66, hue: 352 },
  { x: 88, y: 18, size: 50, hue: 346 },
  { x: 20, y: 52, size: 76, hue: 336 },
  { x: 35, y: 58, size: 64, hue: 344 },
  { x: 50, y: 55, size: 85, hue: 340 }, // large centre-bottom
  { x: 66, y: 52, size: 70, hue: 350 },
  { x: 78, y: 58, size: 62, hue: 354 },
  { x: 8, y: 62, size: 56, hue: 338 },
  { x: 92, y: 50, size: 58, hue: 348 },
  { x: 42, y: 72, size: 72, hue: 342 },
  { x: 58, y: 68, size: 66, hue: 346 },
  { x: 24, y: 75, size: 52, hue: 352 },
  { x: 75, y: 72, size: 60, hue: 340 },
  { x: 12, y: 80, size: 48, hue: 356 },
  { x: 88, y: 76, size: 54, hue: 344 },
];

/* ══════════════════════════════════════════════
   LANTERN POSITIONS
══════════════════════════════════════════════ */
const LANTERNS = [
  {
    x: 5,
    y: 30,
    postH: 55,
    warm: "#ffb84a",
    wFar: "rgba(255,160,50,0.3)",
    size: 22,
  },
  {
    x: 95,
    y: 40,
    postH: 40,
    warm: "#ffcc66",
    wFar: "rgba(255,180,80,0.25)",
    size: 18,
  },
  {
    x: 8,
    y: 78,
    postH: 25,
    warm: "#ffaa38",
    wFar: "rgba(255,140,40,0.3)",
    size: 26,
  },
  {
    x: 92,
    y: 72,
    postH: 20,
    warm: "#ffbb55",
    wFar: "rgba(255,160,60,0.28)",
    size: 20,
  },
];

const SKY_LANTERNS = [
  { x: 35, y: 18, dur: "4.2s" },
  { x: 55, y: 12, dur: "5.1s" },
  { x: 70, y: 22, dur: "3.8s" },
  { x: 80, y: 10, dur: "4.7s" },
  { x: 48, y: 8, dur: "5.5s" },
];

/* ══════════════════════════════════════════════
   LILY PAD positions (behind flowers)
══════════════════════════════════════════════ */
const PADS = [
  { x: 14, y: 30, w: 90, h: 32 },
  { x: 27, y: 22, w: 70, h: 25 },
  { x: 40, y: 38, w: 100, h: 36 },
  { x: 53, y: 14, w: 78, h: 28 },
  { x: 50, y: 30, w: 115, h: 40 },
  { x: 63, y: 42, w: 90, h: 32 },
  { x: 73, y: 24, w: 76, h: 27 },
  { x: 83, y: 34, w: 84, h: 30 },
  { x: 21, y: 56, w: 96, h: 34 },
  { x: 36, y: 62, w: 82, h: 29 },
  { x: 51, y: 58, w: 108, h: 38 },
  { x: 67, y: 56, w: 88, h: 32 },
  { x: 79, y: 62, w: 80, h: 28 },
  { x: 43, y: 75, w: 92, h: 32 },
  { x: 59, y: 72, w: 84, h: 30 },
  { x: 76, y: 76, w: 78, h: 28 },
];

/* ══════════════════════════════════════════════
   SVG LILY FLOWER
   bud = closed petals; bloom = open
══════════════════════════════════════════════ */
function LilySVG({ size, hue, bloomed }) {
  const petals = 6;
  const petalW = size * 0.22;
  const petalH = size * 0.44;
  const cx = size / 2;
  const cy = size * 0.58;

  // colour from hue
  const petalFill = `hsl(${hue}, 60%, ${bloomed ? 82 : 70}%)`;
  const petalFillInner = `hsl(${hue}, 55%, ${bloomed ? 92 : 78}%)`;
  const petalStroke = `hsl(${hue}, 45%, 65%)`;
  const centreCol = `hsl(${hue + 20}, 70%, 78%)`;
  const stemCol = "#2d5a1e";

  return (
    <svg
      className="lily-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Stem */}
      <line
        x1={cx}
        y1={size * 0.96}
        x2={cx}
        y2={cy + size * 0.04}
        stroke={stemCol}
        strokeWidth={size * 0.04}
        strokeLinecap="round"
      />

      {/* Petals — 6 around the centre */}
      {Array.from({ length: petals }, (_, i) => {
        const rot = (i / petals) * 360;
        const px = cx;
        const py = cy - petalH * 0.48;
        return (
          <g
            key={i}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: bloomed
                ? `rotate(${rot}deg)`
                : `rotate(${rot}deg) scaleY(0.52)`,
              transition: `transform ${0.5 + i * 0.06}s cubic-bezier(0.34,1.56,0.64,1)`,
            }}
          >
            <ellipse
              cx={px}
              cy={py}
              rx={petalW / 2}
              ry={petalH / 2}
              fill={petalFill}
              stroke={petalStroke}
              strokeWidth={size * 0.008}
              opacity={0.9}
            />
            {/* Inner lighter stripe */}
            <ellipse
              cx={px}
              cy={py + petalH * 0.06}
              rx={petalW * 0.28}
              ry={petalH * 0.36}
              fill={petalFillInner}
              opacity={0.6}
            />
          </g>
        );
      })}

      {/* Inner petals layer — shorter, brighter */}
      {Array.from({ length: petals }, (_, i) => {
        const rot = (i / petals) * 360 + 30;
        const py = cy - petalH * 0.3;
        return (
          <g
            key={`inner-${i}`}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: bloomed
                ? `rotate(${rot}deg) scaleY(0.75)`
                : `rotate(${rot}deg) scaleY(0.35)`,
              transition: `transform ${0.6 + i * 0.06}s cubic-bezier(0.34,1.56,0.64,1) 0.08s`,
            }}
          >
            <ellipse
              cx={cx}
              cy={py}
              rx={petalW * 0.38}
              ry={petalH * 0.32}
              fill={petalFillInner}
              opacity={0.85}
            />
          </g>
        );
      })}

      {/* Centre stamen circle */}
      <circle cx={cx} cy={cy} r={size * 0.09} fill={centreCol} opacity={0.95} />
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.055}
        fill={`hsl(${hue + 30},80%,92%)`}
        opacity={0.9}
      />

      {/* Glow ring when bloomed */}
      {bloomed && (
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.13}
          fill="none"
          stroke={`hsla(${hue},70%,85%,0.5)`}
          strokeWidth={size * 0.04}
          style={{ filter: `blur(${size * 0.025}px)` }}
        />
      )}
    </svg>
  );
}

/* ══════════════════════════════════════════════
   SPARKLE BURST on bloom
══════════════════════════════════════════════ */
function SparkleBurst({ hue }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 28 + Math.random() * 24;
        return {
          tx: `translateX(${Math.cos(angle) * dist}px)`,
          ty: `translateY(${Math.sin(angle) * dist}px)`,
          dur: `${0.5 + Math.random() * 0.3}s`,
          delay: `${Math.random() * 0.15}s`,
        };
      }),
    [],
  );

  return (
    <div className="lily-sparkles">
      {dots.map((d, i) => (
        <div
          key={i}
          className="sparkle-dot"
          style={{
            left: "50%",
            top: "50%",
            background: `hsl(${hue}, 70%, 80%)`,
            "--s-tx": d.tx,
            "--s-ty": d.ty,
            "--s-dur": d.dur,
            "--s-delay": d.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   POPUP CARD
══════════════════════════════════════════════ */
function LilyPopup({ lily, message, screenX, screenY, onClose }) {
  // Position above the lily, centred
  const cardW = 230;
  const left = Math.max(
    10,
    Math.min(window.innerWidth - cardW - 10, screenX - cardW / 2),
  );
  const top = screenY - 160;

  return (
    <div className="lily-popup" style={{ left, top }}>
      <div className="lily-popup-card">
        <button
          className="popup-close"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <p className="popup-lily-num">Lily #{lily.id + 1}</p>
        <p className="popup-message">{message}</p>
        <div className="popup-heart">♡</div>
      </div>
      <div className="popup-tail" />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function LilyGarden({ onNext }) {
  const [mounted, setMounted] = useState(false);
  const [bloomed, setBloomed] = useState(new Set());
  const [popup, setPopup] = useState(null); // { idx, x, y }
  const [showSpecial, setSpecial] = useState(false);
  const pondRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const bloomCount = bloomed.size;

  const handleLilyInteract = useCallback((idx, e) => {
    // Bloom it
    setBloomed((prev) => new Set([...prev, idx]));

    // Show popup
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top;
    setPopup({ idx, x: cx, y: cy });
  }, []);

  const handleLilyHover = useCallback((idx) => {
    // Bloom on hover too (no popup on hover, just flower opens)
    setBloomed((prev) => new Set([...prev, idx]));
  }, []);

  const handleBloomAll = useCallback(() => {
    // Staggered bloom all
    LILY_POSITIONS.forEach((_, i) => {
      setTimeout(() => {
        setBloomed((prev) => new Set([...prev, i]));
      }, i * 120);
    });
  }, []);

  useEffect(() => {
    if (bloomCount >= LILY_POSITIONS.length) {
      setTimeout(() => setSpecial(true), 1000);
    }
  }, [bloomCount]);

  const progressPct = (bloomCount / LILY_POSITIONS.length) * 100;

  return (
    <>
      {/* Popup */}
      {popup !== null && (
        <LilyPopup
          lily={{ id: popup.idx }}
          message={LILY_MESSAGES[popup.idx]}
          screenX={popup.x}
          screenY={popup.y}
          onClose={() => setPopup(null)}
        />
      )}

      <div className={`lily-page ${mounted ? "is-mounted" : ""}`}>
        {/* Topbar */}
        <header className="lily-topbar">
          <a className="lily-wordmark" href="/" aria-label="Back to cover">
            <span className="lily-wordmark-initial">T</span>
            <span className="lily-wordmark-text">the little book of us</span>
          </a>
          <span className="lily-chapter">
            chapter <strong>11</strong> <em>/</em> 22
          </span>
        </header>

        {/* Page header */}
        <div className="lily-header">
          <h1 className="lily-title">
            A Lily For Every <em className="lily-title-heart">You</em> ♡
          </h1>
          <p className="lily-desc">
            Each lily here blossoms just like you — slowly, beautifully, and in
            your own time.
          </p>
          <p className="lily-hint">
            Hover or click on a lily and let it bloom ♡
          </p>
        </div>

        {/* Side decoration — garden sign */}
        <div className="garden-sign">
          <div className="garden-sign-board">
            a little
            <br />
            garden
            <br />
            for the girl
            <br />
            who makes
            <br />
            my world
            <br />
            brighter
            <br />♡
          </div>
          <div className="garden-sign-post" />
        </div>

        {/* Side quote */}
        <div className="garden-quote-right">
          <p>
            Just like these lilies, you make everything around you more
            beautiful
          </p>
          <Heart
            size={16}
            fill="currentColor"
            style={{ marginLeft: "auto", color: "rgba(245,160,176,0.45)" }}
          />
        </div>

        {/* POND SCENE */}
        <div className="pond-scene" ref={pondRef}>
          <div className="mountains" />
          <div className="water-surface">
            <div className="water-shimmer" />
          </div>

          {/* Sky lanterns */}
          {SKY_LANTERNS.map((l, i) => (
            <div
              key={i}
              className="sky-lantern"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
            >
              <div className="sky-lantern-body" style={{ "--dur": l.dur }} />
            </div>
          ))}

          {/* Standing lanterns */}
          {LANTERNS.map((l, i) => (
            <div
              key={i}
              className="lantern"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
            >
              <div
                className="lantern-body"
                style={{
                  width: l.size,
                  height: l.size * 1.3,
                  background: `radial-gradient(ellipse at 50% 35%, white 0%, ${l.warm} 45%, rgba(100,60,20,0.8) 100%)`,
                  "--glow": l.warm,
                  "--glow-far": l.wFar,
                  "--inner": l.warm,
                }}
              >
                <div
                  className="lantern-glow"
                  style={{
                    width: l.size * 2.5,
                    height: l.size * 2.5,
                    background: l.warm,
                  }}
                />
              </div>
              <div className="lantern-post" style={{ height: l.postH }} />
            </div>
          ))}

          {/* Lily pads */}
          {PADS.map((p, i) => (
            <div
              key={i}
              className="lily-pad"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.w,
                height: p.h,
                transform: `translate(-50%, -50%) rotate(${(i * 37) % 360}deg)`,
                opacity: 0.55 + (i % 3) * 0.12,
              }}
            />
          ))}

          {/* LILIES */}
          {LILY_POSITIONS.map((lp, i) => {
            const isBloomed = bloomed.has(i);
            const petalGlow = `hsla(${lp.hue}, 70%, 80%, 0.7)`;
            const petalGlowFar = `hsla(${lp.hue}, 60%, 70%, 0.3)`;

            return (
              <div
                key={i}
                className={`lily-wrap ${isBloomed ? "bloomed" : ""}`}
                style={{
                  left: `${lp.x}%`,
                  top: `${lp.y}%`,
                  transform: "translate(-50%, -50%)",
                  "--petal-glow": petalGlow,
                  "--petal-glow-far": petalGlowFar,
                }}
                onClick={(e) => handleLilyInteract(i, e)}
                onMouseEnter={() => handleLilyHover(i)}
                role="button"
                tabIndex={0}
                aria-label={
                  isBloomed
                    ? `Lily ${i + 1}: bloomed`
                    : `Lily ${i + 1}: click to bloom`
                }
                onKeyDown={(e) => e.key === "Enter" && handleLilyInteract(i, e)}
              >
                <LilySVG size={lp.size} hue={lp.hue} bloomed={isBloomed} />
                <div className="lily-glow" style={{ background: petalGlow }} />
                {isBloomed && <SparkleBurst hue={lp.hue} />}
              </div>
            );
          })}
        </div>

        {/* Bottom stone — Watch all bloom */}
        <div className="stone-sign">
          <div
            className="stone-sign-rock"
            onClick={handleBloomAll}
            role="button"
            tabIndex={0}
            aria-label="Watch all lilies bloom"
            onKeyDown={(e) => e.key === "Enter" && handleBloomAll()}
          >
            <p>Watch all lilies bloom</p>
            <div className="stone-play">▷</div>
          </div>
        </div>

        {/* Bottom right stone */}
        <div className="stone-you">
          <div className="stone-you-rock">
            <p>You make life blossom ♡</p>
          </div>
        </div>

        {/* Special message overlay when all bloomed */}
        {showSpecial && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 250,
              background:
                "radial-gradient(ellipse at center, rgba(20,8,40,0.92) 0%, rgba(10,5,25,0.97) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              textAlign: "center",
              padding: 40,
              animation: "fadeIn 0.8s ease",
            }}
          >
            <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
            <div style={{ fontSize: 44 }}>🌸</div>
            <h2
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontSize: "clamp(34px, 5vw, 58px)",
                fontWeight: 700,
                color: "#ffecd8",
                textShadow: "0 0 40px rgba(255,180,120,0.5)",
                lineHeight: 1.2,
              }}
            >
              Every petal, every light,
              <br />
              <em style={{ color: "#f5a0b0", fontStyle: "italic" }}>
                every moment — for you.
              </em>
            </h2>
            <p
              style={{
                fontFamily: '"Caveat", cursive',
                fontSize: 19,
                color: "rgba(255,220,190,0.75)",
                maxWidth: "36ch",
                lineHeight: 1.6,
              }}
            >
              All 22 lilies bloomed. Just like you — each one more beautiful
              than the last.
            </p>
            {onNext && (
              <button
                onClick={onNext}
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(245,237,224,0.92)",
                  color: "#2e2118",
                  border: "none",
                  borderRadius: 100,
                  padding: "14px 28px",
                  fontFamily: '"Caveat", cursive',
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 8,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                  transition: "all 0.25s",
                }}
              >
                keep reading <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* Bottom bar */}
        <footer className="lily-bottom-bar">
          <span className="lily-count-text">
            <strong>{bloomCount}</strong> / {LILY_POSITIONS.length}
          </span>
          <div className="lily-progress-bar">
            <div
              className="lily-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="lily-blossomed-label">lilies blossomed</span>
          <button
            className="lily-special-btn"
            onClick={() => {
              handleBloomAll();
              setTimeout(
                () => setSpecial(true),
                LILY_POSITIONS.length * 130 + 500,
              );
            }}
            type="button"
          >
            A special message for you ♡
          </button>
        </footer>
      </div>
    </>
  );
}
