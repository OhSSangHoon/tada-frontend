import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/domains/auth/api/authApi";
import { useAuthReady } from "@/shared/lib/auth-ready-context";
import { getAccessToken } from "@/shared/lib/token-store";

// 현재 로그인한 사용자 정보를 조회한다.
export function useMe() {
  const accessToken = getAccessToken();
  const isAuthReady = useAuthReady();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,

    // Access Token 복원이 끝나고, 그 결과 Access Token이 있을 때만 조회한다.
    enabled: isAuthReady && !!accessToken,

    // 인증 실패 시 불필요한 재요청을 하지 않는다.
    retry: false,
  });
}
