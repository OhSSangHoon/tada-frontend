"use client";

import { createContext, useContext } from "react";

// Access Token 복원(reissue)이 끝났는지 여부.
// 인증이 실제로 필요한 하위 트리(예: useMe()를 쓰는 컴포넌트)만 이 값을 참고해
// 기다리도록 하고, 앱 전체 렌더링을 막는 데는 쓰지 않는다.
const AuthReadyContext = createContext(false);

export const AuthReadyProvider = AuthReadyContext.Provider;

export function useAuthReady() {
  return useContext(AuthReadyContext);
}
