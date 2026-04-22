import { useEffect, useRef, useState } from "react";

export type VoteOption = {
  id: string;
  label: string;
  subtitle: string;
  votes: number;
};

export type VoteState = {
  options: VoteOption[];
  totalVotes: number;
  justVoted?: string;
};

type Status = "connecting" | "live" | "offline";

export function useVoteStream() {
  const [state, setState] = useState<VoteState | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function seed() {
      try {
        const res = await fetch("/api/state");
        const data = await res.json();
        if (!cancelled) setState(data);
      } catch {
        /* ignore — WS will fill in */
      }
    }
    seed();

    function connect() {
      if (cancelled) return;
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${location.host}/ws`);
      wsRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => {
        retryRef.current = 0;
        setStatus("live");
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "state") setState(data);
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        setStatus("offline");
        const delay = Math.min(1000 * 2 ** retryRef.current, 8000);
        retryRef.current += 1;
        setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    }
    connect();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, []);

  return { state, status };
}
