import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/domains/auth/api/authApi";
import { clearAccessToken } from "@/shared/lib/token-store";

// 현재 로그인 상태를 종료한다.
export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      // Access Token은 메모리에서 삭제한다.
      clearAccessToken();

      // Refresh Token은 sessionStorage에서 삭제한다.
      sessionStorage.removeItem("refreshToken");

      // 로그아웃 후 로그인 페이지로 이동한다.
      router.push("/login");
    },
  });
}