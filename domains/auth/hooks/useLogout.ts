import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/domains/auth/api/authApi";
import { clearAuth } from "@/shared/lib/api-client";

// 현재 로그인 상태를 종료한다.
export function useLogout() {
  // 로그아웃 후 이전 사용자 정보를 캐시에서 제거하기 위해 사용한다.
  const queryClient = useQueryClient();

  // 로그아웃 후 홈으로 이동시키기 위해 사용한다.
  const router = useRouter();

  return useMutation({
    mutationFn: logout,

    // 서버 로그아웃 성공 여부와 관계없이
    // 클라이언트의 로그인 상태는 정리한다.
    onSettled: () => {
      // Access/Refresh Token 삭제 + "auth-cleared" 이벤트 발행.
      // (토큰 강제 만료 시 api-client가 쓰는 것과 같은 정리 로직을 재사용한다.)
      clearAuth();

      queryClient.removeQueries({
        queryKey: ["auth", "me"],
      });

      // 로그인 상태를 전제로 열려 있던 화면(작성/상세 모달 등)이 남아있지 않도록 홈으로 보낸다.
      router.push("/");
    },
  });
}
