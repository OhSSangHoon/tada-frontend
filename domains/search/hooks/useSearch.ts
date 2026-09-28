"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  searchDiaries,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "@/domains/search/api/searchApi";
import type {
  SearchResultPage,
  SearchSortOption,
} from "@/domains/search/types/search";
import type { ApiError } from "@/shared/lib/api-client";

export const MAX_QUERY_LENGTH = 20;

// 검색 한 번에 미리 받아오는 후보 개수. 화면에는 DEFAULT_PAGE_SIZE(3)개씩 나눠서
// 보여주지만, 페이지를 넘길 때마다 서버에 다시 요청하면 SearchService가 매번
// Voyage AI 임베딩을 새로 계산하게 됨. 그래서 검색어/정렬이 바뀔 때만 이 개수만큼
// 한 번에 받아오고, 페이지 이동은 이미 받아온 결과를 프론트에서 잘라서 보여줌.
// 15개 = 페이지당 3개 기준으로 최대 5페이지까지. 값이 너무 작으면 실제로 더 많은
// 결과가 있어도 뒷부분이 페이지네이션에 안 잡히니 필요하면 이 값을 늘려서 조정.
const SEARCH_FETCH_SIZE = 15;

export function useSearch() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SearchSortOption>(DEFAULT_SORT);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<SearchResultPage, ApiError>({
    // page는 queryKey에서 뺐음: 페이지 이동은 이미 받아온 결과를 자르기만 할 뿐
    // 새로 fetch(=새 임베딩 호출)하지 않음. 검색어나 정렬이 바뀔 때만 재요청됨.
    queryKey: ["search", submittedQuery, sort],
    queryFn: () =>
      searchDiaries({
        query: submittedQuery,
        page: DEFAULT_PAGE,
        size: SEARCH_FETCH_SIZE,
        sort,
      }),
    enabled: submittedQuery.length > 0,
    placeholderData: keepPreviousData,
    // 검색은 내부적으로 임베딩 API(Voyage AI)를 호출하는데, 그쪽 분당 요청 제한에
    // 걸리면 재시도할수록 오히려 제한을 더 악화시키고 에러 확정까지도 오래 걸림
    // (기본값 3회 지수 백오프). 1회만 재시도하고 빠르게 에러 상태로 넘어가게 함.
    retry: 1,
    retryDelay: 1000,
  });

  // 서버에서 한 번에 받아온 결과(rawData)를 DEFAULT_PAGE_SIZE 단위로 잘라서
  // 화면에 보여줄 한 페이지 분량만 추려냄. 네트워크 요청도, 임베딩 재계산도 없이
  // 순수하게 프론트에서만 계산되는 값이라 페이지 이동이 즉시 반영됨.
  const data = useMemo(() => {
    if (!rawData) return rawData;

    const totalItems = rawData.content.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const start = safePage * DEFAULT_PAGE_SIZE;
    const pagedContent = rawData.content.slice(
      start,
      start + DEFAULT_PAGE_SIZE,
    );

    return {
      ...rawData,
      content: pagedContent,
      totalPages,
    };
  }, [rawData, page]);

  // 화면에 실제로 노출할 현재 페이지 번호. page state 자체는 건드리지 않고,
  // data.totalPages 기준으로 즉시 clamp한 값만 계산해서 내려줌. 이펙트+setState로
  // 동기화하면 불필요한 리렌더 케스케이드가 생겨서(set-state-in-effect) 순수 계산으로 대체
  const currentPage = data
    ? Math.min(page, Math.max(data.totalPages - 1, 0))
    : page;

  // 매칭되는 일기가 SEARCH_FETCH_SIZE(15)보다 많아서 서버에 더 있는데도
  // 못 받아온 상태인지 여부. 이 경우 화면에 "더 있음"을 알려주기 위해 사용

  const hasMoreResults = rawData
    ? rawData.totalElements > rawData.content.length
    : false;

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();

    const trimmed = inputValue.trim();

    if (trimmed.length === 0) {
      setValidationError("검색어를 입력해주세요.");
      return;
    }

    if (trimmed.length > MAX_QUERY_LENGTH) {
      setValidationError(
        `검색어는 ${MAX_QUERY_LENGTH}자 이내로 입력해 주세요.`,
      );
      return;
    }

    setValidationError(null);
    setPage(DEFAULT_PAGE);
    setSubmittedQuery(trimmed);
  };

  // 이미 받아온 rawData를 자르기만 하면 되므로 네트워크 요청 없이 즉시 반영됨
  const goToPage = (nextPage: number) => setPage(nextPage);

  // 정렬 옵션 변경 시 페이지는 0으로 리셋.
  // 최신순<->오래된순 전환은 서버 쿼리 자체가 달라서(entry_date ASC/DESC) 어쩔 수
  // 없이 재요청 + 재임베딩이 발생함 - 필요하면 이 부분도 나중에 클라이언트에서
  // 받아온 배열을 그냥 뒤집는 방식으로 최적화할 수 있음.
  const changeSort = (nextSort: SearchSortOption) => {
    setSort(nextSort);
    setPage(DEFAULT_PAGE);
  };

  const reset = () => {
    setInputValue("");
    setSubmittedQuery("");
    setPage(DEFAULT_PAGE);
    setSort(DEFAULT_SORT);
    setValidationError(null);
  };

  return {
    inputValue,
    setInputValue,
    submittedQuery,
    handleSubmit,
    validationError,
    page: currentPage,
    goToPage,
    sort,
    changeSort,
    data,
    hasMoreResults,
    isLoading: isLoading && submittedQuery.length > 0,
    isFetching,
    isError,
    error,
    refetch,
    reset,
    hasSearched: submittedQuery.length > 0,
  };
}
