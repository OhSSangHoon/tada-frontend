// 모든 도메인 api/*.ts가 공유하는 얇은 fetch 래퍼.
// 책임: 엔드포인트 조합, credentials: "include", ApiResponse<T> 파싱 + 에러 정규화.
// 책임 아님(진경 담당): Authorization 헤더 자동 첨부, 401 시 reissue 후 재시도
//   → headers 병합 지점과 에러 throw 지점만 남겨두고, 그 로직 자체는 구현하지 않는다.
import type { ApiResponse } from "@/shared/types/api-response";
import {
  clearAccessToken,
  clearRefreshToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/shared/lib/token-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiClientOptions = Omit<RequestInit, "body"> & { body?: unknown };

// 인증 정보를 모두 정리한다.
export function clearAuth() {
  // Access Token 삭제
  clearAccessToken();

  // Refresh Token 삭제
  clearRefreshToken();

  // 인증이 해제되었다는 것을 React Query 쪽에 알린다.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-cleared"));
  }
}

// Refresh Token으로 Access Token 재발급
async function reissueAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    const result: ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }> = await response.json();

    if (!response.ok || !result.success || !result.data) {
      return null;
    }

    // 새 Access Token 저장
    setAccessToken(result.data.accessToken);

    // 백엔드가 Refresh Token도 반환하므로 최신 값으로 저장한다.
    setRefreshToken(result.data.refreshToken);

    return result.data.accessToken;
  } catch {
    return null;
  }
}

export async function apiClient<T>(
  path: string,
  { body, headers, ...options }: ApiClientOptions = {},
): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,

      // 진경 담당: Access Token이 있으면 Authorization 헤더에 추가
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    // 로그인/회원가입/재발급 자체에서 발생한 401은
    // 다시 reissue하지 않는다.
    const isAuthPublicApi =
      path === "/api/auth/login" ||
      path === "/api/auth/signup" ||
      path === "/api/auth/reissue";

    // 진경 담당: 인증이 필요한 API의 401인 경우에만
    // Refresh Token으로 Access Token 재발급
    if (response.status === 401 && !isAuthPublicApi) {
      const newAccessToken = await reissueAccessToken();

      if (newAccessToken) {
        // 원래 요청을 새 Access Token으로 1회 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });

        const retryResult: ApiResponse<T> = await retryResponse.json();

        // 재시도 성공
        if (retryResponse.ok && retryResult.success) {
          return retryResult.data as T;
        }

        // 재시도까지 401이면 인증 만료로 처리
        if (retryResponse.status === 401) {
          clearAuth();
        }

        throw new ApiError(
          retryResponse.status,
          retryResult.message ?? "요청에 실패했습니다.",
        );
      }

      // Refresh Token 재발급도 실패하면 로그아웃 상태로 정리
      clearAuth();
    }

    // 403은 로그아웃하지 않고 그대로 에러 처리
    throw new ApiError(
      response.status,
      result.message ?? "요청에 실패했습니다.",
    );
  }

  return result.data as T;
}