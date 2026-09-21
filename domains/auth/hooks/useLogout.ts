import { useMutation } from "@tanstack/react-query";
import { logout } from "@/domains/auth/api/authApi";
import { clearAccessToken, clearRefreshToken } from "@/shared/lib/token-store";

// 현재 로그인 상태를 종료한다.
export function useLogout() {

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      // Access Token은 메모리에서 삭제한다.
      clearAccessToken();

      // Refresh Token은 sessionStorage에서 삭제한다.
      clearRefreshToken();

    },
  });
}
