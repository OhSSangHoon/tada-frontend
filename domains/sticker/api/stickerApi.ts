import { apiClient } from "@/shared/lib/api-client";
import type {
  StickerPage,
  StickerSortOption,
} from "@/domains/sticker/types/sticker";

interface FetchStickersParams {
  page?: number;
  size?: number;
  sort?: StickerSortOption;
}

export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_SORT: StickerSortOption = "latest";

export function fetchStickers({
  page = DEFAULT_PAGE,
  size = DEFAULT_PAGE_SIZE,
  sort = DEFAULT_SORT,
}: FetchStickersParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });
  return apiClient<StickerPage>(`/api/stickers?${params.toString()}`);
}
