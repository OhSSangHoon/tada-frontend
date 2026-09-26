"use client";

import { FormEvent, useState } from "react";
import { useSignup } from "@/domains/auth/hooks/useSignup";

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const signupMutation = useSignup();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      return;
    }

    signupMutation.mutate({
      loginId,
      password,
      passwordConfirm,
      nickname,
    });
  };

  // 상훈 최신 로직 유지
  if (signupMutation.isSuccess) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1e6] text-xl text-[#ff7a3d]">
          ✓
        </div>

        <p className="mb-6 text-sm font-semibold text-gray-800">
          회원가입이 완료되었습니다.
        </p>

        <button
          type="button"
          onClick={onSuccess}
          className="
            h-11 w-full rounded-lg
            bg-gradient-to-r from-[#ff8a45] to-[#ff6938]
            text-sm font-semibold text-white
          "
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        id="loginId"
        type="text"
        value={loginId}
        onChange={(event) => setLoginId(event.target.value)}
        placeholder="아이디"
        required
        className="
          h-11 w-full rounded-lg border border-gray-200
          px-4 text-sm outline-none
          placeholder:text-gray-400 focus:border-[#ff7a3d]
        "
      />

      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          required
          className="
            h-11 w-full rounded-lg border border-gray-200
            px-4 pr-12 text-sm outline-none
            placeholder:text-gray-400 focus:border-[#ff7a3d]
          "
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-3 text-xs text-gray-500"
        >
          {showPassword ? "숨김" : "보기"}
        </button>
      </div>

      <div className="relative">
        <input
          id="passwordConfirm"
          type={showPasswordConfirm ? "text" : "password"}
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          placeholder="비밀번호 확인"
          required
          className="
            h-11 w-full rounded-lg border border-gray-200
            px-4 pr-12 text-sm outline-none
            placeholder:text-gray-400 focus:border-[#ff7a3d]
          "
        />

        <button
          type="button"
          onClick={() => setShowPasswordConfirm((prev) => !prev)}
          className="absolute inset-y-0 right-3 text-xs text-gray-500"
        >
          {showPasswordConfirm ? "숨김" : "보기"}
        </button>
      </div>

      <input
        id="nickname"
        type="text"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        placeholder="닉네임"
        required
        className="
          h-11 w-full rounded-lg border border-gray-200
          px-4 text-sm outline-none
          placeholder:text-gray-400 focus:border-[#ff7a3d]
        "
      />

      {password !== passwordConfirm && passwordConfirm.length > 0 && (
        <p className="text-xs text-red-500">
          비밀번호가 일치하지 않습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={
          signupMutation.isPending ||
          password !== passwordConfirm
        }
        className="
          relative flex h-11 w-full items-center justify-center
          rounded-lg bg-gradient-to-r from-[#ff8a45] to-[#ff6938]
          text-sm font-semibold text-white
          disabled:opacity-60
        "
      >
        {signupMutation.isPending ? "회원가입 중..." : "회원가입"}

        {!signupMutation.isPending && (
          <span className="absolute right-4">→</span>
        )}
      </button>

      {signupMutation.isError && (
        <p className="text-center text-xs text-red-500">
          {signupMutation.error instanceof Error
            ? signupMutation.error.message
            : "회원가입에 실패했습니다."}
        </p>
      )}
    </form>
  );
}