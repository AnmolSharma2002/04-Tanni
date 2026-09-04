import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, ChevronRight, Volume2, VolumeX } from "lucide-react";
import scrollMusic from "../../assets/scroll.mp3";
import "./Scrollpage.css";

/* ─────────────────────────────────────────
   Song data
───────────────────────────────────────── */
const SONG_SECTIONS = [
  {
    type: "verse",
    label: "verse i",
    lines: [
      "Jaan-e-tamanna, jaan-e-ada, tujhe",
      "Jaisa hai socha paaya wo hi",
      "Sooraj ki kirnon sa ik chehra",
      "Dekha hai tumsa maine nahiin",
    ],
  },
  {
    type: "pre-chorus",
    label: "pre-chorus",
    lines: [
      "Meri mohabbat ka har lamha",
      "Tujh mein hi gum sa gaya",
      "Na main hoon aashiq, na main deewaana",
      "Kah do mujhe jo, piya",
    ],
  },
  {
    type: "chorus",
    label: "chorus",
    lines: [
      "Tera-mera hai pyaar amar",
      "Tu chaahe to qadmon mein sar rakh doon",
      "Ye jeewan kya, gar maange tu",
      "Meri jaan nazar kar doon",
      "Tera-mera hai pyaar amar",
    ],
  },
  {
    type: "verse",
    label: "verse ii",
    lines: [
      "Noor-e-jahaan aur noor-e-mohabbat",
      "Donon jude tujh se, piya",
      '"Paagal" ya "Jogi" mujhko kaho tum',
      "Haan, mera ishq sab se juda",
    ],
  },
  {
    type: "pre-chorus",
    label: "pre-chorus",
    lines: [
      "Teri hi khaatir loon sau janam main",
      "Chaahe ho jo bhi bhala",
      "Na main hoon aashiq, na main deewaana",
      "Kah do mujhe jo, piya",
    ],
  },
  {
    type: "chorus",
    label: "chorus",
    lines: [
      "Tera-mera hai pyaar amar",
      "Tu chaahe to qadmon mein sar rakh doon",
      "Ye jeewan kya, gar maange tu",
      "Meri jaan nazar kar doon",
      "Tera-mera hai pyaar amar",
    ],
  },
  {
    type: "verse",
    label: "verse iii",
    lines: [
      "Jab se mili tu, dil ko yaqeen hai",
      "Tere liye hi main hoon bana",
      "Loota hai dil ko teri ada ne",
      "Ye kaisa mujh pe jaadu kiya?",
    ],
  },
  {
    type: "pre-chorus",
    label: "pre-chorus",
    lines: [
      "Meri dua mein, meri sada mein",
      "Hota hai naam tera",
      "Na main hoon aashiq, na main deewaana",
      "Kah do mujhe jo, piya",
    ],
  },
  {
    type: "chorus",
    label: "chorus — finale",
    lines: [
      "Tera-mera hai pyaar amar",
      "Tu chaahe to qadmon mein sar rakh doon",
      "Ye jeewan kya, gar maange tu",
      "Meri jaan nazar kar doon",
      "Ye jeewan kya, gar maange tu (jaan-e-wafa)",
      "Meri jaan nazar kar doon (jaan-e-ada)",
      "Ye jeewan kya, gar maange tu",
      "Meri jaan nazar kar doon",
    ],
  },
];

