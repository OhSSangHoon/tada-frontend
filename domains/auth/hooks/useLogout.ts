import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/domains/auth/api/authApi";
import { clearAccessToken, clearRefreshToken } from "@/shared/lib/token-store";

// 현재 로그인 상태를 종료한다.
export function useLogout() {
  // 로그아웃 후 이전 사용자 정보를 캐시에서 제거하기 위해 사용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    // 서버 로그아웃 성공 여부와 관계없이
    // 클라이언트의 로그인 상태는 정리한다.
    onSettled: () => {
      clearAccessToken();
      clearRefreshToken();

      queryClient.removeQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
}