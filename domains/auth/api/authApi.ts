import { apiClient } from "@/shared/lib/api-client";
import {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RefreshTokenRequest,
  SignupRequest,
} from "@/domains/auth/types/auth";

// 일반 회원가입
export function signUp(request: SignupRequest) {
  return apiClient<void>("/api/auth/signup", {
    method: "POST",
    body: request,
  });
}

// 일반 로그인
export function login(request: LoginRequest) {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: request,
  });
}

// Refresh Token으로 Access Token 재발급
export function reissue(request: RefreshTokenRequest) {
  return apiClient<AuthResponse>("/api/auth/reissue", {
    method: "POST",
    body: request,
  });
}

// 현재 로그인한 사용자 확인
export function getMe() {
  return apiClient<MeResponse>("/api/auth/me", {
    method: "GET",
  });
}

// 로그아웃
export function logout() {
  return apiClient<void>("/api/auth/logout", {
    method: "POST",
  });
}

/* api-client.ts의 역할

authApi.ts
   ↓
apiClient(경로, 요청 옵션)
   ↓
Authorization 자동 첨부
   ↓
401 → reissue
   ↓
백엔드

*/