"use client";

import { FormEvent, useState } from "react";
import { useLogin } from "@/domains/auth/hooks/useLogin";
import { useSocialLogin } from "@/domains/auth/hooks/useSocialLogin";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const { socialLogin } = useSocialLogin(onSuccess);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginMutation.mutate(
      {
        loginId,
        password,
      },
      {
        onSuccess,
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 아이디 */}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
          ♙
        </span>

        <input
          id="loginId"
          type="text"
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          aria-label="아이디"
          placeholder="아이디"
          required
          className="
            h-11 w-full rounded-lg border border-gray-200
            bg-white pl-10 pr-4 text-sm outline-none transition
            placeholder:text-gray-400
            focus:border-[#ff7a3d]
          "
        />
      </div>

      {/* 비밀번호 */}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
          ♙
        </span>

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-label="비밀번호"
          placeholder="비밀번호"
          required
          className="
            h-11 w-full rounded-lg border border-gray-200
            bg-white pl-10 pr-12 text-sm outline-none transition
            placeholder:text-gray-400
            focus:border-[#ff7a3d]
          "
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute inset-y-0 right-3 text-xs text-gray-500"
        >
          {showPassword ? "숨김" : "보기"}
        </button>
      </div>

      {/* 로그인 */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="
          relative flex h-11 w-full items-center justify-center
          rounded-lg bg-linear-to-r from-[#ff8a45] to-[#ff6938]
          text-sm font-semibold text-white transition
          hover:opacity-90 disabled:opacity-60
        "
      >
        {loginMutation.isPending ? "로그인 중..." : "로그인"}

        {!loginMutation.isPending && (
          <span className="absolute right-4">→</span>
        )}
      </button>

      {loginMutation.isError && (
        <p className="text-center text-xs text-red-500">
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "로그인에 실패했습니다."}
        </p>
      )}

      {/* 구분선 */}
      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[11px] text-gray-400">또는</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

       {/* 소셜 로그인 */}
           <div className="flex justify-center gap-7">
            <button
              type="button"
              onClick={() => socialLogin("google")}
              aria-label="Google 로그인"
              className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.75 7.18l7.73 6C44.43 38.03 46.98 31.88 46.98 24.55z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.87 23.87 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            </button>

             <button
               type="button"
               onClick={() => socialLogin("kakao")}
               aria-label="Kakao 로그인"
               className="
                 flex h-16 w-16 items-center justify-center
                 rounded-full border border-gray-200
                 bg-white shadow-sm
                 transition hover:-translate-y-0.5 hover:shadow-md
               "
             >
               <span
                 className="
                   flex h-10 w-10 items-center justify-center
                   rounded-full bg-[#FEE500]
                   text-[18px] font-bold text-[#191919]
                 "
               >
                 K
               </span>
             </button>

             <button
               type="button"
               onClick={() => socialLogin("naver")}
               aria-label="Naver 로그인"
               className="
                 flex h-16 w-16 items-center justify-center
                 rounded-full border border-gray-200
                 bg-white shadow-sm
                 transition hover:-translate-y-0.5 hover:shadow-md
               "
             >
               <span className="text-[27px] font-black text-[#03C75A]">
                 N
               </span>
             </button>
           </div>
    </form>
  );
}