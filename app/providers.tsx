"use client";

// QueryClientProvider 조립 지점. @tanstack/react-query는 이미 설치돼 있음(package.json).
// useState로 QueryClient를 만들어야 리렌더/재요청마다 새로 생성되지 않음(공식 App Router 패턴).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // 진경이 여기에 부팅 시 sessionStorage refreshToken → 조용한 reissue 호출을
  // useEffect로 붙이면 됨 (accessToken 메모리 복원, 새로고침해도 로그인 유지).

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
