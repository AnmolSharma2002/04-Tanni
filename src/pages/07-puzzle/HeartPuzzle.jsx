import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import "./HeartPuzzle.css";

/* ══════════════════════════════════════════════
   HEART GEOMETRY
   ViewBox 0 0 340 320, tip at (170,270)
  Three segments divide at x=110 and x=230,
   both lines run down to the tip (170,270).
══════════════════════════════════════════════ */

// Full heart outline (for dashed guide + clip)
const HEART_FULL =
  "M170,270 C170,270 40,185 40,115 C40,72 72,48 110,48 C135,48 155,62 170,78 C185,62 205,48 230,48 C268,48 300,72 300,115 C300,185 170,270 170,270 Z";

// LEFT segment — "I"
// Follows the exact left side of the heart, then closes at the tip.
const SEG_I = "M 110,48 C 72,48 40,72 40,115 C 40,185 170,270 170,270 Z";

// CENTRE segment — "♡"
// Exact top arch between the two split-points, down to tip
const SEG_HEART =
  "M 110,48 C 135,48 155,62 170,78 C 185,62 205,48 230,48 L 170,270 Z";

// RIGHT segment — "U"
// Follows the exact right side of the heart, then closes at the tip.
const SEG_U = "M 230,48 C 268,48 300,72 300,115 C 300,185 170,270 170,270 Z";

// Where each letter sits (cx, cy) in the 340×320 viewbox
const LABEL_POS = {
  I: { x: 88, y: 180 },
  HEART: { x: 170, y: 155 },
  U: { x: 252, y: 180 },
};

const PIECES = [
  {
    id: "I",
    content: "I",
    color: "#e8a89c",
    seg: SEG_I,
    label: "the 'I'",
    scaleLabel: "I",
  },
  {
    id: "HEART",
    content: "♡",
    color: "#d4828f",
    seg: SEG_HEART,
    label: "the heart",
    scaleLabel: "♡",
  },
  {
    id: "U",
    content: "U",
    color: "#c9963c",
    seg: SEG_U,
    label: "the 'U'",
    scaleLabel: "U",
  },
];

