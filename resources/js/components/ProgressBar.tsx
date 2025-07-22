import * as Progress from "@radix-ui/react-progress";
import React from "react";

interface ProgressBarProps {
  value: number;
  className?: string; // ← tambahkan dukungan untuk className opsional
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <Progress.Root
      className={`relative overflow-hidden bg-gray-200 rounded-full w-full h-2 ${className || ''}`}
      value={value}
    >
      <Progress.Indicator
        className="bg-green-600 h-full transition-transform duration-300"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </Progress.Root>
  );
}
