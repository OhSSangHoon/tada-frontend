"use client";

// QueryClientProvider 조립 지점. @tanstack/react-query는 이미 설치돼 있음(package.json).
// useState로 QueryClient를 만들어야 리렌더/재요청마다 새로 생성되지 않음(공식 App Router 패턴).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { reissue } from "@/domains/auth/api/authApi";
import { AuthReadyProvider } from "@/shared/lib/auth-ready-context";
import {
  clearRefreshToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/shared/lib/token-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // 진경이 여기에 부팅 시 sessionStorage refreshToken → 조용한 reissue 호출을
  // useEffect로 붙이면 됨 (accessToken 메모리 복원, 새로고침해도 로그인 유지).
  const hasRestoredRef = useRef(false);

  // Access Token 복원이 끝났는지 관리한다.
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // 부팅 시 한 번만 Access Token 복원을 시도한다.
    if (hasRestoredRef.current) {
      return;
    }

    hasRestoredRef.current = true;

    const restoreAccessToken = async () => {
      const refreshToken = getRefreshToken();

      // Refresh Token이 없으면 로그인하지 않은 상태이므로 종료한다.
      if (!refreshToken) {
        setIsAuthReady(true);
        return;
      }

      try {
        const data = await reissue({
          refreshToken,
        });

        // Access Token은 메모리에만 저장한다.
        setAccessToken(data.accessToken);

        // 백엔드가 Refresh Token도 반환하므로 최신 값으로 저장한다.
        setRefreshToken(data.refreshToken);
      } catch {
        // Refresh Token 재발급에 실패하면 저장된 Refresh Token을 제거한다.
        clearRefreshToken();
      } finally {
        // Access Token 복원이 끝난 후 children을 렌더링한다.
        setIsAuthReady(true);
      }
    };

    restoreAccessToken();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthReadyProvider value={isAuthReady}>{children}</AuthReadyProvider>
    </QueryClientProvider>
  );
}
