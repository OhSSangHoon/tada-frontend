import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/domains/auth/api/authApi";
import type { LoginRequest } from "@/domains/auth/types/auth";
import { setAccessToken, setRefreshToken } from "@/shared/lib/token-store";

export function useLogin() {
  // 로그인 성공 후 현재 사용자 정보를 다시 조회하기 위해 사용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),

    onSuccess: (data) => {
      // Access Token은 메모리에만 저장한다.
      setAccessToken(data.accessToken);

      // Refresh Token은 sessionStorage에 저장한다.
      setRefreshToken(data.refreshToken);

      // 로그인 성공 후 현재 사용자 정보를 다시 조회한다.
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });

      // 로그인 전 Authorization 헤더 없이 실패했을 수 있는 캘린더도 다시 조회한다.
      queryClient.invalidateQueries({
        queryKey: ["calendar"],
      });
    },
  });
}