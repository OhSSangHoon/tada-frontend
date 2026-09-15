"use client";

import { FormEvent } from "react";
import { useSearch, MAX_QUERY_LENGTH } from "@/domains/search/hooks/useSearch";
import { SearchResultList } from "@/domains/search/components/SearchResultList";
import { Pagination } from "@/domains/search/components/Pagination";

interface SearchModalProps {
  onClose: () => void;
  onSelectDiary?: (diaryId: string) => void;
}

export function SearchModal({ onClose, onSelectDiary }: SearchModalProps) {
  const {
    inputValue,
    setInputValue,
    submit,
    submittedQuery,
    goToPage,
    result,
    isFetching,
    isError,
    error,
    refetch,
    validationError,
  } = useSearch();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="search-modal__form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="예: 기분 나쁜 날 있었나?"
            maxLength={MAX_QUERY_LENGTH}
            autoFocus
          />
          <button type="submit" disabled={isFetching}>
            검색
          </button>
        </form>

        {validationError && (
          <p className="search-modal__status search-modal__status--error" role="alert">
            {validationError}
          </p>
        )}

        {isFetching && (
          <p className="search-modal__status" aria-live="polite">
            검색 중...
          </p>
        )}

        {isError && (
          <div className="search-modal__status search-modal__status--error" role="alert">
            <p>{error?.message || "검색 중 오류가 발생했습니다."}</p>
            <button type="button" onClick={() => refetch()}>
              다시시도
            </button>
          </div>
        )}

        {result?.empty && (
          <p className="search-modal__status">
            &quot;{submittedQuery}&quot;에 대한 검색 결과가 없습니다.
            </p>
        )}

        {result && !result.empty && (
          <>
            <SearchResultList
              items={result.content}
              keyword={submittedQuery}
              onSelectDiary={onSelectDiary}
            />
            <Pagination
              currentPage={result.number}
              totalPages={result.totalPages}
              isFirst={result.first}
              isLast={result.last}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
