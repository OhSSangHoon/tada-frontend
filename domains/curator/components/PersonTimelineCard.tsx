"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import type { PersonTimelineItemResponse } from "@/domains/curator/types/curator";

interface PersonTimelineCardProps {
  item: PersonTimelineItemResponse;
  onClick: () => void;
  onCorrectionRequest: () => void;
}

export function PersonTimelineCard({
  item,
  onClick,
  onCorrectionRequest,
}: PersonTimelineCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [isMenuOpen]);

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
      className="group relative flex min-h-[112px] cursor-pointer gap-4 rounded-2xl border border-[#EFE7E2] bg-white px-4 py-4 pr-12 transition hover:border-[#F6C9A9] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/40"
    >
      <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl bg-[#FFF7ED] ring-1 ring-[#F4E6DC]">
        {item.stickerUrl ? (
          <Image
            src={item.stickerUrl}
            alt=""
            fill
            sizes="68px"
            className="object-cover"
          />
        ) : (
          <StickerPlaceholder />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[#AAA09B]">
          {formatDate(item.entryDate)}
        </p>

        <h4
          title={item.title}
          className="mt-1 truncate text-[15px] font-bold text-[#40312E]"
        >
          {item.title}
        </h4>

        {item.keywords.length > 0 && (
          <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
            {item.keywords.slice(0, 3).map((keyword) => (
              <span
                key={keyword}
                title={keyword}
                className="max-w-[120px] truncate rounded-full bg-[#FFF4EB] px-2.5 py-1 text-[11px] font-semibold text-[#EF6C16]"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        ref={menuRef}
        className="absolute right-3 top-3"
        onClick={stopCardClick}
        onMouseDown={stopCardClick}
      >
        <button
          type="button"
          aria-label="인물 연결 메뉴"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#A09792] transition hover:bg-[#FFF3E8] hover:text-[#F97316]"
        >
          <MoreIcon />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-9 z-20 w-[154px] overflow-hidden rounded-xl border border-[#EEE6E1] bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
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
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function StickerPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-[#F97316]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7"
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

function formatDate(date: string) {
  return date.slice(0, 10).replaceAll("-", ".");
}
