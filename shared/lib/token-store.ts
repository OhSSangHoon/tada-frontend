const REFRESH_TOKEN_KEY = "refreshToken";

let accessToken: string | null = null;

// Access Token 저장
export function setAccessToken(token: string) {
  accessToken = token;
}

// Access Token 조회
export function getAccessToken() {
  return accessToken;
}

// Access Token 삭제
export function clearAccessToken() {
  accessToken = null;
}

// Refresh Token 조회 (sessionStorage는 브라우저에서만 사용할 수 있다)
export function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

// Refresh Token 저장
export function setRefreshToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

// Refresh Token 삭제
export function clearRefreshToken() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}
