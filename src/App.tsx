import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoteStream } from "./hooks/useVoteStream";
import { getLocalVote, getVoterId, setLocalVote } from "./lib/voterId";
import { VoteCard } from "./components/VoteCard";
import { AnimatedNumber } from "./components/AnimatedNumber";

export default function App() {
  const { state, status } = useVoteStream();
  const [myVote, setMyVote] = useState<string | null>(() => getLocalVote());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pulseFor, setPulseFor] = useState<string | null>(null);
  const lastVotesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!state) return;
    const prev = lastVotesRef.current;
    for (const opt of state.options) {
      if (prev[opt.id] !== undefined && opt.votes > prev[opt.id]) {
        setPulseFor(opt.id);
        window.setTimeout(() => setPulseFor(null), 900);
      }
      prev[opt.id] = opt.votes;
    }
  }, [state]);

  const total = state?.totalVotes ?? 0;

  const percents = useMemo(() => {
    const map: Record<string, number> = {};
    if (!state) return map;
    for (const o of state.options) {
      map[o.id] = total > 0 ? (o.votes / total) * 100 : 50;
    }
    return map;
  }, [state, total]);

  async function vote(optionId: string) {
    if (submitting) return;
    if (myVote === optionId) {
      flash("You already voted for this one");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, voterId: getVoterId() }),
      });
      if (res.ok) {
        setMyVote(optionId);
        setLocalVote(optionId);
        flash(myVote ? "Vote updated" : "Vote locked in");
      } else if (res.status === 409) {
        flash("You already voted for this one");
      } else {
        flash("Couldn't submit vote");
      }
    } catch {
      flash("Network hiccup — try again");
    } finally {
      setSubmitting(false);
    }
  }

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="relative min-h-screen">
      <div className="aurora" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet to-teal blur-md opacity-70" />
              <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-panel ring-1 ring-white/10">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                  <path
                    fill="currentColor"
                    d="M3 12h3l2-7 4 14 2-7h7v2h-5l-3 10-4-14-1 4H3z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight text-white">
                Pulse
              </div>
              <div className="text-xs text-mist">Live community vote</div>
            </div>
          </div>

          <StatusPill status={status} />
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Which mood fits tonight?
          </h1>
          <p className="mt-2 text-mist">
            Tap a card to vote. Results update live as others chime in.
          </p>
        </motion.section>

        <div className="grid gap-4 sm:grid-cols-2">
          {state?.options.map((opt, i) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            >
              <VoteCard
                option={opt}
                accent={i === 0 ? "violet" : "teal"}
                percent={percents[opt.id] ?? 0}
                selected={myVote === opt.id}
                disabled={submitting}
                onVote={() => vote(opt.id)}
                pulse={pulseFor === opt.id}
              />
            </motion.div>
          ))}

          {!state && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-between text-sm text-mist"
        >
          <div>
            <span className="font-display text-white">
              <AnimatedNumber value={total} />
            </span>{" "}
            total votes
          </div>
          {myVote && (
            <button
              onClick={() => {
                setLocalVote(null);
                setMyVote(null);
                flash("You can vote again");
              }}
              className="text-xs uppercase tracking-widest text-mist transition hover:text-white"
            >
              reset my vote
            </button>
          )}
        </motion.div>

        <footer className="mt-12 text-center text-xs text-mist/70">
          real-time over websocket · one vote per device
        </footer>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full glass px-5 py-2 text-sm text-white shadow-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusPill({ status }: { status: "connecting" | "live" | "offline" }) {
  const map = {
    connecting: { text: "connecting", color: "bg-amber-400" },
    live: { text: "live", color: "bg-emerald-400" },
    offline: { text: "offline", color: "bg-rose-400" },
  } as const;
  const { text, color } = map[status];
  return (
    <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-mist">
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-70`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      <span className="uppercase tracking-widest">{text}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass h-48 animate-pulse rounded-3xl ring-1 ring-white/5" />
  );
}
