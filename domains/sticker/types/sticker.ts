import type { StickerType } from "@/domains/diary/types/diary";

export type StickerSortOption = "latest" | "oldest";

export interface StickerResponse {
  id: string;
  diaryId: string;
  imageUrl: string;
  keyword: string;
  type: StickerType;
  createdAt: string;
}

export interface StickerPage {
  content: StickerResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
