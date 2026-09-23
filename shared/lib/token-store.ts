import { useSyncExternalStore } from "react";

const REFRESH_TOKEN_KEY = "refreshToken";

let accessToken: string | null = null;

// accessToken이 바뀔 때 리렌더가 필요한 컴포넌트(useAccessToken)에 알리기 위한 구독자 목록.
// accessToken은 일반 모듈 변수라 set/clear만으로는 아무 것도 리렌더되지 않는다.
const listeners = new Set<() => void>();

function notifyAccessTokenChange() {
  listeners.forEach((listener) => listener());
}

// Access Token 저장
export function setAccessToken(token: string) {
  accessToken = token;
  notifyAccessTokenChange();
}

// Access Token 조회
export function getAccessToken() {
  return accessToken;
}

// Access Token 삭제
export function clearAccessToken() {
  accessToken = null;
  notifyAccessTokenChange();
}

// accessToken 값을 구독해 변경 시 리렌더가 필요한 곳(예: useMe, useCalendar의 enabled 게이트)에서 사용한다.
export function useAccessToken() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getAccessToken,
    () => null,
  );
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
