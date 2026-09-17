"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchDiaries, DEFAULT_PAGE_SIZE } from "@/domains/search/api/searchApi";
import type { SearchResultPage } from "@/domains/search/types/search";
import type { ApiError } from "@/shared/lib/api-client";

export const MAX_QUERY_LENGTH = 20;

export function useSearch() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data, isFetching, isError, error, refetch } = useQuery<SearchResultPage, ApiError>({
    queryKey: ["search", submittedQuery, page],
    queryFn: () =>
      searchDiaries({ query: submittedQuery, page, size: DEFAULT_PAGE_SIZE }),
    enabled: submittedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  function handleInputChange(value: string) {
    setInputValue(value);
    if (validationError) setValidationError(null); // 재입력 시작하면 에러 메시지 지움
  }

  function submit() {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setValidationError("검색어를 입력해 주세요.");
      return;
    }
    if (trimmed.length > MAX_QUERY_LENGTH) {
      setValidationError(`검색어는 ${MAX_QUERY_LENGTH}자 이내로 입력해 주세요.`);
      return;
    }
    
    setValidationError(null);
    setSubmittedQuery(trimmed);
    setPage(0);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
  }

  return {
    inputValue,
    setInputValue: handleInputChange,
    submit,
    submittedQuery,
    page,
    goToPage,
    result: data,
    isFetching,
    isError,
    error,
    refetch,
    validationError,
  };
}
