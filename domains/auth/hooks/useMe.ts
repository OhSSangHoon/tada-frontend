import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "@/domains/auth/api/authApi";
import { useAuthReady } from "@/shared/lib/auth-ready-context";
import { useAccessToken } from "@/shared/lib/token-store";

// 현재 로그인한 사용자 정보를 조회한다.
export function useMe() {
  const accessToken = useAccessToken();
  const isAuthReady = useAuthReady();

  // 인증이 해제되었을 때 현재 사용자 캐시를 삭제하기 위해 사용한다.
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh Token까지 만료되어 인증 정보가 모두 삭제되면 실행된다.
    const handleAuthCleared = () => {
      // 이전 로그인 사용자의 정보를 캐시에서 제거한다.
      queryClient.removeQueries({
        queryKey: ["auth", "me"],
      });
    };

    // api-client에서 발생시키는 인증 해제 이벤트를 감지한다.
    window.addEventListener("auth-cleared", handleAuthCleared);

    return () => {
      window.removeEventListener("auth-cleared", handleAuthCleared);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,

    // Access Token 복원이 끝나고,
    // 그 결과 Access Token이 있을 때만 사용자 정보를 조회한다.
    enabled: isAuthReady && !!accessToken,

    // 인증 실패 시 불필요한 재요청을 하지 않는다.
    retry: false,
  });
}
