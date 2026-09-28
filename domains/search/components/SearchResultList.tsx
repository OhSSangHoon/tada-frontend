import type { SearchResultResponse } from "@/domains/search/types/search";
import Image from "next/image";

interface SearchResultListProps {
  results: SearchResultResponse[];
  keyword: string;
  onSelectDiary: (result: SearchResultResponse) => void;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightKeyword(text: string, keyword: string) {
  if (!keyword) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function SearchResultList({
  results,
  keyword,
  onSelectDiary,
}: SearchResultListProps) {
  return (
    <ul className="flex flex-col divide-y divide-gray-100">
      {results.map((item) => (
        <li
          key={item.id}
          onClick={() => onSelectDiary(item)}
          className="flex cursor-pointer gap-4 px-4 py-4 hover:bg-gray-50"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50">
            {item.stickerImageUrl ? (
              <Image
                src={item.stickerImageUrl}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-orange-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-base font-semibold text-gray-900">
                {highlightKeyword(item.title, keyword)}
              </p>
              <span className="shrink-0 text-xs text-gray-400">
                {item.entryDate}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-gray-500">
              {highlightKeyword(item.content, keyword)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
