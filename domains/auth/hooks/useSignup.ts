import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signUp } from "@/domains/auth/api/authApi";
import type { SignupRequest } from "@/domains/auth/types/auth";

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: (request: SignupRequest) => signUp(request),

    onSuccess: () => {
      // 회원가입 성공 후 로그인 페이지로 이동한다.
      router.push("/login");
    },
  });
}
