"use client";

import { useEffect, useState } from "react";
import { useFormat } from "@/lib/format";

type LiveDurationProps = {
  startedAt: string | null;
  finishedAt: string | null;
  running: boolean;
};

const TICK_MS = 100;

export function LiveDuration({ startedAt, finishedAt, running }: LiveDurationProps) {
  const format = useFormat();
  const [now, setNow] = useState<number | null>(null);
  const ticking = running && startedAt !== null && finishedAt === null;

  useEffect(() => {
    if (!ticking) return;

    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [ticking]);

  if (!startedAt) return <>—</>;

  const start = new Date(startedAt).getTime();
  const end = finishedAt
    ? new Date(finishedAt).getTime()
    : ticking && now !== null
      ? now
      : null;

  if (end === null) return <>—</>;

  return <>{format.duration(Math.max(0, end - start))}</>;
}
