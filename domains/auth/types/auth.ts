// 백엔드와 주고받는 데이터 타입

// 일반 로그인 요청
export interface LoginRequest {
  loginId: string;
  password: string;
}

// 회원가입 요청
export interface SignupRequest {
  loginId: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
}

// Refresh Token 재발급 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 로그인 및 토큰 재발급 응답
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// 현재 로그인한 사용자 정보
export interface MeResponse {
  id: string;
  nickname: string;
}