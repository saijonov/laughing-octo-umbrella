import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    fromRef.current = display;
    const from = display;
    const to = value;
    const start = performance.now();
    const dur = 500;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className="tabular-nums">{display.toLocaleString()}</span>;
}
