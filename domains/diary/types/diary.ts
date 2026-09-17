export interface CanCreateResponse {
  canCreate: boolean;
  reason: string | null;
}

export type StickerType = "EXTRACTED" | "COMPRESSED";

export interface DiaryDetail {
  id: string;
  entryDate: string;
  title: string;
  weather: string | null;
  content: string;
}

// 백엔드 ExtractionResult(global/event/dto)와 형태만 맞춤 — Gemini 연동 전까지는 항상 빈 배열로 mock
export interface ExtractionResult {
  persons: unknown[];
  places: unknown[];
  activities: unknown[];
}

export interface CreateDiaryRequest {
  entryDate: string;
  title: string;
  weather: string | null;
  content: string;
  imageUrl: string;
  keyword: string;
  type: StickerType;
  extractionResult: ExtractionResult;
}

export interface UpdateDiaryRequest {
  title: string;
  weather: string | null;
  content: string;
}

// mock — generate-title 백엔드 미구현(5주차 예정)이라 프론트에서 흉내만 냄
export interface GenerateTitleResult {
  title: string;
  keywords: string[];
}

// mock — generate-sticker/regenerate-sticker 백엔드 미구현(5주차 예정)
export interface GenerateStickerResult {
  imageUrl: string;
}