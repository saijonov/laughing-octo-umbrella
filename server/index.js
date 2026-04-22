import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const state = {
  options: [
    { id: "a", label: "Neon Dusk", subtitle: "Warm violet energy", votes: 0 },
    { id: "b", label: "Deep Current", subtitle: "Cool teal calm", votes: 0 },
  ],
  voters: new Map(), // voterId -> optionId
};

// seed a little activity so the bars aren't flat on first load
state.options[0].votes = 12;
state.options[1].votes = 9;

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function snapshot() {
  return {
    type: "state",
    options: state.options,
    totalVotes: state.options.reduce((s, o) => s + o.votes, 0),
  };
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(snapshot()));
});

app.get("/api/state", (_req, res) => res.json(snapshot()));

app.post("/api/vote", (req, res) => {
  const { optionId, voterId } = req.body ?? {};
  const option = state.options.find((o) => o.id === optionId);
  if (!option) return res.status(400).json({ error: "Invalid option" });
  if (!voterId || typeof voterId !== "string")
    return res.status(400).json({ error: "Missing voterId" });

  const existing = state.voters.get(voterId);
  if (existing === optionId) {
    return res.status(409).json({ error: "Already voted for this option" });
  }
  if (existing) {
    const prev = state.options.find((o) => o.id === existing);
    if (prev) prev.votes = Math.max(0, prev.votes - 1);
  }
  option.votes += 1;
  state.voters.set(voterId, optionId);

  broadcast({ ...snapshot(), type: "state", justVoted: optionId });
  res.json({ ok: true, votedFor: optionId });
});

// simulate ambient live activity from "other users"
setInterval(() => {
  if (Math.random() < 0.55) {
    const pick = state.options[Math.random() < 0.5 ? 0 : 1];
    pick.votes += 1;
    // fake voter id so we don't collide with real users
    state.voters.set("bot_" + crypto.randomBytes(4).toString("hex"), pick.id);
    broadcast(snapshot());
  }
}, 2500);

const PORT = process.env.PORT || 5174;
server.listen(PORT, () => {
  console.log(`voting server on http://localhost:${PORT}`);
});
