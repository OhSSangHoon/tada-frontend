import { useMutation } from "@tanstack/react-query";
import { login } from "@/domains/auth/api/authApi";
import type { LoginRequest } from "@/domains/auth/types/auth";
import { setAccessToken, setRefreshToken } from "@/shared/lib/token-store";

export function useLogin() {

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),

    onSuccess: (data) => {
      // Access Token은 메모리에만 저장한다.
      setAccessToken(data.accessToken);

      // Refresh Token은 sessionStorage에 저장한다.
      setRefreshToken(data.refreshToken);

    },
  });
}
