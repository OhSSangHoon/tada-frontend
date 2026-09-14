"use client";

import { FormEvent } from "react";
import { useSearch } from "@/domains/search/hooks/useSearch";
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
            autoFocus
          />
          <button type="submit" disabled={isFetching}>
            검색
          </button>
        </form>

        {isFetching && <p className="search-modal__status">검색 중...</p>}
        {isError && (
          <p className="search-modal__status search-modal__status--error">
            검색 중 오류가 발생했습니다. 다시 시도해주세요
          </p>
        )}
        {result?.empty && (
          <p className="search-modal__status">검색 결과가 없습니다.</p>
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
