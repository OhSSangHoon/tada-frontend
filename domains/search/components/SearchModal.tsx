"use client";

import { useState } from "react";
import { useSearch, MAX_QUERY_LENGTH } from "@/domains/search/hooks/useSearch";
import { SearchResultList } from "@/domains/search/components/SearchResultList";
import { Pagination } from "@/shared/components/Pagination";
import { ApiError } from "@/shared/lib/api-client";
import { DiaryDetailModal } from "@/domains/diary/components/DiaryDetailModal";
import { useInvalidateSearchOnDiaryUpdate } from "@/domains/search/hooks/useInvalidateSearchOnDiaryUpdate";
import type { SearchResultResponse } from "@/domains/search/types/search";

const FALLBACK_STICKER_IMAGE = "/stickers/goodday.png";

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<SearchResultResponse | null>(null);

  const {
    inputValue,
    setInputValue,
    submittedQuery,
    handleSubmit,
    validationError,
    page,
    goToPage,
    sort,
    changeSort,
    data,
    isLoading,
    isError,
    error,
    refetch,
    reset,
    hasSearched,
  } = useSearch();

  useInvalidateSearchOnDiaryUpdate(selectedResult?.id);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedResult(null);
    reset();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#40312E] text-white transition-colors hover:brightness-90 cursor-pointer"
        aria-label="일기 검색 열기"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 flex h-140 w-96 flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-base font-semibold text-gray-900">
            검색어를 입력해주세요
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600  cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="산책, 밤하늘, 비오는날"
            maxLength={MAX_QUERY_LENGTH}
            autoFocus
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            aria-label="검색"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600  cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {validationError && (
          <p className="px-4 pb-2 text-xs text-red-500">{validationError}</p>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
          <span className="text-sm font-medium text-gray-700">검색 내용</span>
          {hasSearched && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeSort("latest")}
                className={
                  sort === "latest"
                    ? "rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600 cursor-pointer"
                    : "rounded-full px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 cursor-pointer"
                }
              >
                최신순
              </button>
              <button
                type="button"
                onClick={() => changeSort("oldest")}
                className={
                  sort === "oldest"
                    ? "rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600 cursor-pointer"
                    : "rounded-full px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 cursor-pointer"
                }
              >
                오래된순
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!hasSearched && !validationError && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              검색어를 입력해 일기를 찾을 수 있습니다.
            </p>
          )}

          {hasSearched && isLoading && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              검색 중…
            </p>
          )}

          {hasSearched && isError && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <p className="text-sm text-red-500">
                {error instanceof ApiError
                  ? error.message
                  : "잠시 후 다시 시도 해 주세요."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {hasSearched &&
            !isLoading &&
            !isError &&
            data &&
            data.content.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </p>
            )}

          {hasSearched &&
            !isLoading &&
            !isError &&
            data &&
            data.content.length > 0 && (
              <SearchResultList
                results={data.content}
                keyword={submittedQuery}
                onSelectDiary={setSelectedResult}
              />
            )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={goToPage}
              ariaLabel="검색 결과 페이지네이션"
            />
          </div>
        )}
      </div>

      {selectedResult && (
        <DiaryDetailModal
          diaryId={selectedResult.id}
          imageUrl={selectedResult.stickerImageUrl ?? FALLBACK_STICKER_IMAGE}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}
