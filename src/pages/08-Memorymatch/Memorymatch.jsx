import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Sparkles, ArrowRight, BookHeart } from "lucide-react";
import "./MemoryMatch.css";

/* ══════════════════════════════════════════════
   MEMORY PAIRS
   Each pair: { id, category, prompt, detail, message }
   prompt + detail are the two cards in the pair.
   message appears when the pair is matched.
══════════════════════════════════════════════ */
const PAIRS = [
  {
    id: 1,
    category: "our first",
    prompt: "Our first hello",
    detail: "a little awkward, a little magic",
    message:
      "I still smile thinking about how nervous we both were. It was the most perfectly imperfect beginning.",
  },
  {
    id: 2,
    category: "nickname",
    prompt: "What I secretly call you",
    detail: "mine",
    message:
      "Because that's what you are. Quietly, completely, happily — mine.",
  },
  {
    id: 3,
    category: "favorite food",
    prompt: "Your comfort food",
    detail: "the face you make eating it",
    message:
      "Pure joy. No filter. That expression is one of my favourite things in the world.",
  },
  {
    id: 4,
    category: "a quote",
    prompt: `"stay a little longer"`,
    detail: "every time we have to say goodbye",
    message:
      "Goodbyes with you never get easier. I think that means something.",
  },
  {
    id: 5,
    category: "little thing",
    prompt: "The way you laugh",
    detail: "when something catches you off guard",
    message:
      "That real laugh — unguarded, full — is the sound I want to keep hearing forever.",
  },
  {
    id: 6,
    category: "our place",
    prompt: "The spot that feels like us",
    detail: "wherever you are, honestly",
    message: "Home isn't a place I found. It's a person. It's you.",
  },
];

