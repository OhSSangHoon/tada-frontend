import { apiClient } from "@/shared/lib/api-client";
import type {
    CanCreateResponse,
    CreateDiaryRequest,
    DiaryDetail,
    GenerateStickerResult,
    GenerateTitleResult,
    UpdateDiaryRequest,
} from "@/domains/diary/types/diary";

// TEMP: 진경의 api-client.ts 인증 헤더 자동 첨부가 아직 없어서, 로컬 테스트용으로만 .env.local의
// NEXT_PUBLIC_DEV_TOKEN을 붙임 (.env.local은 git에 안 올라감). 진경 쪽 구현되면 이 블록 삭제.
const devAuthHeader = process.env.NEXT_PUBLIC_DEV_TOKEN
    ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DEV_TOKEN}` }
    : undefined;

export async function checkCanCreate(date: string): Promise<CanCreateResponse> {
    return apiClient<CanCreateResponse>(`/api/diaries/can-create?date=${date}`, { headers: devAuthHeader });
}

export async function getDiary(id: string): Promise<DiaryDetail> {
    return apiClient<DiaryDetail>(`/api/diaries/${id}`, { headers: devAuthHeader });
}

export async function createDiary(payload: CreateDiaryRequest): Promise<DiaryDetail> {
    return apiClient<DiaryDetail>("/api/diaries", { method: "POST", body: payload, headers: devAuthHeader });
}

export async function updateDiary(id: string, payload: UpdateDiaryRequest): Promise<DiaryDetail> {
    return apiClient<DiaryDetail>(`/api/diaries/${id}`, { method: "PUT", body: payload, headers: devAuthHeader });
}

export async function trashDiary(id: string): Promise<void> {
    return apiClient<void>(`/api/diaries/${id}`, { method: "DELETE", headers: devAuthHeader });
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
export async function generateTitle(content: string): Promise<GenerateTitleResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const trimmed = content.trim().slice(0, 20) || "오늘의 기록";
    const words = content.trim().split(/\s+/).filter(Boolean);

    return {
        title: trimmed,
        keywords: [words[0] ?? "하루", words[1] ?? "기록", trimmed.slice(0, 10)],
    };
}

// mock — generate-sticker/regenerate-sticker 백엔드 미구현
export async function generateSticker(keyword: string, excludeImageUrl?: string): Promise<GenerateStickerResult> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return { imageUrl: mockStickerImageUrl(excludeImageUrl) };
}