import Image from "next/image";
import type { PersonTimelineItemResponse } from "@/domains/curator/types/curator";

interface PersonTimelineCardProps {
  item: PersonTimelineItemResponse;
}

export function PersonTimelineCard({ item }: PersonTimelineCardProps) {
  return (
    <article className="group flex min-h-[112px] gap-4 rounded-2xl border border-[#EFE7E2] bg-white px-4 py-4 transition hover:border-[#F6C9A9] hover:shadow-sm">
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
    </article>
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
