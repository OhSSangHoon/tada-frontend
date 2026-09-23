"use client";

import {
  SidePanelHeader,
  SidePanelBody,
} from "@/shared/components/side-panel/SidePanelParts";
import { Pagination } from "@/domains/search/components/Pagination";
import { SortDropdown } from "@/domains/sticker/components/SortDropdown";
import { StickerGridView } from "@/domains/sticker/components/StickerGridView";
import { useStickers } from "@/domains/sticker/hooks/useStickers";

interface StickerPanelProps {
  isOpen: boolean;
}

export function StickerPanel({ isOpen }: StickerPanelProps) {
  const {
    page,
    setPage,
    sort,
    changeSort,
    stickers,
    totalPages,
    totalElements,
    isLoading,
    isError,
  } = useStickers(isOpen);

  return (
    <>
      <SidePanelHeader
        title="스티커 앨범"
        badge={totalElements}
        description="지금까지 만든 나만의 스티커에요."
      />

      <div className="shrink-0 px-6 pb-3">
        <SortDropdown value={sort} onChange={changeSort} />
      </div>

      <SidePanelBody>
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
      </SidePanelBody>

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
    </>
  );
}