/* ══════════════════════════════════════════════
   TRAY PIECE — heart-segment shaped SVG icon
  Scaled down to a clear, draggable size from the 340×320 viewbox
══════════════════════════════════════════════ */
function PieceSVG({ piece, size = 124 }) {
  // Each piece SVG uses same 340×320 viewBox, just scaled down
  return (
    <svg
      width={size}
      height={size * (320 / 340)}
      viewBox="0 0 340 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "block",
        filter: "drop-shadow(0 6px 18px rgba(46,33,24,0.18))",
      }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`glow-${piece.id}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Piece fill */}
      <path d={piece.seg} fill={piece.color} opacity="0.95" />
      {/* Shine */}
      <path d={piece.seg} fill="url(#shine)" opacity="0.18" />
      {/* Soft edge */}
      <path
        d={piece.seg}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
      />
      {/* Letter */}
      <text
        x={LABEL_POS[piece.id].x}
        y={LABEL_POS[piece.id].y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Dancing Script, cursive"
        fontSize={piece.id === "HEART" ? "60" : "80"}
        fontWeight="700"
        fill="white"
        opacity="0.95"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {piece.content}
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   ENVELOPE SVG
══════════════════════════════════════════════ */
function EnvelopeSVG({ opened }) {
  return (
    <svg
      width="90"
      height="72"
      viewBox="0 0 90 72"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="18"
        width="86"
        height="52"
        rx="7"
        fill="#f0deb0"
        stroke="#c9963c"
        strokeWidth="1.5"
      />
      {/* Bottom V fold lines */}
      <line
        x1="2"
        y1="18"
        x2="45"
        y2="46"
        stroke="#c9963c"
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1="88"
        y1="18"
        x2="45"
        y2="46"
        stroke="#c9963c"
        strokeWidth="1"
        opacity="0.35"
      />
      {/* Flap */}
      <path
        d={opened ? "M 2,18 L 88,18" : "M 2,18 L 45,44 L 88,18"}
        fill={opened ? "none" : "#f5ede0"}
        stroke="#c9963c"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Seal heart (only when closed) */}
      {!opened && (
        <path
          d="M45,40 C45,40 40,34 37,37 C34,40 34,44 37,46 L45,53 L53,46 C56,44 56,40 53,37 C50,34 45,40 45,40Z"
          fill="#d4828f"
        />
      )}
      {/* Heart piece peeking out when open */}
      {opened && (
        <g transform="translate(22, 2)">
          <svg width="46" height="44" viewBox="0 0 340 320">
            <path d={SEG_HEART} fill="#d4828f" opacity="0.95" />
            <text
              x="170"
              y="155"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Dancing Script, cursive"
              fontSize="60"
              fontWeight="700"
              fill="white"
              opacity="0.9"
            >
              ♡
            </text>
          </svg>
        </g>
      )}
    </svg>
  );
}

/* ══════════════════════════════════════════════
   SPARKLES
══════════════════════════════════════════════ */
function spawnSparkles(container, cx, cy, color) {
  for (let i = 0; i < 14; i++) {
    const el = document.createElement("div");
    el.className = "sparkle";
    const angle = (i / 14) * Math.PI * 2;
    const d = 35 + Math.random() * 65;
    el.style.cssText = `
      left:${cx}px; top:${cy}px;
      width:${6 + Math.random() * 6}px; height:${6 + Math.random() * 6}px;
      border-radius:50%;
      background:${color};
      --tx:translateX(${Math.cos(angle) * d}px);
      --ty:translateY(${Math.sin(angle) * d}px);
      animation-delay:${Math.random() * 0.08}s;
    `;
    container.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ILoveYouPuzzle({ onNext }) {
  const [mounted, setMounted] = useState(false);
  const [placed, setPlaced] = useState({});
  const [envelopeOpened, setEnvOpen] = useState(false);
  const [heartReady, setHeartReady] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [overHeart, setOverHeart] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [burst, setBurst] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const openEnvelope = useCallback(() => {
    if (envelopeOpened) return;
    setEnvOpen(true);
    setTimeout(() => setHeartReady(true), 500);
  }, [envelopeOpened]);

  const startDrag = useCallback(
    (e, pieceId) => {
      if (placed[pieceId]) return;
      if (pieceId === "HEART" && !heartReady) return;
      e.preventDefault();
      const isTouch = e.type === "touchstart";
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
      // Get the piece element's bounding rect so we can offset the ghost correctly
      const el = document.getElementById(`piece-${pieceId}`);
      const rect = el?.getBoundingClientRect() ?? {
        left: clientX - 48,
        top: clientY - 48,
        width: 96,
        height: 90,
      };
      setDragState({
        id: pieceId,
        // offset from pointer to piece top-left corner
        offX: clientX - rect.left,
        offY: clientY - rect.top,
        curX: clientX,
        curY: clientY,
        rect,
      });
    },
    [placed, heartReady],
  );

  const onMove = useCallback(
    (e) => {
      if (!dragState) return;
      e.preventDefault();
      const isTouch = e.type === "touchmove";
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
      setDragState((d) => ({ ...d, curX: clientX, curY: clientY }));

      const zone = document.getElementById("heart-zone");
      if (zone) {
        const r = zone.getBoundingClientRect();
        setOverHeart(
          clientX >= r.left &&
            clientX <= r.right &&
            clientY >= r.top &&
            clientY <= r.bottom,
        );
      }
    },
    [dragState],
  );

  const onEnd = useCallback(
    (e) => {
      if (!dragState) return;
      e.preventDefault();
      const id = dragState.id;

      const zone = document.getElementById("heart-zone");
      let dropped = false;
      if (zone) {
        const r = zone.getBoundingClientRect();
        dropped =
          dragState.curX >= r.left &&
          dragState.curX <= r.right &&
          dragState.curY >= r.top &&
          dragState.curY <= r.bottom;
      }

      if (dropped && !placed[id]) {
        const newPlaced = { ...placed, [id]: true };
        setPlaced(newPlaced);
        if (pageRef.current && zone) {
          const r = zone.getBoundingClientRect();
          const piece = PIECES.find((p) => p.id === id);
          spawnSparkles(
            pageRef.current,
            r.left + r.width / 2,
            r.top + r.height / 2,
            piece.color,
          );
        }
        if (PIECES.every((p) => newPlaced[p.id])) {
          setBurst(true);
          setTimeout(() => setBurst(false), 1000);
          setTimeout(() => setShowFinale(true), 1200);
        }
      }

      setDragState(null);
      setOverHeart(false);
    },
    [dragState, placed],
  );

  useEffect(() => {
    if (!dragState) return;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [dragState, onMove, onEnd]);

  // Ghost piece while dragging
  const draggingPiece = dragState
    ? PIECES.find((p) => p.id === dragState.id)
    : null;
  const ghostLeft = dragState ? dragState.curX - dragState.offX : 0;
  const ghostTop = dragState ? dragState.curY - dragState.offY : 0;

  return (
    <>
      {/* ── Dragging ghost ── */}
      {draggingPiece && (
        <div
          style={{
            position: "fixed",
            left: ghostLeft,
            top: ghostTop,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "rotate(5deg) scale(1.1)",
            filter: "drop-shadow(0 20px 40px rgba(46,33,24,0.28))",
            opacity: 0.92,
          }}
        >
          <PieceSVG piece={draggingPiece} size={124} />
        </div>
      )}

      {/* ── Finale ── */}
      {showFinale && (
        <div className="puzzle-finale">
          <div className="finale-hearts-row">
            {["#e8a89c", "#d4828f", "#c9963c", "#d4b8c8", "#8fad91"].map(
              (c, i) => (
                <Heart
                  key={i}
                  size={20 + i * 4}
                  fill="currentColor"
                  style={{ color: c }}
                />
              ),
            )}
          </div>
          <div className="finale-big-text">I ♡ U</div>
          <h2>
            you put it together,
            <br />
            <em>Tanni.</em>
          </h2>
          <p>
            Three little pieces — and together they make the only thing I've
            wanted to say since the first page. I love you. So much it needed a
            whole puzzle.
          </p>
          {onNext && (
            <button
              className="puzzle-finale-btn"
              onClick={onNext}
              type="button"
            >
              keep reading <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* ── Main Page ── */}
      {!showFinale && (
        <div
          className={`puzzle-page ${mounted ? "is-mounted" : ""}`}
          ref={pageRef}
        >
          <div className="paper-grain" aria-hidden="true" />

          <header className="topbar">
            <a className="wordmark" href="/" aria-label="Back to cover">
              <span className="wordmark-initial">T</span>
              <span className="wordmark-text">the little book of us</span>
            </a>
            <span className="page-count">
              chapter <strong>07</strong> <em>/</em> 22
            </span>
          </header>

          <div className="puzzle-header">
            <p className="puzzle-eyebrow">
              <Sparkles size={13} strokeWidth={1.5} />
              three pieces, one message
            </p>
            <h1 className="puzzle-title">put it together</h1>
            <p className="puzzle-subtitle">
              Drag each piece into the heart. The middle one is hidden — open
              the envelope first.
            </p>
          </div>

          <div className="puzzle-stage">
            {/* ── Heart drop zone ── */}
            <div
              id="heart-zone"
              className="heart-drop-zone"
              aria-label="Heart drop zone"
            >
              <svg
                className="heart-drop-svg"
                viewBox="0 0 340 320"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <clipPath id="hc">
                    <path d={HEART_FULL} />
                  </clipPath>
                  <radialGradient id="shine" cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Paper background inside the heart */}
                <path d={HEART_FULL} fill="rgba(245,237,224,0.6)" />

                {/* Ghost guides — faint segment outlines when not yet placed */}
                {!placed["I"] && (
                  <path
                    d={SEG_I}
                    fill="rgba(232,168,156,0.1)"
                    stroke="rgba(232,168,156,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}
                {!placed["HEART"] && (
                  <path
                    d={SEG_HEART}
                    fill="rgba(212,130,143,0.1)"
                    stroke="rgba(212,130,143,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}
                {!placed["U"] && (
                  <path
                    d={SEG_U}
                    fill="rgba(201,150,60,0.1)"
                    stroke="rgba(201,150,60,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Placed segments — solid fill matching the piece colour */}
                {placed["I"] && (
                  <path
                    d={SEG_I}
                    fill="#e8a89c"
                    opacity="0.93"
                    style={{
                      animation:
                        "pieceLandSVG 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  />
                )}
                {placed["HEART"] && (
                  <path
                    d={SEG_HEART}
                    fill="#d4828f"
                    opacity="0.93"
                    style={{
                      animation:
                        "pieceLandSVG 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  />
                )}
                {placed["U"] && (
                  <path
                    d={SEG_U}
                    fill="#c9963c"
                    opacity="0.93"
                    style={{
                      animation:
                        "pieceLandSVG 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  />
                )}

                {/* Shine overlay (clipped to heart) */}
                {(placed["I"] || placed["HEART"] || placed["U"]) && (
                  <path d={HEART_FULL} fill="url(#shine)" clipPath="url(#hc)" />
                )}

                {/* Letters on placed segments */}
                {placed["I"] && (
                  <text
                    x={LABEL_POS.I.x}
                    y={LABEL_POS.I.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Dancing Script, cursive"
                    fontSize="72"
                    fontWeight="700"
                    fill="white"
                    opacity="0.95"
                    style={{ userSelect: "none" }}
                  >
                    I
                  </text>
                )}
                {placed["HEART"] && (
                  <text
                    x={LABEL_POS.HEART.x}
                    y={LABEL_POS.HEART.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Dancing Script, cursive"
                    fontSize="58"
                    fill="white"
                    opacity="0.95"
                    style={{ userSelect: "none" }}
                  >
                    ♡
                  </text>
                )}
                {placed["U"] && (
                  <text
                    x={LABEL_POS.U.x}
                    y={LABEL_POS.U.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Dancing Script, cursive"
                    fontSize="72"
                    fontWeight="700"
                    fill="white"
                    opacity="0.95"
                    style={{ userSelect: "none" }}
                  >
                    U
                  </text>
                )}

                {/* Ghost letter hints for empty slots */}
                {!placed["I"] && (
                  <text
                    x={LABEL_POS.I.x}
                    y={LABEL_POS.I.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Dancing Script, cursive"
                    fontSize="72"
                    fontWeight="700"
                    fill="rgba(160,140,120,0.18)"
                    style={{ userSelect: "none" }}
                  >
                    I
                  </text>
                )}
                {!placed["HEART"] && (
                  <text
                    x={LABEL_POS.HEART.x}
                    y={LABEL_POS.HEART.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Dancing Script, cursive"
                    fontSize="58"
                    fill="rgba(160,140,120,0.18)"
                    style={{ userSelect: "none" }}
                  >
                    ♡
                  </text>
                )}
                {!placed["U"] && (
                  <text
                    x={LABEL_POS.U.x}
                    y={LABEL_POS.U.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Dancing Script, cursive"
                    fontSize="72"
                    fontWeight="700"
                    fill="rgba(160,140,120,0.18)"
                    style={{ userSelect: "none" }}
                  >
                    U
                  </text>
                )}

                {/* Outer heart dashed outline */}
                <path
                  d={HEART_FULL}
                  fill="none"
                  stroke={overHeart ? "#e8a89c" : "rgba(232,168,156,0.35)"}
                  strokeWidth={overHeart ? "3.5" : "2.5"}
                  strokeDasharray={overHeart ? "none" : "10 6"}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                />

                {/* Segment divider lines (always visible as guides) */}
                <line
                  x1="110"
                  y1="48"
                  x2="170"
                  y2="270"
                  stroke="rgba(160,140,120,0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <line
                  x1="230"
                  y1="48"
                  x2="170"
                  y2="270"
                  stroke="rgba(160,140,120,0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />

                {/* Burst glow when complete */}
                {burst && (
                  <path
                    d={HEART_FULL}
                    fill="rgba(255,210,200,0.5)"
                    style={{ animation: "burstGlow 1s ease-out forwards" }}
                  />
                )}
              </svg>
            </div>

            {/* ── Tray pieces ── */}
            <div className="pieces-tray">
              {PIECES.map((piece) => {
                const isHeart = piece.id === "HEART";
                const isLocked = isHeart && !heartReady;
                const isPlaced = !!placed[piece.id];
                const isDragging = dragState?.id === piece.id;

                return (
                  <div
                    key={piece.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      id={`piece-${piece.id}`}
                      className={`drag-piece ${isPlaced ? "placed" : ""} ${isDragging ? "dragging" : ""}`}
                      style={{
                        opacity: isLocked ? 0 : isDragging ? 0.25 : 1,
                        transition: "opacity 0.4s",
                        cursor: isLocked || isPlaced ? "default" : "grab",
                      }}
                      onMouseDown={
                        !isLocked && !isPlaced
                          ? (e) => startDrag(e, piece.id)
                          : undefined
                      }
                      onTouchStart={
                        !isLocked && !isPlaced
                          ? (e) => startDrag(e, piece.id)
                          : undefined
                      }
                      role={isLocked || isPlaced ? "img" : "button"}
                      aria-label={`Drag the ${piece.label} into the heart`}
                      tabIndex={isLocked || isPlaced ? -1 : 0}
                    >
                      <PieceSVG piece={piece} size={124} />
                    </div>
                    <span
                      className="piece-label"
                      style={{
                        opacity: isPlaced ? 0 : 1,
                        color: isLocked ? "transparent" : undefined,
                      }}
                    >
                      {isLocked ? "in envelope" : piece.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Envelope ── */}
            {!placed["HEART"] && (
              <div className="envelope-wrap">
                <button
                  className={`envelope-btn ${envelopeOpened ? "opened" : ""}`}
                  onClick={openEnvelope}
                  aria-label="Open envelope to get the heart piece"
                  type="button"
                >
                  <EnvelopeSVG opened={envelopeOpened} />
                </button>
                <span className="envelope-label">
                  {envelopeOpened ? "take the ♡ piece ↑" : "open me first ↑"}
                </span>
              </div>
            )}
          </div>

          <footer className="puzzle-footer">
            <Heart
              size={13}
              fill="currentColor"
              style={{ color: "var(--blush)" }}
            />
            <span>some things are worth putting together</span>
          </footer>
        </div>
      )}
    </>
  );
}
