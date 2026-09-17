"use client";

import type { SearchResultResponse } from "@/domains/search/types/search";

interface SearchResultListProps {
  results: SearchResultResponse[];
  keyword: string;
}

const CONTENT_PREVIEW_LENGTH = 60;

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightKeyword(text: string, keyword: string) {
  if (!keyword) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLocaleLowerCase() ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function SearchResultList({ results, keyword }: SearchResultListProps) {
  return (
    <ul className="flex flex-col divide-y divide-gray-100">
      {results.map((item) => (
        <li key={item.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-orange-50">
            {item.stickerImageUrl ? (
              <img
                src={item.stickerImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-orange-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium text-gray-900">
                {highlightKeyword(item.title, keyword)}
              </p>
              <span className="shrink-0 text-xs text-gray-400">
                {item.entryDate}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {highlightKeyword(
                truncate(item.content, CONTENT_PREVIEW_LENGTH),
                keyword,
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
