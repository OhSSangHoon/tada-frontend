import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/domains/auth/api/authApi";
import { SignupRequest } from "@/domains/auth/types/auth";

export function useSignup() {
  return useMutation({
    mutationFn: (request: SignupRequest) => signUp(request),
  });
}

/*
 SignupForm
    ↓
 useSignup()
    ↓
 authApi.signUp()
    ↓
 apiClient()
    ↓
 POST /api/auth/signup
 */