/* ─────────────────────────────────────────
   Burnt corner SVG overlay
───────────────────────────────────────── */
function BurntCorners() {
  return (
    <svg
      className="burnt-corners"
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* top-left burn */}
      <path d="M0,0 Q18,4 22,0 Q10,18 0,22 Z" fill="#1a0e06" opacity="0.82" />
      <path d="M0,0 Q30,6 36,0 Q18,30 0,36 Z" fill="#2e1a08" opacity="0.45" />
      <path d="M0,0 Q50,10 58,0 Q28,50 0,58 Z" fill="#3d2210" opacity="0.18" />
      {/* top-right burn */}
      <path
        d="M400,0 Q382,4 378,0 Q390,18 400,22 Z"
        fill="#1a0e06"
        opacity="0.82"
      />
      <path
        d="M400,0 Q370,6 364,0 Q382,30 400,36 Z"
        fill="#2e1a08"
        opacity="0.45"
      />
      <path
        d="M400,0 Q350,10 342,0 Q372,50 400,58 Z"
        fill="#3d2210"
        opacity="0.18"
      />
      {/* bottom-left burn */}
      <path
        d="M0,600 Q18,596 22,600 Q10,582 0,578 Z"
        fill="#1a0e06"
        opacity="0.82"
      />
      <path
        d="M0,600 Q30,594 36,600 Q18,570 0,564 Z"
        fill="#2e1a08"
        opacity="0.45"
      />
      <path
        d="M0,600 Q50,590 58,600 Q28,550 0,542 Z"
        fill="#3d2210"
        opacity="0.18"
      />
      {/* bottom-right burn */}
      <path
        d="M400,600 Q382,596 378,600 Q390,582 400,578 Z"
        fill="#1a0e06"
        opacity="0.82"
      />
      <path
        d="M400,600 Q370,594 364,600 Q382,570 400,564 Z"
        fill="#2e1a08"
        opacity="0.45"
      />
      <path
        d="M400,600 Q350,590 342,600 Q372,550 400,542 Z"
        fill="#3d2210"
        opacity="0.18"
      />
      {/* edge char marks */}
      <path d="M80,0 Q90,3 100,0 Q95,8 85,5 Z" fill="#2e1a08" opacity="0.3" />
      <path
        d="M260,0 Q268,2 276,0 Q272,7 264,4 Z"
        fill="#2e1a08"
        opacity="0.25"
      />
      <path
        d="M0,180 Q3,188 0,196 Q8,192 5,184 Z"
        fill="#2e1a08"
        opacity="0.28"
      />
      <path
        d="M400,300 Q397,308 400,316 Q392,312 395,304 Z"
        fill="#2e1a08"
        opacity="0.25"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Wood-grain case illustration
───────────────────────────────────────── */
function CaseIllustration({ isOpen, onClick }) {
  return (
    <div
      className={`case-scene ${isOpen ? "case-open" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={isOpen ? "Case is open" : "Click to open the case"}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Case body (bottom) */}
      <div className="case-body">
        <div className="case-wood-grain" />
        <div className="case-interior">
          <div className="case-velvet" />
          <div className="case-indent" />
        </div>
        {/* Latch */}
        <div className="case-latch" />
      </div>

      {/* Case lid (top — rotates open) */}
      <div className="case-lid-wrap">
        <div className="case-lid">
          <div className="case-wood-grain" />
          <div className="case-lid-inner" />
          {/* Decorative keyhole */}
          <div className="case-keyhole">
            <svg viewBox="0 0 20 28" fill="none">
              <circle cx="10" cy="8" r="5" stroke="#c9963c" strokeWidth="1.5" />
              <path
                d="M7 13 L7 24 Q10 26 13 24 L13 13"
                stroke="#c9963c"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
          {/* Hint label */}
          {!isOpen && (
            <motion.span
              className="case-hint"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              tap to open
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Scroll in the case (before it's unwrapped)
───────────────────────────────────────── */
function ScrollInCase({ isVisible, onBowClick }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="scroll-in-case"
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 160,
            damping: 18,
            delay: 0.3,
          }}
        >
          {/* Scroll body */}
          <div className="scroll-body">
            {/* Rolled end caps */}
            <div className="scroll-cap scroll-cap-top" />
            <div className="scroll-cap scroll-cap-bottom" />
            {/* Paper texture in middle */}
            <div className="scroll-paper-peek" />
          </div>

          {/* Pink bow */}
          <motion.button
            className="bow-button"
            onClick={onBowClick}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Untie the bow to open the scroll"
          >
            <BowSVG />
            <motion.span
              className="bow-hint"
              animate={{ opacity: [0.6, 1, 0.6], y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              untie me ✦
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Pink bow SVG
───────────────────────────────────────── */
function BowSVG() {
  return (
    <svg
      className="bow-svg"
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden="true"
    >
      {/* Left loop */}
      <path
        d="M60,40 Q30,10 8,18 Q2,30 8,38 Q30,48 60,40 Z"
        fill="#f5c8c0"
        stroke="#e8a89c"
        strokeWidth="1.2"
      />
      <path
        d="M60,40 Q32,16 12,22 Q8,30 12,34 Q34,44 60,40 Z"
        fill="#f0d0c8"
        opacity="0.6"
      />
      {/* Right loop */}
      <path
        d="M60,40 Q90,10 112,18 Q118,30 112,38 Q90,48 60,40 Z"
        fill="#f5c8c0"
        stroke="#e8a89c"
        strokeWidth="1.2"
      />
      <path
        d="M60,40 Q88,16 108,22 Q112,30 108,34 Q86,44 60,40 Z"
        fill="#f0d0c8"
        opacity="0.6"
      />
      {/* Left tail */}
      <path
        d="M60,40 Q45,52 38,72 Q46,74 52,68 Q58,54 60,40 Z"
        fill="#f5c8c0"
        stroke="#e8a89c"
        strokeWidth="1"
      />
      {/* Right tail */}
      <path
        d="M60,40 Q75,52 82,72 Q74,74 68,68 Q62,54 60,40 Z"
        fill="#f5c8c0"
        stroke="#e8a89c"
        strokeWidth="1"
      />
      {/* Center knot */}
      <ellipse cx="60" cy="40" rx="8" ry="7" fill="#e8a89c" />
      <ellipse cx="60" cy="40" rx="4" ry="3.5" fill="#d4829a" />
      {/* Highlight shimmer */}
      <ellipse
        cx="56"
        cy="37"
        rx="2.5"
        ry="1.5"
        fill="white"
        opacity="0.5"
        transform="rotate(-20 56 37)"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Song section on the scroll
───────────────────────────────────────── */
function SongSection({ section, index, isVisible }) {
  return (
    <motion.div
      className={`song-section song-section--${section.type}`}
      initial={{ opacity: 0, y: 16 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.7, delay: index * 0.18, ease: "easeOut" }}
    >
      <span className="section-label">{section.label}</span>
      {section.lines.map((line, li) => (
        <motion.p
          key={li}
          className="song-line"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.18 + li * 0.07 + 0.2,
          }}
        >
          {line}
        </motion.p>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   The open scroll (parchment)
───────────────────────────────────────── */
function OpenScroll({ isVisible, audioRef, isMuted, onToggleMute, onNext }) {
  const [lyricsVisible, setLyricsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => setLyricsVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="open-scroll-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top roller */}
          <motion.div
            className="scroll-roller scroll-roller--top"
            initial={{ scaleX: 0.4, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* The parchment */}
          <motion.div
            className="parchment"
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <BurntCorners />

            {/* Parchment content */}
            <div className="parchment-content">
              {/* Song title */}
              <motion.div
                className="song-header"
                initial={{ opacity: 0, y: -10 }}
                animate={lyricsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <div className="song-ornament">✦ ✦ ✦</div>
                <h2 className="song-title">Tera-Mera Hai Pyaar Amar</h2>
                <p className="song-subtitle">
                  a song for Tanni, from the heart
                </p>
                <div className="song-ornament song-ornament--bottom">— ♥ —</div>
              </motion.div>

              {/* Lyrics sections */}
              <div className="song-body">
                {SONG_SECTIONS.map((section, i) => (
                  <SongSection
                    key={i}
                    section={section}
                    index={i}
                    isVisible={lyricsVisible}
                  />
                ))}
              </div>

              {/* Closing note */}
              <motion.div
                className="parchment-closing"
                initial={{ opacity: 0 }}
                animate={lyricsVisible ? { opacity: 1 } : {}}
                transition={{ delay: SONG_SECTIONS.length * 0.18 + 1.2 }}
              >
                <Heart size={14} fill="currentColor" />
                <em>This song is you. Every single word.</em>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom roller */}
          <motion.div
            className="scroll-roller scroll-roller--bottom"
            initial={{ scaleX: 0.4, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
          />

          {/* Audio + next controls */}
          <motion.div
            className="scroll-controls"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <button
              className="scroll-ctrl-btn"
              onClick={onToggleMute}
              aria-label={isMuted ? "Unmute music" : "Mute music"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? "unmute music" : "music playing"}</span>
            </button>

            <button className="scroll-next-btn" onClick={onNext}>
              <span>next chapter</span>
              <ChevronRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function ScrollPage({ onNext }) {
  // Stages: "closed" → "open" → "scroll-visible" → "unwrapped"
  const [stage, setStage] = useState("closed");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Attempt to play audio when scroll opens
  useEffect(() => {
    if (stage === "unwrapped" && audioRef.current) {
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {
        // autoplay blocked — user can toggle manually
      });
    }
  }, [stage]);

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted((m) => !m);
    }
  };

  const handleCaseClick = () => {
    if (stage === "closed") {
      setStage("open");
      setTimeout(() => setStage("scroll-visible"), 800);
    }
  };

  const handleBowClick = () => {
    if (stage === "scroll-visible") {
      setStage("unwrapped");
    }
  };

  const isScrollInCase = stage === "scroll-visible";
  const isUnwrapped = stage === "unwrapped";
  const isCaseOpen = stage !== "closed";

  return (
    <div className="scroll-page">
      {/* Floating sparkles */}
      <div className="sparkle-field" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`sparkle sparkle-${i + 1}`} />
        ))}
      </div>

      {/* Audio starts when the bow is opened. */}
      <audio ref={audioRef} src={scrollMusic} loop preload="none" />

      {/* Page header */}
      <motion.header
        className="scroll-page-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="scroll-chapter-badge">chapter 03</span>
        <h1 className="scroll-page-title">A Song for You</h1>
        <p className="scroll-page-sub">Sealed with love. Open it gently.</p>
      </motion.header>

      {/* Main stage */}
      <div className="scroll-stage">
        {/* Case (hidden once unwrapped) */}
        <AnimatePresence>
          {!isUnwrapped && (
            <motion.div
              className="case-container"
              exit={{ opacity: 0, scale: 0.85, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <CaseIllustration isOpen={isCaseOpen} onClick={handleCaseClick} />
              <ScrollInCase
                isVisible={isScrollInCase}
                onBowClick={handleBowClick}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Open scroll */}
        <OpenScroll
          isVisible={isUnwrapped}
          audioRef={audioRef}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onNext={onNext}
        />
      </div>

      {/* Music badge when not yet opened */}
      {!isUnwrapped && (
        <motion.div
          className="music-teaser"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Music size={13} />
          <span>a love song is waiting inside</span>
        </motion.div>
      )}
    </div>
  );
}
