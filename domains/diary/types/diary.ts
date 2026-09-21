export interface CanCreateResponse {
  canCreate: boolean;
  reason: string | null;
}

export type StickerType = "EXTRACTED" | "COMPRESSED";

export interface DiaryResponse {
  id: string;
  entryDate: string;
  title: string;
  weather: string | null;
  content: string;
}

// 휴지통 목록 응답: 일기 정보 + 스티커 정보 (스티커가 없는 옛 데이터는 null)
export interface TrashedDiaryResponse extends DiaryResponse {
  imageUrl: string | null;
  keyword: string | null;
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
  // 본문을 바꿔 저장할 때 백엔드가 필수로 요구함 (제목/날씨만 바꿀 땐 무시됨)
  extractionResult: ExtractionResult;
}

// mock — generate-title 백엔드 미구현(5주차 예정)이라 프론트에서 흉내만 냄
export interface GenerateTitleResponse {
  title: string;
  keywords: string[];
}

// mock — generate-sticker/regenerate-sticker 백엔드 미구현(5주차 예정)
export interface GenerateStickerResponse {
  imageUrl: string;
}
