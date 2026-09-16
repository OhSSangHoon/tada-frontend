interface PaginationProps {
  currentPage: number; // 0-base
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  isFirst,
  isLast,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="search-pagination">
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
      >
        이전
      </button>
      <span>
        {currentPage + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음
      </button>
    </div>
  );
}
