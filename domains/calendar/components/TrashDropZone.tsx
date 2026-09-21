"use client";

import { useState, type DragEvent } from "react";
import { TrashIcon } from "@/domains/diary/components/TrashIcon";

interface TrashDropZoneProps {
  onDropDiary: () => void;
}

export function TrashDropZone({ onDropDiary }: TrashDropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsOver(false);
    onDropDiary();
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      aria-label="휴지통"
      className={`absolute bottom-0 left-1/2 z-20 flex h-24 w-24 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(249,115,22,0.3)] transition-all duration-200 starting:scale-75 starting:opacity-0 ${
        isOver ? "scale-110 bg-[#F97316]" : "bg-white"
      }`}
    >
      <TrashIcon
        className={`pointer-events-none h-12 w-12 ${isOver ? "text-white" : "text-[#F97316]"}`}
      />
    </div>
  );
}
