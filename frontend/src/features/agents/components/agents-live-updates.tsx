"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { getSocketToken } from "@/features/executions/socket-actions";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
const REFRESH_DELAY_MS = 300;

export function AgentsLiveUpdates() {
  const router = useRouter();

  useEffect(() => {
    const socket = io(`${WS_URL}/executions`, {
      auth: (sendAuth) => {
        getSocketToken()
          .then((token) => sendAuth({ token }))
          .catch(() => sendAuth({}));
      },
    });
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    socket.on("activity", () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
    });

    return () => {
      clearTimeout(refreshTimer);
      socket.disconnect();
    };
  }, [router]);

  return null;
}
