"use client";

import { useState } from "react";
import type { StickerSortOption } from "@/domains/sticker/types/sticker";

interface SortDropdownProps {
  value: StickerSortOption;
  onChange: (value: StickerSortOption) => void;
}

const OPTIONS: { value: StickerSortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current =
    OPTIONS.find((option) => option.value === value)?.label ?? "최신순";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        {current}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <ul className="absolute left-0 top-full z-20 mt-1 w-24 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
            {OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    option.value === value
                      ? "font-semibold text-[#F97316]"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
