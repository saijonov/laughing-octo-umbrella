import { motion, AnimatePresence } from "framer-motion";
import type { VoteOption } from "../hooks/useVoteStream";
import { AnimatedNumber } from "./AnimatedNumber";

type Accent = "violet" | "teal";

const ACCENT: Record<
  Accent,
  { ring: string; grad: string; glow: string; text: string; dot: string }
> = {
  violet: {
    ring: "ring-violet/60",
    grad: "from-violet to-violet-soft",
    glow: "shadow-glow",
    text: "text-violet-soft",
    dot: "bg-violet",
  },
  teal: {
    ring: "ring-teal/60",
    grad: "from-teal to-teal-soft",
    glow: "shadow-glowTeal",
    text: "text-teal-soft",
    dot: "bg-teal",
  },
};

type Props = {
  option: VoteOption;
  accent: Accent;
  percent: number;
  selected: boolean;
  disabled: boolean;
  onVote: () => void;
  pulse: boolean;
};

export function VoteCard({
  option,
  accent,
  percent,
  selected,
  disabled,
  onVote,
  pulse,
}: Props) {
  const a = ACCENT[accent];

  return (
    <motion.button
      type="button"
      onClick={onVote}
      disabled={disabled}
      whileHover={!disabled ? { y: -4 } : undefined}
      whileTap={!disabled ? { scale: 0.985 } : undefined}
      layout
      className={[
        "group relative w-full overflow-hidden rounded-3xl p-6 text-left transition-all",
        "glass ring-1 ring-white/5",
        selected ? `ring-2 ${a.ring} ${a.glow}` : "hover:ring-white/15",
        disabled && !selected ? "opacity-70" : "",
        "disabled:cursor-default",
      ].join(" ")}
    >
      {/* percent fill */}
      <motion.div
        aria-hidden
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${a.grad} opacity-[0.18]`}
        initial={false}
        animate={{ width: `${percent}%` }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
      />

      {/* subtle shimmer on selected */}
      {selected && (
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,.6) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${a.dot}`} />
            <span className="text-xs uppercase tracking-[0.18em] text-mist">
              Option {accent === "violet" ? "A" : "B"}
            </span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
            {option.label}
          </h3>
          <p className="mt-1 text-sm text-mist">{option.subtitle}</p>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${a.grad} text-ink shadow-lg`}
              aria-label="Your vote"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-6 flex items-end justify-between">
        <div>
          <div className={`font-display text-4xl font-bold ${a.text}`}>
            <AnimatedNumber value={option.votes} />
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-mist">
            votes
          </div>
        </div>
        <motion.div
          key={percent}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-2xl font-semibold text-white/90"
        >
          {percent.toFixed(1)}%
        </motion.div>
      </div>

      {/* pulse ring on live update */}
      <AnimatePresence>
        {pulse && (
          <motion.span
            key={Math.random()}
            aria-hidden
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className={`pointer-events-none absolute inset-0 rounded-3xl ring-2 ${a.ring}`}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