/* ══════════════════════════════════════════════
   BUILD CARD DECK — shuffle pairs into 12 cards
══════════════════════════════════════════════ */
function buildDeck() {
  const cards = [];
  PAIRS.forEach((pair) => {
    cards.push({
      uid: `${pair.id}-a`,
      pairId: pair.id,
      side: "prompt",
      category: pair.category,
      text: pair.prompt,
      message: pair.message,
    });
    cards.push({
      uid: `${pair.id}-b`,
      pairId: pair.id,
      side: "detail",
      category: pair.category,
      text: pair.detail,
      message: pair.message,
    });
  });
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/* ══════════════════════════════════════════════
   GOLDEN THREAD CANVAS
   Draws curved lines between matched card pairs
══════════════════════════════════════════════ */
function ThreadCanvas({ matchedPairs, cardRefs, boardRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = board.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    matchedPairs.forEach(([uidA, uidB], idx) => {
      const elA = cardRefs.current[uidA];
      const elB = cardRefs.current[uidB];
      if (!elA || !elB) return;

      const rA = elA.getBoundingClientRect();
      const rB = elB.getBoundingClientRect();
      const x1 = rA.left - rect.left + rA.width / 2;
      const y1 = rA.top - rect.top + rA.height / 2;
      const x2 = rB.left - rect.left + rB.width / 2;
      const y2 = rB.top - rect.top + rB.height / 2;

      // Bezier control points for organic curve
      const cx1 = x1 + (x2 - x1) * 0.25;
      const cy1 = y1 - 30;
      const cx2 = x1 + (x2 - x1) * 0.75;
      const cy2 = y2 - 30;

      // Golden thread gradient
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, "rgba(201,150,60,0.7)");
      grad.addColorStop(0.5, "rgba(240,222,176,0.9)");
      grad.addColorStop(1, "rgba(201,150,60,0.7)");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      // Soft glow
      ctx.shadowColor = "rgba(201,150,60,0.5)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      ctx.stroke();

      // Small gold dot at each endpoint
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#c9963c";
      ctx.beginPath();
      ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [matchedPairs, cardRefs, boardRef]);

  return (
    <canvas ref={canvasRef} className="thread-canvas" aria-hidden="true" />
  );
}

/* ══════════════════════════════════════════════
   TOAST — romantic match message
══════════════════════════════════════════════ */
function MatchToast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="match-toast-wrap" role="status" aria-live="polite">
      <div className="match-toast">
        <p className="toast-eyebrow">✦ memory unlocked ✦</p>
        <p className="toast-message">{message}</p>
        <div className="toast-heart-row">
          {[14, 10, 14].map((s, i) => (
            <Heart
              key={i}
              size={s}
              fill="currentColor"
              style={{ color: ["#e8a89c", "#d4828f", "#e8a89c"][i] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SINGLE CARD
══════════════════════════════════════════════ */
function MemCard({ card, isFlipped, isMatched, isWrong, onClick, cardRef }) {
  return (
    <div
      className={`mem-card ${isFlipped || isMatched ? "is-flipped" : ""} ${isMatched ? "is-matched" : ""} ${isWrong ? "is-wrong" : ""}`}
      onClick={onClick}
      ref={cardRef}
      role="button"
      aria-label={isMatched ? card.text : "Facedown card — click to flip"}
      tabIndex={isMatched ? -1 : 0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="card-inner">
        {/* ── Back ── */}
        <div className="card-back">
          <div className="wax-seal">
            <span className="wax-seal-letter">T</span>
          </div>
          <span className="card-back-label">our story</span>
        </div>

        {/* ── Front ── */}
        <div className="card-front">
          <span className="card-category">{card.category}</span>
          <div className="card-divider" />
          <span className="card-text">{card.text}</span>
          {isMatched && (
            <Heart className="card-matched-pip" size={11} fill="currentColor" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function MemoryMatch({ onNext }) {
  const [mounted, setMounted] = useState(false);
  const [deck] = useState(() => buildDeck());
  const [flipped, setFlipped] = useState([]); // uids currently face-up (max 2)
  const [matched, setMatched] = useState(new Set()); // matched uids
  const [wrong, setWrong] = useState([]); // uids shaking
  const [matchedPairs, setMatchedPairs] = useState([]); // [[uidA,uidB],…] for threads
  const [toast, setToast] = useState(null); // { message }
  const [moves, setMoves] = useState(0);
  const [showFinale, setShowFinale] = useState(false);
  const [locked, setLocked] = useState(false); // block clicks during animation
  const cardRefs = useRef({});
  const boardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleCardClick = useCallback(
    (card) => {
      if (locked) return;
      if (matched.has(card.uid)) return;
      if (flipped.includes(card.uid)) return;
      if (flipped.length >= 2) return;

      const newFlipped = [...flipped, card.uid];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);

        const [uidA, uidB] = newFlipped;
        const cardA = deck.find((c) => c.uid === uidA);
        const cardB = deck.find((c) => c.uid === uidB);

        if (cardA.pairId === cardB.pairId) {
          // ── MATCH ──
          setTimeout(() => {
            const newMatched = new Set(matched);
            newMatched.add(uidA);
            newMatched.add(uidB);
            setMatched(newMatched);
            setMatchedPairs((prev) => [...prev, [uidA, uidB]]);
            setFlipped([]);
            setToast({ message: cardA.message });
            setLocked(false);

            if (newMatched.size === deck.length) {
              setTimeout(() => setShowFinale(true), 3400);
            }
          }, 500);
        } else {
          // ── NO MATCH ──
          setWrong(newFlipped);
          setTimeout(() => {
            setFlipped([]);
            setWrong([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [locked, matched, flipped, deck],
  );

  const matchCount = matchedPairs.length;

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <MatchToast
          key={toast.message}
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}

      {/* ── Finale ── */}
      {showFinale && (
        <div className="match-finale">
          <div className="finale-ribbon">all memories found</div>
          <h2>
            every piece of us,
            <br />
            <em>remembered.</em>
          </h2>
          <p>
            {PAIRS.length} pairs. {moves} moves. And every single one of these
            memories lives in me like a favourite song I keep coming back to.
          </p>
          <p className="match-final-score">
            matched in <strong>{moves} moves</strong>
          </p>
          {onNext && (
            <button className="match-finale-btn" onClick={onNext} type="button">
              keep reading <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* ── Main page ── */}
      {!showFinale && (
        <div className={`match-page ${mounted ? "is-mounted" : ""}`}>
          <div className="paper-grain" aria-hidden="true" />

          {/* Top bar */}
          <header className="topbar">
            <a className="wordmark" href="/" aria-label="Back to cover">
              <span className="wordmark-initial">T</span>
              <span className="wordmark-text">the little book of us</span>
            </a>
            <span className="page-count">
              chapter <strong>08</strong> <em>/</em> 22
            </span>
          </header>

          {/* Header */}
          <div className="match-header">
            <p className="match-eyebrow">
              <BookHeart size={13} strokeWidth={1.5} />
              flip the cards, find the memories
            </p>
            <h1 className="match-title">our little archive</h1>
            <p className="match-subtitle">
              Every card is hiding something real. Find each matching pair to
              unlock a memory — and what it means to me.
            </p>
            <div className="match-score-row">
              <div className="score-chip">
                <Heart
                  size={14}
                  fill="currentColor"
                  style={{ color: "var(--blush)" }}
                />
                <span>found</span>
                <strong>{matchCount}</strong>
                <span style={{ color: "var(--ink-faint)" }}>
                  / {PAIRS.length}
                </span>
              </div>
              <div className="score-divider" />
              <div className="score-chip">
                <Sparkles
                  size={13}
                  strokeWidth={1.5}
                  style={{ color: "var(--gold)" }}
                />
                <span>moves</span>
                <strong style={{ color: "var(--gold)" }}>{moves}</strong>
              </div>
            </div>
          </div>

          {/* Board */}
          <div className="match-board-wrap" ref={boardRef}>
            <ThreadCanvas
              matchedPairs={matchedPairs}
              cardRefs={cardRefs}
              boardRef={boardRef}
            />
            <div
              className="match-board"
              role="grid"
              aria-label="Memory match board"
            >
              {deck.map((card) => (
                <MemCard
                  key={card.uid}
                  card={card}
                  isFlipped={flipped.includes(card.uid)}
                  isMatched={matched.has(card.uid)}
                  isWrong={wrong.includes(card.uid)}
                  onClick={() => handleCardClick(card)}
                  cardRef={(el) => {
                    cardRefs.current[card.uid] = el;
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="match-footer">
            <Heart
              size={13}
              fill="currentColor"
              style={{ color: "var(--blush)" }}
            />
            <span>every memory is a gift I keep re-opening</span>
          </footer>
        </div>
      )}
    </>
  );
}
