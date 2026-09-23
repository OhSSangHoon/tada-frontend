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

// n8n diary-analysis 웹훅을 서버 라우트(app/api/generate-title)를 거쳐 호출한다.
// 웹훅 URL이 인증 없이 열려있어서 클라이언트가 직접 부르면 무제한 남용될 수 있어 프록시를 둔다.
export async function generateTitle(
  content: string,
  weather: string | null,
): Promise<GenerateTitleResponse> {
  const response = await fetch("/api/generate-title", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, weather }),
  });

  let result: GenerateTitleResponse & { message?: string };
  try {
    result = await response.json();
  } catch {
    throw new Error("요청에 실패했습니다. 다시 시도해주세요.");
  }

  if (!response.ok) {
    throw new Error(result.message ?? "요청에 실패했습니다.");
  }

  return result;
}

// regenerate-sticker는 별도 엔드포인트 없이 같은 keyword로 이 함수를 다시 호출하면 된다 (백엔드 확정 사항)
export async function generateSticker(
  keyword: string,
): Promise<GenerateStickerResponse> {
  return apiClient<GenerateStickerResponse>("/api/diaries/generate-sticker", {
    method: "POST",
    body: { keyword },
  });
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
