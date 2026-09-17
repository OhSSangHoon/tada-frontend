"use client";

import { useState, type FormEvent } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchDiaries, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/domains/search/api/searchApi";
import type { SearchResultPage } from "@/domains/search/types/search";
import type { ApiError } from "@/shared/lib/api-client";

export const MAX_QUERY_LENGTH = 20;

export function useSearch() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data,isLoading, isFetching, isError, error, refetch } = useQuery<SearchResultPage, ApiError>({
    queryKey: ["search", submittedQuery, page],
    queryFn: () =>
      searchDiaries({ query: submittedQuery, page, size: DEFAULT_PAGE_SIZE }),
    enabled: submittedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();

    const trimmed = inputValue.trim();

    if (trimmed.length === 0) {
      setValidationError("검색어를 입력해주세요.");
      return;
    }

    if (trimmed.length > MAX_QUERY_LENGTH) {
      setValidationError(`검색어는 ${MAX_QUERY_LENGTH}자 이내로 입력해 주세요.`);
      return;
    }
    
    setValidationError(null);
    setPage(DEFAULT_PAGE);
    setSubmittedQuery(trimmed);
  }

const goToPage = (nextPage: number) => setPage(nextPage);
  
  const reset = () => {
    setInputValue("");
    setSubmittedQuery("");
    setPage(DEFAULT_PAGE);
    setValidationError(null);
  };

  return {
    inputValue,
    setInputValue,
    submittedQuery,
    handleSubmit,
    validationError,
    page,
    goToPage,
    data,
    isLoading: isLoading && submittedQuery.length > 0,
    isFetching,
    isError,
    error,
    refetch,
    reset,
    hasSearched: submittedQuery.length > 0,
  };
}
