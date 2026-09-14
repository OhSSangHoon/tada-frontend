"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchDiaries } from "@/domains/search/api/searchApi";

const PAGE_SIZE = 3;

export function useSearch() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(0);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["search", submittedQuery, page],
    queryFn: () =>
      searchDiaries({ query: submittedQuery, page, size: PAGE_SIZE }),
    enabled: submittedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  function submit() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    setPage(0);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
  }

  return {
    inputValue,
    setInputValue,
    submit,
    submittedQuery,
    page,
    goToPage,
    result: data,
    isFetching,
    isError,
    error,
  };
}
