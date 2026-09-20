import { useState, useEffect, useCallback } from "react";
import { Heart, Sparkles, ArrowUpRight, ArrowRight } from "lucide-react";
import "./CompletementGenrator.css";

/* ══════════════════════════════════════════════
   COMPLIMENTS — Specific, real, personal
══════════════════════════════════════════════ */
const COMPLIMENTS = [
  "The way you think about problems makes me feel less alone in mine.",
  "You remember the small things people mention once and bring them up months later. That's rare.",
  "Your laugh is so genuine it makes other people want to laugh even if they don't know why.",
  "The kindness in your eyes when someone's struggling — you see people when they feel invisible.",
  "You make ordinary moments feel like they matter. Because with you, they do.",
  "The way you care about little details in everything — food, conversations, how people feel — is beautiful.",
  "You're brave about the things that scare you. You do them anyway, quietly.",
  "Your honesty is gentle. You tell the truth without making people feel small.",
  "The way you listen — like you're not waiting for your turn to talk. You actually hear people.",
  "You make me want to be better, not because you ask, but because you already are.",
  "Your curiosity about people is disarming. Everyone feels interesting when they're around you.",
  "You bring light into rooms that didn't know they were dark.",
  "You love fiercely, but without needing to be loud about it. That's strength.",
  "You remember how people take their coffee. You remember their fears. You remember their dreams.",
  "Your sense of humour cuts through tension in a way that heals instead of hurts.",
  "You move through the world with intention. Nothing about you is accidental.",
  "You're selfless in a way that doesn't feel like sacrifice. It's just who you are.",
  "Your imagination is contagious. You make me believe in things I'd stopped dreaming about.",
  "You support people quietly and steadily. They know they can count on you without you ever saying it.",
  "You see potential in people before they see it in themselves. That is a gift.",
  "Your softness isn't weakness. It's the strongest thing about you.",
  "The way you say my name makes me feel like I'm somebody's favourite person.",
  "You make me feel like it's okay to be exactly who I am.",
  "Your presence is a comfort — not because you fix things, but because you're just there.",
  "The way you love is patient and kind and never keeps score.",
  "You see the best in people and somehow make them want to live up to it.",
  "Your smile reaches your eyes in a way that looks like you're holding a secret joy.",
  "The way you talk about things you love — you make them sound like poetry.",
  "You're the kind of person who makes it safe to be vulnerable.",
  "The way you light up when you're happy is something I will never stop noticing.",
];

/* Pick next unseen index, return null if all seen */
function pickNext(seen, total) {
  const unseen = Array.from({ length: total }, (_, i) => i).filter(
    (i) => !seen.has(i),
  );
  if (!unseen.length) return null;
  return unseen[Math.floor(Math.random() * unseen.length)];
}

export default function ComplimentGenerator({ onNext }) {
  const [mounted, setMounted] = useState(false);
  const [idx, setIdx] = useState(null);
  const [seen, setSeen] = useState(new Set());
  const [textKey, setTextKey] = useState(0); // forces re-animation on change
  const [isLoading, setIsLoading] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  // Last 3 unlocked (excluding current)
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Show first compliment on mount
  useEffect(() => {
    if (!mounted) return;
    const first = pickNext(new Set(), COMPLIMENTS.length);
    setIdx(first);
    setSeen(new Set([first]));
  }, [mounted]);

  const handleNext = useCallback(() => {
    if (isLoading) return;

    if (seen.size >= COMPLIMENTS.length) {
      setShowFinale(true);
      return;
    }

    setIsLoading(true);

    // Save current to trail
    if (idx !== null) {
      setTrail((prev) => [COMPLIMENTS[idx], ...prev].slice(0, 3));
    }

    setTimeout(() => {
      const next = pickNext(seen, COMPLIMENTS.length);
      if (next === null) {
        setShowFinale(true);
        return;
      }
      const newSeen = new Set([...seen, next]);
      setSeen(newSeen);
      setIdx(next);
      setTextKey((k) => k + 1);
      setIsLoading(false);
    }, 320);
  }, [isLoading, seen, idx]);

  const progress = seen.size / COMPLIMENTS.length;
  const allSeen = seen.size >= COMPLIMENTS.length;

  return (
    <>
      {/* ── Finale ── */}
      {showFinale && (
        <div className="compliment-finale">
          <Sparkles size={36} style={{ color: "var(--gold)" }} />
          <h2>
            thirty true things,
            <br />
            <em>Tanni.</em>
          </h2>
          <p>
            These are just the ones I could put into words. The real list is
            longer than any page — every moment with you adds another one.
          </p>
          <p className="finale-count">
            all <strong>{COMPLIMENTS.length}</strong> unlocked
          </p>
          {onNext && (
            <button
              className="compliment-finale-btn"
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
        <div className={`compliment-page ${mounted ? "is-mounted" : ""}`}>
          <div className="paper-grain" aria-hidden="true" />

          {/* Top bar */}
          <header className="topbar">
            <a className="wordmark" href="/" aria-label="Back to cover">
              <span className="wordmark-initial">T</span>
              <span className="wordmark-text">the little book of us</span>
            </a>
            <span className="page-count">
              chapter <strong>09</strong> <em>/</em> 22
            </span>
          </header>

          {/* Header */}
          <div className="compliment-header">
            <p className="compliment-eyebrow">
              <Sparkles size={14} strokeWidth={1.5} />
              things I see when I look at you
            </p>
            <h1 className="compliment-title">
              you are,
              <br />
              <em>Tanni.</em>
            </h1>
            <div className="ink-rule-ch9" />
            <p className="compliment-lead">
              Press the button. Each one is something real I notice.
              <br />
              Each one is true.
            </p>
          </div>

          {/* Stage */}
          <div className="compliment-stage">
            {/* Keepsake card — same glass as chapter 1's keepsake */}
            {idx !== null && (
              <div className="compliment-keepsake">
                <span className="compliment-number">
                  № {seen.size} of {COMPLIMENTS.length}
                </span>

                <div className="ink-rule-ch9" />

                <p className="compliment-text text-animate" key={textKey}>
                  {COMPLIMENTS[idx]}
                </p>

                <div className="compliment-by">
                  <Heart size={12} fill="currentColor" />
                  someone who loves you
                </div>
              </div>
            )}

            {/* CTA button — exact .open-button design */}
            <button
              className={`compliment-cta ${isLoading ? "is-loading" : ""}`}
              onClick={handleNext}
              type="button"
              aria-label={allSeen ? "See finale" : "Show next compliment"}
            >
              <span>{allSeen ? "see them all" : "tell me more"}</span>
              <span className="cta-icon">
                {allSeen ? (
                  <Heart size={17} fill="currentColor" />
                ) : (
                  <ArrowUpRight size={17} />
                )}
              </span>
            </button>

            {/* Progress */}
            <div className="compliment-progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="progress-label">
                {seen.size} / {COMPLIMENTS.length}
              </span>
            </div>

            {/* Trail — last few unlocked, shown below in fading handwriting */}
            {trail.length > 0 && (
              <div
                className="compliment-trail"
                aria-label="Previously unlocked"
              >
                {trail.map((t, i) => (
                  <div
                    key={i}
                    className="trail-item"
                    style={{ opacity: 0.55 - i * 0.14 }}
                  >
                    <span className="trail-dot" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="compliment-footer">
            <Heart
              size={13}
              fill="currentColor"
              style={{ color: "var(--blush)" }}
            />
            <span>
              these are the things I notice that make me love you more
            </span>
          </footer>
        </div>
      )}
    </>
  );
}
