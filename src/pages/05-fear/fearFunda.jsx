import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Timer,
  Zap,
  Heart,
} from "lucide-react";
import "./fearFunda.css";

/* ─────────────────────────────────────────────
   Quiz data
───────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 1,
    mission: "MEMORY SCAN — LEVEL 1",
    q: "What was the first compliment she ever gave you?",
    options: [
      { id: "a", text: "Writing ✍️" },
      { id: "b", text: "Looks 😍" },
      { id: "c", text: "Nature 🌿" },
      { id: "d", text: "Voice 🎙️" },
    ],
    correct: "a",
    penalty:
      "Error 404: Compliment database corrupted! She must call you 'cute' once right now to restart the system. Timer resumed in 10s ⏱️",
  },
  {
    id: 2,
    mission: "HEART SCAN — LEVEL 2",
    q: "What is my absolute favourite thing about her?",
    options: [
      { id: "a", text: "Suno na suno na 🥺" },
      { id: "b", text: "Her heart-shaped cheek 💗" },
      { id: "c", text: "Her love for food 🍰" },
      { id: "d", text: "Her smile ☀️" },
    ],
    correct: "all",
    correctLabel: "All of the above — and a thousand more things",
    penalty:
      "CRITICAL ALERT: Underestimation detected! She must look in a mirror and say 'I am amazing' 3 times before the timer resets 💅",
    isAllOfAbove: true,
  },
  {
    id: 3,
    mission: "DELIVERY LOG — LEVEL 3",
    q: "What was the very first thing he ordered for her?",
    options: [
      { id: "a", text: "Baked white sauce pasta 🍝" },
      { id: "b", text: "Tiramisu cake 🎂" },
      { id: "c", text: "Americano ☕" },
      { id: "d", text: "Cold coffee 🧋" },
    ],
    correct: "b",
    penalty:
      "ACCESS DENIED: Food memory malfunction! Penalty — she must apologise to tiramisu cake by blowing it a kiss 🎂💋",
  },
  {
    id: 4,
    mission: "DATE LOCK — LEVEL 4",
    q: "When is our anniversary? 💑",
    options: [
      { id: "a", text: "5 July" },
      { id: "b", text: "5 June" },
      { id: "c", text: "12 August" },
      { id: "d", text: "4 November" },
    ],
    correct: "d",
    penalty:
      "SYSTEM BREACH: Anniversary memory corrupted! She must set a reminder RIGHT NOW and send a 'I won't forget' voice note 📵",
  },
  {
    id: 5,
    mission: "FINAL LOCK — LEVEL 5",
    q: "How many seconds does she owe you in a hug right now?",
    options: [
      { id: "a", text: "10 seconds — bare minimum" },
      { id: "b", text: "30 seconds — standard issue" },
      { id: "c", text: "Forever — no release date" },
      { id: "d", text: "Only when she feels like it" },
    ],
    correct: "c",
    penalty:
      "LOGIC ERROR: Incorrect hug duration filed! She must immediately promise a hug the next time they meet. No exceptions. No appeals 🤗",
  },
];

const QUESTION_TIME = 20; // seconds per question

/* ─────────────────────────────────────────────
   Fear Funda stamp animation
───────────────────────────────────────────── */
function FearFundaStamp({ onBegin }) {
  const [phase, setPhase] = useState("stamp"); // stamp → glitch → ready

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("glitch"), 1200);
    const t2 = setTimeout(() => setPhase("ready"), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="kkk-intro">
      {/* Scan-lines overlay */}
      <div className="scanlines" aria-hidden="true" />

      {/* Top danger bar */}
      <div className="danger-bar">
        <AlertTriangle size={14} />
        <span>KHATRON KE KHILADI — FEAR FUNDA ACTIVATED</span>
        <AlertTriangle size={14} />
      </div>

      {/* Main stamp */}
      <motion.div
        className={`fear-stamp ${phase}`}
        initial={{ scale: 3, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: [-8, 2, -1, 0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="stamp-border" />
        <div className="stamp-inner">
          <div className="stamp-icon">⚡</div>
          <div className="stamp-word">FEAR</div>
          <div className="stamp-word stamp-word--funda">FUNDA</div>
          <div className="stamp-sub">CONTESTANT: TANNI</div>
        </div>
      </motion.div>

      {/* Glitch flicker */}
      {phase === "glitch" && (
        <motion.div
          className="glitch-flash"
          animate={{ opacity: [0, 0.8, 0, 0.6, 0] }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Briefing text */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            className="kkk-briefing"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="briefing-text">
              A <span className="red">Fear Funda</span> has been placed on you,
              Tanni.
            </p>
            <p className="briefing-sub">
              To unlock this website and prove your worth as his girlfriend, you
              must survive <strong>5 rapid-fire questions</strong> about your
              relationship. Each question has a{" "}
              <span className="amber">{QUESTION_TIME}-second timer.</span> Wrong
              answer? A penalty awaits.
            </p>
            <p className="briefing-dramatic">Darr ke aage jeet hai. 🔥</p>
            <motion.button
              className="begin-btn"
              onClick={onBegin}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Zap size={18} />
              Accept the Challenge
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Timer bar
───────────────────────────────────────────── */
function TimerBar({ timeLeft, total }) {
  const pct = (timeLeft / total) * 100;
  const isUrgent = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div className="timer-bar-wrap">
      <div
        className={`timer-bar-fill ${isUrgent ? "urgent" : ""} ${isCritical ? "critical" : ""}`}
        style={{ width: `${pct}%` }}
      />
      <div className={`timer-label ${isCritical ? "critical" : ""}`}>
        <Timer size={13} />
        <span>{timeLeft}s</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Penalty popup
───────────────────────────────────────────── */
function PenaltyPopup({ text, onDismiss }) {
  return (
    <motion.div
      className="penalty-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="penalty-card"
        initial={{ scale: 0.5, rotate: -6, y: 40 }}
        animate={{ scale: 1, rotate: [-6, 3, -1, 0], y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <div className="penalty-siren">🚨 🚨 🚨</div>
        <div className="penalty-header">WRONG ANSWER DETECTED</div>
        <p className="penalty-text">{text}</p>
        <p className="penalty-note">
          Complete the penalty to continue. The judges are watching. 👀
        </p>
        <motion.button
          className="penalty-done-btn"
          onClick={onDismiss}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Penalty Done — Resume Quiz
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Question card
───────────────────────────────────────────── */
function QuestionCard({
  question,
  qIndex,
  total,
  timeLeft,
  onAnswer,
  showResult,
  selectedId,
  isCorrect,
}) {
  return (
    <motion.div
      className="question-card"
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Mission tag */}
      <div className="mission-tag">
        <Zap size={11} />
        {question.mission}
      </div>

      {/* Progress dots */}
      <div
        className="progress-dots"
        aria-label={`Question ${qIndex + 1} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`dot ${i < qIndex ? "done" : i === qIndex ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Timer */}
      <TimerBar timeLeft={timeLeft} total={QUESTION_TIME} />

      {/* Question */}
      <p className="question-text">{question.q}</p>

      {/* Special note for Q2 */}
      {question.isAllOfAbove && (
        <p className="question-hint">
          Hint: She's more amazing than she thinks 💗
        </p>
      )}

      {/* Options */}
      <div className="options-grid">
        {question.isAllOfAbove
          ? [
              ...question.options,
              { id: "all", text: "✨ All of the above — and a thousand more" },
            ].map((opt) => (
              <OptionButton
                key={opt.id}
                opt={opt}
                selected={selectedId === opt.id}
                isCorrect={question.correct === opt.id}
                showResult={showResult}
                onClick={() => !showResult && onAnswer(opt.id)}
              />
            ))
          : question.options.map((opt) => (
              <OptionButton
                key={opt.id}
                opt={opt}
                selected={selectedId === opt.id}
                isCorrect={question.correct === opt.id}
                showResult={showResult}
                onClick={() => !showResult && onAnswer(opt.id)}
              />
            ))}
      </div>
    </motion.div>
  );
}

function OptionButton({ opt, selected, isCorrect, showResult, onClick }) {
  let cls = "option-btn";
  if (showResult) {
    if (isCorrect) cls += " correct";
    else if (selected && !isCorrect) cls += " wrong";
    else cls += " dimmed";
  } else if (selected) {
    cls += " selected";
  }

  return (
    <motion.button
      className={cls}
      onClick={onClick}
      whileHover={!showResult ? { scale: 1.02 } : {}}
      whileTap={!showResult ? { scale: 0.97 } : {}}
    >
      <span className="option-id">{opt.id.toUpperCase()}</span>
      <span className="option-text">{opt.text}</span>
      {showResult && isCorrect && (
        <CheckCircle size={16} className="option-tick" />
      )}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Victory screen
───────────────────────────────────────────── */
function VictoryScreen({ onNext, wrongCount }) {
  return (
    <motion.div
      className="victory-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="scanlines scanlines--light" aria-hidden="true" />

      <motion.div
        className="victory-badge"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
      >
        <Shield size={40} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="victory-tag">FEAR FUNDA — ELIMINATED ✓</div>
        <h2 className="victory-title">She Survived! 🎉</h2>
        <p className="victory-sub">
          {wrongCount === 0
            ? "Perfect score. No penalties. She's a natural. He's a lucky guy. 💪"
            : wrongCount === 1
              ? `One penalty, but she fought through it like a true champion. Rohit Shetty would be proud. 🔥`
              : `${wrongCount} penalties served with grace. The bravest contestant on the show. 🏆`}
        </p>

        <div className="victory-note">
          <Heart size={14} fill="currentColor" />
          <span>
            Fear Funda cleared. The rest of your birthday story is now unlocked
            — and there's much more love waiting inside.
          </span>
          <Heart size={14} fill="currentColor" />
        </div>

        <motion.button
          className="victory-btn"
          onClick={onNext}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Open Your Birthday Story
          <span className="victory-btn-icon">→</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function FearFundaPage({ onNext }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | penalty | victory
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedId, setSelectedId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentPenalty, setCurrentPenalty] = useState("");
  const timerRef = useRef(null);

  const currentQ = QUESTIONS[qIndex];

  /* ── Timer ── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Ran out of time — treat as wrong
          triggerPenalty(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]); // eslint-disable-line

  useEffect(() => {
    if (phase === "quiz") {
      setTimeLeft(QUESTION_TIME);
      startTimer();
    }
    return clearTimer;
  }, [phase, qIndex, startTimer, clearTimer]);

  /* ── Penalty trigger ── */
  const triggerPenalty = useCallback(
    (timeout = false) => {
      clearTimer();
      setWrongCount((c) => c + 1);
      setShowResult(true);
      const penaltyText = timeout
        ? `TIME'S UP! Clock ran out! Penalty — she must confess her favourite memory of him right now to reset the timer ⏰`
        : currentQ.penalty;
      setTimeout(() => {
        setCurrentPenalty(penaltyText);
        setPhase("penalty");
      }, 900);
    },
    [clearTimer, currentQ],
  );

  /* ── Answer handler ── */
  const handleAnswer = useCallback(
    (optId) => {
      if (showResult) return;
      clearTimer();
      setSelectedId(optId);
      setShowResult(true);

      const correct =
        currentQ.correct === "all"
          ? optId === "all"
          : optId === currentQ.correct;

      if (correct) {
        // Advance after a short delay
        setTimeout(() => {
          if (qIndex + 1 >= QUESTIONS.length) {
            setPhase("victory");
          } else {
            setQIndex((i) => i + 1);
            setSelectedId(null);
            setShowResult(false);
          }
        }, 1100);
      } else {
        triggerPenalty(false);
      }
    },
    [showResult, clearTimer, currentQ, qIndex, triggerPenalty],
  );

  /* ── Penalty dismissed ── */
  const handlePenaltyDone = () => {
    setPhase("quiz");
    setSelectedId(null);
    setShowResult(false);
    setCurrentPenalty("");
    if (qIndex + 1 >= QUESTIONS.length) {
      // Was on last question — go to victory
      setPhase("victory");
    } else {
      setQIndex((i) => i + 1);
    }
  };

  /* ── Render ── */
  return (
    <div className="kkk-page">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="kkk-phase"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <FearFundaStamp onBegin={() => setPhase("quiz")} />
          </motion.div>
        )}

        {(phase === "quiz" || phase === "penalty") && (
          <motion.div
            key="quiz"
            className="kkk-phase kkk-quiz-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Quiz header bar */}
            <div className="quiz-topbar">
              <div className="quiz-topbar-brand">
                <Zap size={16} />
                <span>Khatron Ke Khiladi</span>
              </div>
              <div className="quiz-topbar-status">
                {wrongCount > 0 && (
                  <span className="penalty-counter">
                    {wrongCount} {wrongCount === 1 ? "penalty" : "penalties"}
                  </span>
                )}
                <span className="quiz-progress">
                  Q{qIndex + 1} / {QUESTIONS.length}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <QuestionCard
                key={qIndex}
                question={currentQ}
                qIndex={qIndex}
                total={QUESTIONS.length}
                timeLeft={timeLeft}
                onAnswer={handleAnswer}
                showResult={showResult}
                selectedId={selectedId}
                isCorrect={selectedId === currentQ.correct}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "victory" && (
          <motion.div
            key="victory"
            className="kkk-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <VictoryScreen onNext={onNext} wrongCount={wrongCount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Penalty modal */}
      <AnimatePresence>
        {phase === "penalty" && currentPenalty && (
          <PenaltyPopup text={currentPenalty} onDismiss={handlePenaltyDone} />
        )}
      </AnimatePresence>
    </div>
  );
}
