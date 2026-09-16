//export {};

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