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
      className="group flex min-h-[176px] w-full flex-col items-center rounded-2xl border border-[#F0E9E5] bg-white px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#F6C9A9] hover:shadow-md"
    >
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-[#FFF7ED] ring-1 ring-[#F6E9DF]">
        {person.stickerUrl ? (
          <Image
            src={person.stickerUrl}
            alt=""
            fill
            sizes="72px"
            className="object-cover"
          />
        ) : (
          <PersonPlaceholder />
        )}
      </div>

      <p className="mt-3 max-w-full truncate text-[16px] font-bold text-[#40312E]">
        {person.displayName}
      </p>

      <p className="mt-1 text-[12px] text-[#958B86]">
        함께한 기록{" "}
        <strong className="font-semibold text-[#F97316]">
          {person.mentionCount}
        </strong>
        개
      </p>

      <p className="mt-2 text-[11px] text-[#AAA09B]">
        최근 {formatDate(person.lastMentionedAt)}
      </p>
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

function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${Number(month)}월 ${Number(day)}일`;
}
