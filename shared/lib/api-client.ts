// 모든 도메인 api/*.ts가 공유하는 얇은 fetch 래퍼.
// 책임: 엔드포인트 조합, credentials: "include", ApiResponse<T> 파싱 + 에러 정규화.
// 책임 아님(진경 담당): Authorization 헤더 자동 첨부, 401 시 reissue 후 재시도
//   → headers 병합 지점과 에러 throw 지점만 남겨두고, 그 로직 자체는 구현하지 않는다.
import type { ApiResponse } from "@/shared/types/api-response";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiClientOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiClient<T>(
  path: string,
  { body, headers, ...options }: ApiClientOptions = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers }, // 진경이 여기에 Authorization 헤더를 병합하게 될 자리
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    // 진경이 이 catch 지점(또는 이 함수를 감싼 래퍼)에서 401만 걸러내
    // reissue 호출 → 원요청 1회 재시도를 붙이면 됨
    throw new ApiError(response.status, result.message ?? "요청에 실패했습니다.");
  }

  return result.data as T;
}
