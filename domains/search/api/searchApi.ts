import { apiClient } from "@/shared/lib/api-client";
import type { SearchResultPage } from "@/domains/search/types/search";

interface SearchParams {
  query: string;
  page?: number;
  size?: number;
}

// GET /api/search?query=&page=&size=
export function searchDiaries({ query, page = 0, size = 3 }: SearchParams) {
  const params = new URLSearchParams({
    query,
    page: String(page),
    size: String(size),
  });

  return apiClient<SearchResultPage>(`/api/search?${params.toString()}`);
}
