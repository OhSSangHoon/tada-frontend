import { apiClient } from "@/shared/lib/api-client";
import type {
  CanCreateResponse,
  CreateDiaryRequest,
  DiaryResponse,
  GenerateStickerResponse,
  GenerateTitleResponse,
  TrashedDiaryResponse,
  UpdateDiaryRequest,
} from "@/domains/diary/types/diary";

export async function checkCanCreate(date: string): Promise<CanCreateResponse> {
  return apiClient<CanCreateResponse>(`/api/diaries/can-create?date=${date}`);
}

export async function getDiary(id: string): Promise<DiaryResponse> {
  return apiClient<DiaryResponse>(`/api/diaries/${id}`);
}

export async function createDiary(
  payload: CreateDiaryRequest,
): Promise<DiaryResponse> {
  return apiClient<DiaryResponse>("/api/diaries", {
    method: "POST",
    body: payload,
  });
}

export async function updateDiary(
  id: string,
  payload: UpdateDiaryRequest,
): Promise<DiaryResponse> {
  return apiClient<DiaryResponse>(`/api/diaries/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function trashDiary(id: string): Promise<void> {
  return apiClient<void>(`/api/diaries/${id}`, { method: "DELETE" });
}

// mock 스티커 이미지 — 실제 생성 연동 전까지 public/stickers/의 임시 이미지로 대체
const MOCK_STICKER_PATHS = [
  "/stickers/flower.png",
  "/stickers/coffee.png",
  "/stickers/cat.png",
  "/stickers/peace.png",
  "/stickers/wink.png",
  "/stickers/eyes.png",
  "/stickers/tulip.png",
  "/stickers/moon.png",
  "/stickers/goodday.png",
];

// excludeImageUrl 있으면 그거랑 다른 걸 뽑음 — "다시 생성하기" 눌렀을 때 같은 스티커가 다시 뜨는 걸 방지
function mockStickerImageUrl(excludeImageUrl?: string): string {
  let index = Math.floor(Math.random() * MOCK_STICKER_PATHS.length);
  if (excludeImageUrl && MOCK_STICKER_PATHS.length > 1) {
    while (MOCK_STICKER_PATHS[index] === excludeImageUrl) {
      index = Math.floor(Math.random() * MOCK_STICKER_PATHS.length);
    }
  }
  return MOCK_STICKER_PATHS[index];
}

// mock — generate-title 백엔드 미구현이라 본문에서 간단히 흉내만 냄
export async function generateTitle(
  content: string,
): Promise<GenerateTitleResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const trimmed = content.trim().slice(0, 20) || "오늘의 기록";
  const words = content.trim().split(/\s+/).filter(Boolean);

  return {
    title: trimmed,
    keywords: [words[0] ?? "하루", words[1] ?? "기록", trimmed.slice(0, 10)],
  };
}

// mock — generate-sticker/regenerate-sticker 백엔드 미구현
export async function generateSticker(
  keyword: string,
  excludeImageUrl?: string,
): Promise<GenerateStickerResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return { imageUrl: mockStickerImageUrl(excludeImageUrl) };
}

export async function getTrashedDiaries(): Promise<TrashedDiaryResponse[]> {
  return apiClient<TrashedDiaryResponse[]>("/api/diaries/trash");
}

export async function restoreDiary(
  id: string,
  replace = false,
): Promise<DiaryResponse> {
  return apiClient<DiaryResponse>(
    `/api/diaries/${id}/restore${replace ? "?replace=true" : ""}`,
    { method: "POST" },
  );
}
