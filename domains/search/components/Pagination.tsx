"use client";

interface PaginationProps {
  currentPage: number; // 0-base
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

function getVisiblePages(current: number, total: number): number[] {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i);
  }

  let start = Math.max(0, (current - Math.floor(MAX_VISIBLE_PAGES / 2)));
  let end = start + MAX_VISIBLE_PAGES - 1;

  if (end > total - 1) {
    end = total - 1;
    start = end - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function PageButton({
  page,
  isActive,
  onClick,
}: {
  page: number;
  isActive: boolean;
  onClick: (page: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
  ? "flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-sm font-medium text-white cursor-pointer"
  : "flex h-7 w-7 items-center justify-center rounded-md text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
      }
    >
      {page + 1}
    </button>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages -1;

  return (
    <nav className="flex items-center justify-center gap-1 py-2" aria-label="검색 결과 페이지네이션">
      <button
      type="button"
      onClick={() => onPageChange(currentPage -1)}
      disabled={isFirst}
      className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      aria-label="이전 페이지"
      >
        ‹
      </button>

      {visiblePages[0] > 0 && (
        <>
        <PageButton page={0} isActive={false} onClick={onPageChange} />
        {visiblePages[0] > 1 && <span className="px-1 text-xs text-gray-400">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <PageButton key={page} page={page} isActive={page === currentPage} onClick={onPageChange} />
      ))}

      {visiblePages[visiblePages.length -1] < totalPages - 1 && (
        <>
        {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
          <span className="px-1 text-xs text-gray-400">...</span>
        )}
        <PageButton page={totalPages - 1} isActive={false} onClick={onPageChange}/>
        </>
      )}

      <button
      type="button"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={isLast}
      className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  )
}
