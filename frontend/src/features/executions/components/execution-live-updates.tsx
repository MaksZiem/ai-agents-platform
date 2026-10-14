"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { getSocketToken } from "@/features/executions/socket-actions";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
const REFRESH_DELAY_MS = 250;

type ExecutionLiveUpdatesProps = {
  executionId: string;
};

export function ExecutionLiveUpdates({ executionId }: ExecutionLiveUpdatesProps) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${WS_URL}/executions`, {
      auth: (sendAuth) => {
        getSocketToken()
          .then((token) => sendAuth({ token }))
          .catch(() => sendAuth({}));
      },
    });
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleRefresh() {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
    }

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", executionId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("execution.updated", scheduleRefresh);
    socket.on("step.updated", scheduleRefresh);

    return () => {
      clearTimeout(refreshTimer);
      socket.disconnect();
    };
  }, [executionId, router]);

  if (!connected) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
      <span
        className="size-1.5 animate-pulse rounded-full bg-success motion-reduce:animate-none"
        aria-hidden
      />
      Live
    </span>
  )
}
