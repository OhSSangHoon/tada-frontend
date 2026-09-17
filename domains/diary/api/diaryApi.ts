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

// mock 스티커 이미지 5종 — 실제 아이콘 자산 오기 전까지 임의 SVG로 대체
const MOCK_STICKER_SVGS = [
    // 커피
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <rect x="35" y="45" width="50" height="55" rx="8" fill="#F5E6D3" stroke="#1F2937" stroke-width="3"/>
        <rect x="35" y="60" width="50" height="20" fill="#34A853" stroke="#1F2937" stroke-width="3"/>
        <path d="M60 65 C55 60 45 63 48 70 C50 76 60 82 60 82 C60 82 70 76 72 70 C75 63 65 60 60 65 Z" fill="#F06292"/>
        <rect x="42" y="30" width="36" height="15" rx="6" fill="#8D6E63" stroke="#1F2937" stroke-width="3"/>
        <path d="M85 55 Q100 58 95 72 Q92 80 82 78" fill="none" stroke="#1F2937" stroke-width="3"/>
    </svg>`,
    // 고양이
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <path d="M35 40 L45 15 L58 38 Z" fill="#FFFFFF" stroke="#1F2937" stroke-width="3"/>
        <path d="M85 40 L75 15 L62 38 Z" fill="#FFFFFF" stroke="#1F2937" stroke-width="3"/>
        <circle cx="60" cy="55" r="35" fill="#FFFFFF" stroke="#1F2937" stroke-width="3"/>
        <circle cx="42" cy="55" r="5" fill="#F8BBD0"/>
        <circle cx="78" cy="55" r="5" fill="#F8BBD0"/>
        <circle cx="48" cy="52" r="3" fill="#1F2937"/>
        <circle cx="72" cy="52" r="3" fill="#1F2937"/>
        <path d="M55 62 Q60 66 65 62" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="30" cy="80" rx="12" ry="16" fill="#FFFFFF" stroke="#1F2937" stroke-width="3"/>
        <ellipse cx="90" cy="80" rx="12" ry="16" fill="#FFFFFF" stroke="#1F2937" stroke-width="3"/>
    </svg>`,
    // 브이
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="45" fill="#7C3AED" stroke="#1F2937" stroke-width="3"/>
        <path d="M50 35 L50 70 M70 35 L70 70" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>
        <path d="M40 70 Q60 90 80 70" fill="#FFFFFF" stroke="#1F2937" stroke-width="2"/>
        <path d="M25 40 l6 4 M95 40 l-6 4 M60 20 l0 8" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    // 꽃
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <g stroke="#1F2937" stroke-width="3">
            <ellipse cx="60" cy="30" rx="16" ry="20" fill="#EC4899"/>
            <ellipse cx="60" cy="90" rx="16" ry="20" fill="#EC4899"/>
            <ellipse cx="30" cy="60" rx="20" ry="16" fill="#EC4899"/>
            <ellipse cx="90" cy="60" rx="20" ry="16" fill="#EC4899"/>
            <circle cx="60" cy="60" r="22" fill="#FDE047"/>
        </g>
        <circle cx="52" cy="57" r="3" fill="#1F2937"/>
        <circle cx="68" cy="57" r="3" fill="#1F2937"/>
        <path d="M52 66 Q60 72 68 66" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    // GOOD DAY
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <ellipse cx="60" cy="60" rx="50" ry="38" fill="#38BDF8" stroke="#1F2937" stroke-width="3"/>
        <text x="60" y="52" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="18" fill="#EC4899" stroke="#1F2937" stroke-width="1">GOOD</text>
        <text x="60" y="76" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="20" fill="#FDE047" stroke="#1F2937" stroke-width="1">DAY</text>
        <path d="M15 30 l6 4 -6 4 4-6 -6-4 z" fill="#FBBF24"/>
        <path d="M100 85 l6 4 -6 4 4-6 -6-4 z" fill="#FBBF24"/>
    </svg>`,
];

function mockStickerImageUrl(keyword: string): string {
    const index = Math.abs(
        keyword.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    ) % MOCK_STICKER_SVGS.length;
    return `data:image/svg+xml,${encodeURIComponent(MOCK_STICKER_SVGS[index])}`;
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
export async function generateSticker(keyword: string): Promise<GenerateStickerResult> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return { imageUrl: mockStickerImageUrl(keyword) };
}