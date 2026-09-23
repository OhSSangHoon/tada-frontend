"use client";

import { FormEvent, useState } from "react";
import { useLogin } from "@/domains/auth/hooks/useLogin";
import { useSocialLogin } from "@/domains/auth/hooks/useSocialLogin";

// 로그인 성공 후 실행할 함수를 부모에게서 전달받는다.
interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // 비밀번호 표시/숨김 상태
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  // 소셜 로그인 기능
  const { socialLogin } = useSocialLogin(onSuccess);

  // 일반 로그인 버튼 클릭
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginMutation.mutate(
      {
        loginId,
        password,
      },
      {
        // 로그인 성공 시 부모가 전달한 함수를 실행한다.
        onSuccess,
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="loginId">아이디</label>
        <input
          id="loginId"
          type="text"
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          placeholder="아이디를 입력하세요"
          required
        />
      </div>

      <div>
        <label htmlFor="password">비밀번호</label>

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력하세요"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-pressed={showPassword}
        >
          {showPassword ? "숨기기" : "보기"}
        </button>
      </div>

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "로그인 중..." : "로그인"}
      </button>

      {loginMutation.isError && (
        <p>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "로그인에 실패했습니다."}
        </p>
      )}

      {/* 소셜 로그인 */}
      <div>
        <button type="button" onClick={() => socialLogin("google")}>
          Google 로그인
        </button>

        <button type="button" onClick={() => socialLogin("kakao")}>
          Kakao 로그인
        </button>

        <button type="button" onClick={() => socialLogin("naver")}>
          Naver 로그인
        </button>
      </div>
    </form>
  );
}
