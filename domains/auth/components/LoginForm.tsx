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
          rounded-lg bg-gradient-to-r from-[#ff8a45] to-[#ff6938]
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
               className="
                 flex h-[64px] w-[64px] items-center justify-center
                 rounded-full border border-gray-200
                 bg-white shadow-sm
                 transition hover:-translate-y-0.5 hover:shadow-md
               "
             >
               <span className="text-[26px] font-bold text-[#4285F4]">
                 G
               </span>
             </button>

             <button
               type="button"
               onClick={() => socialLogin("kakao")}
               aria-label="Kakao 로그인"
               className="
                 flex h-[64px] w-[64px] items-center justify-center
                 rounded-full border border-gray-200
                 bg-white shadow-sm
                 transition hover:-translate-y-0.5 hover:shadow-md
               "
             >
               <span
                 className="
                   flex h-[40px] w-[40px] items-center justify-center
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
                 flex h-[64px] w-[64px] items-center justify-center
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