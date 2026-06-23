"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  durationSeconds: number;
  onExpire: () => void;
}

export function CountdownTimer({ durationSeconds, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current();
      return;
    }
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining < 60;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-mono text-base font-semibold transition-colors ${
        isWarning
          ? "border-red-400 bg-red-50 text-red-600 animate-pulse"
          : "border-gray-200 bg-white text-gray-700"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
