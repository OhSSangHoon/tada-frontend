"use client";

import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";

import type { PersonTimelineItemResponse } from "@/domains/curator/types/curator";

interface PersonTimelineCardProps {
  item: PersonTimelineItemResponse;
  onClick: () => void;
  onCorrectionRequest: () => void;
  isMenuOpen: boolean;
  onMenuOpenChange: (isOpen: boolean) => void;
}

export function PersonTimelineCard({
  item,
  onClick,
  onCorrectionRequest,
  isMenuOpen,
  onMenuOpenChange,
}: PersonTimelineCardProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleOutsideMouseDown(event: globalThis.MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!menuRef.current?.contains(target)) {
        onMenuOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [isMenuOpen, onMenuOpenChange]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onClick();
  }

  function stopCardClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${item.title} 일기 열기`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="
        group relative flex min-h-[92px] cursor-pointer items-center gap-3.5
        rounded-[16px] border border-[#EEE9E6]
        bg-white px-3 py-2.5 pr-11
        transition-[transform,border-color,box-shadow,background-color]
        duration-200
        hover:-translate-y-0.5
        hover:border-[#F3C3A1]
        hover:bg-[#FFFEFD]
        hover:shadow-[0_5px_16px_rgba(64,49,46,0.055)]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#F97316]/20
      "
    >
      <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[16px] bg-[#FFF7ED]">
        {item.stickerUrl ? (
          <Image
            src={item.stickerUrl}
            alt=""
            fill
            sizes="70px"
            className="object-contain p-1"
          />
        ) : (
          <StickerPlaceholder />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4
          title={item.title}
          className="truncate text-[16px] font-bold tracking-[-0.01em] text-[#40312E]"
        >
          {item.title}
        </h4>

        {item.keywords.length > 0 && (
          <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden">
            {item.keywords.slice(0, 2).map((keyword) => (
              <span
                key={keyword}
                title={keyword}
                className="max-w-[112px] truncate rounded-full bg-[#F6F3F1] px-2.5 py-1 text-[11px] font-medium text-[#6F6661]"
              >
                {keyword}
              </span>
            ))}

            {item.keywords.length > 2 && (
              <span className="shrink-0 rounded-full bg-[#FFF0E4] px-2.5 py-1 text-[11px] font-bold text-[#F97316]">
                +{item.keywords.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        ref={menuRef}
        className="absolute right-1.5 top-1.5"
        onClick={stopCardClick}
      >
        <button
          type="button"
          aria-label="인물 연결 메뉴"
          aria-expanded={isMenuOpen}
          onClick={() => onMenuOpenChange(!isMenuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#A09792] transition hover:bg-[#FFF3E8] hover:text-[#F97316]"
        >
          <MoreIcon />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-9 z-20 w-[154px] overflow-hidden rounded-xl border border-[#EEE6E1] bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                onMenuOpenChange(false);
                onCorrectionRequest();
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold text-[#5F5651] transition hover:bg-[#FFF7ED] hover:text-[#F97316]"
            >
              이 사람 아니에요
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function StickerPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-[#F97316]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v5h5" />
      </svg>
    </div>
  );
}
