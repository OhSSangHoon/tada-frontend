import Image from "next/image";

import type { PersonSummaryResponse } from "@/domains/curator/types/curator";

interface PersonCardProps {
  person: PersonSummaryResponse;
  onClick?: () => void;
}

export function PersonCard({ person, onClick }: PersonCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full items-center gap-3
        rounded-[17px] border border-[#EEE9E6]
        bg-white px-3 py-3 text-left
        transition-[transform,border-color,box-shadow,background-color]
        duration-200
        hover:-translate-y-[1px]
        hover:border-[#F5C4A1]
        hover:bg-[#FFFEFD]
        hover:shadow-[0_7px_22px_rgba(64,49,46,0.07)]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#F97316]/20
      "
    >
      <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[18px] bg-[#FFF7ED]">
        {person.stickerUrl ? (
          <Image
            src={person.stickerUrl}
            alt=""
            fill
            sizes="80px"
            className="object-contain p-1"
          />
        ) : (
          <PersonPlaceholder />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[18px] font-bold tracking-[-0.015em] text-[#40312E]">
          {person.displayName}
        </p>

        <div className="mt-2.5 flex items-center gap-2 text-[12px]">
          <p className="shrink-0 font-semibold text-[#F97316]">
            함께한 기록 {person.mentionCount}개
          </p>

          <span className="h-3 w-px shrink-0 bg-[#E8E2DF]" />

          <p className="truncate font-medium text-[#7E746F]">
            최근 {formatDate(person.lastMentionedAt)}
          </p>
        </div>
      </div>

      <ChevronIcon />
    </button>
  );
}

function PersonPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-[#F97316]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21c.7-4.3 3-6.5 7-6.5s6.3 2.2 7 6.5" />
      </svg>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[#9D948F] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#F97316]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${year}.${month}.${day}`;
}
