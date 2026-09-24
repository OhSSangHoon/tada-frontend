"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getStickers,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "@/domains/sticker/api/stickerApi";
import type { StickerSortOption } from "@/domains/sticker/types/sticker";

export function useStickers(isOpen: boolean) {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [sort, setSort] = useState<StickerSortOption>(DEFAULT_SORT);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["stickers", sort, page],
    queryFn: () => getStickers({ sort, page, size: DEFAULT_PAGE_SIZE }),
    placeholderData: keepPreviousData,
    enabled: isOpen,
  });

  const changeSort = (next: StickerSortOption) => {
    setSort(next);
    setPage(DEFAULT_PAGE);
  };

  return {
    page,
    setPage,
    sort,
    changeSort,
    stickers: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
