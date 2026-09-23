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

// 백엔드 ExtractionResult(global/event/dto)와 형태만 맞춤
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
  // 새로 추출한 인물/장소/활동. 보내지 않으면 기존 추출 결과를 그대로 유지한다.
  // 빈 값을 보내면 기존 인물/장소/활동이 전부 지워지므로, AI 재추출 연동 전에는 보내지 않는다.
  extractionResult?: ExtractionResult;
}

// app/api/generate-title 라우트가 n8n diary-analysis 응답을 이 형태로 재가공해서 준다
export interface GenerateTitleResponse {
  title: string;
  compressedKeyword: string;
  extractedKeywords: string[];
  extractionResult: ExtractionResult;
}

export interface GenerateStickerResponse {
  imageUrl: string;
}
