import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/domains/auth/api/authApi";
import { getAccessToken } from "@/shared/lib/token-store";

// 현재 로그인한 사용자 정보를 조회한다.
export function useMe() {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,

    // Access Token이 있을 때만 사용자 정보를 조회한다.
    enabled: !!accessToken,

    // 인증 실패 시 불필요한 재요청을 하지 않는다.
    retry: false,
  });
}