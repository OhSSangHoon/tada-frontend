import { apiClient } from "@/shared/lib/api-client";
import type { SearchResultPage } from "@/domains/search/types/search";

interface SearchParams {
  query: string;
  page?: number;
  size?: number;
}

// 백엔드 SearchController의 기본값과 동일하게 맞춤
export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 3;

// GET /api/search?query=&page=&size=
export function searchDiaries({
  query,
  page = DEFAULT_PAGE,
  size = DEFAULT_PAGE_SIZE,
 }: SearchParams) {
  const params = new URLSearchParams({
    query,
    page: String(page),
    size: String(size),
  });

  return apiClient<SearchResultPage>(`/api/search?${params.toString()}`);
}
