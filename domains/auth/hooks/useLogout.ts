import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/domains/auth/api/authApi";
import { clearAccessToken, clearRefreshToken } from "@/shared/lib/token-store";

// 현재 로그인 상태를 종료한다.
export function useLogout() {
  // 로그아웃 후 이전 사용자 정보를 캐시에서 제거하기 위해 사용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      // Access Token은 메모리에서 삭제한다.
      clearAccessToken();

      // Refresh Token은 sessionStorage에서 삭제한다.
      clearRefreshToken();

      // 이전 로그인 사용자의 정보를 캐시에서 제거한다.
      queryClient.removeQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
}