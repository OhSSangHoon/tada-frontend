"use client";

import { useEffect } from "react";
import { Pagination } from "@/domains/search/components/Pagination";
import { SortDropdown } from "@/domains/sticker/components/SortDropdown";
import { StickerGridView } from "@/domains/sticker/components/StickerGridView";
import type {
  StickerResponse,
  StickerSortOption,
} from "@/domains/sticker/types/sticker";

// 사이드 패널 공통 규격: 3번째 버튼(스티커 앨범) 기준
const PANEL_TOP = 232; // 버튼과 동일한 높이
const PANEL_USABLE_HEIGHT_OFFSET = 248; // 96 + (2 × 68) + 16
const PANEL_MAX_HEIGHT = 560;
const PANEL_WIDTH = 440;

interface StickerSidebarProps {
  isOpen: boolean;
  close: () => void;
  page: number;
  setPage: (page: number) => void;
  sort: StickerSortOption;
  changeSort: (sort: StickerSortOption) => void;
  stickers: StickerResponse[];
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
  isError: boolean;
}

export function StickerSidebar({
  isOpen,
  close,
  page,
  setPage,
  sort,
  changeSort,
  stickers,
  totalPages,
  totalElements,
  isLoading,
  isError,
}: StickerSidebarProps) {
  // 규격 6번: Esc로 닫기
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <>
      {/* 규격 8번: 바깥 클릭 영역 z-index 30 */}
      <div
        className={`fixed inset-0 z-30 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      {/* 규격 8번: 패널 z-index 40 */}
      <aside
        style={{
          top: `${PANEL_TOP}px`,
          width: `${PANEL_WIDTH}px`,
          height: `min(${PANEL_MAX_HEIGHT}px, calc(100vh - ${PANEL_USABLE_HEIGHT_OFFSET}px))`,
        }}
        className={`fixed right-0 z-40 flex max-w-[85vw] flex-col bg-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#40312E] text-white">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-gray-900">스티커 앨범</h2>
              <span className="rounded-full bg-[#FFEDD5] px-2 py-0.5 text-xs font-semibold text-[#F97316]">
                {totalElements}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              지금까지 만든 나만의 스티커에요.
            </p>
          </div>

          {/* 규격 3번: X버튼은 공통 틀이 제공 예정 - 지금은 자체 구현, 헤더 우측 상단 56px 정도 비워둠 */}
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center px-6 pb-3">
          <SortDropdown value={sort} onChange={changeSort} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-3">
          {isLoading && (
            <p className="mt-10 text-center text-sm text-gray-400">
              불러오는 중...
            </p>
          )}
          {isError && (
            <p className="mt-10 text-center text-sm text-red-400">
              스티커를 불러오지 못했어요.
            </p>
          )}
          {!isLoading && !isError && stickers.length === 0 && (
            <p className="mt-10 text-center text-sm text-gray-400">
              아직 만든 스티커가 없어요.
            </p>
          )}
          {!isLoading && !isError && stickers.length > 0 && (
            <StickerGridView stickers={stickers} />
          )}
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              ariaLabel="스티커 앨범 페이지네이션"
            />
          </div>
        )}
      </aside>
    </>
  );
}
