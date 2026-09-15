import { useMutation } from "@tanstack/react-query";
import { login } from "@/domains/auth/api/authApi";
import { LoginRequest } from "@/domains/auth/types/auth";
import { setAccessToken } from "@/shared/lib/token-store";

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),

    onSuccess: (data) => {
      // Access Token은 메모리에만 저장한다.
      setAccessToken(data.accessToken);

      // Refresh Token은 sessionStorage에 저장한다.
      sessionStorage.setItem("refreshToken", data.refreshToken);
    },
  });
}


/*
 LoginForm
    ↓
 useLogin()
    ↓
 authApi.login()
    ↓
 apiClient()
    ↓
 POST /api/auth/login
 */