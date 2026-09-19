import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/domains/auth/api/authApi";
import type { SignupRequest } from "@/domains/auth/types/auth";

export function useSignup() {
  return useMutation({
    mutationFn: (request: SignupRequest) => signUp(request),


  });
}
